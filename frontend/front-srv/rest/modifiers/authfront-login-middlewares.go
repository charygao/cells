package modifiers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/emicklei/go-restful"
	"github.com/gorilla/sessions"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/frontend"
	"github.com/pydio/cells/common/utils/permissions"
)

// LoginSuccessWrapper wraps functionalities after user was successfully logged in
func LoginSuccessWrapper(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {
	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {
		if a, ok := in.AuthInfo["type"]; !ok || a != "credentials" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}
		// BEFORE MIDDLEWARE

		// MIDDLEWARE
		err := middleware(req, rsp, in, out, session)
		if err != nil {
			return err
		}

		// AFTER MIDDLEWARE

		// retrieving user
		username, ok := in.AuthInfo["login"]
		if !ok {
			return errors.New("user.not_found", "User id not found", http.StatusNotFound)
		}

		ctx := req.Request.Context()

		// Searching user for attributes
		user, err := permissions.SearchUniqueUser(ctx, username, "")
		if err != nil {
			return err
		}

		// Checking user is locked
		if permissions.IsUserLocked(user) {
			log.Auditer(ctx).Error(
				"Locked user ["+user.Login+"] tried to log in.",
				log.GetAuditId(common.AUDIT_LOGIN_POLICY_DENIAL),
				zap.String(common.KEY_USER_UUID, user.Uuid),
			)
			log.Logger(ctx).Error("lock denies login for "+user.Login, zap.Error(fmt.Errorf("blocked login")))
			return errors.Unauthorized(common.SERVICE_USER, "User "+user.Login+" has been blocked. Contact your sysadmin.")
		}

		// Reset failed connections
		if user.Attributes != nil {
			if _, ok := user.Attributes["failedConnections"]; ok {
				log.Logger(ctx).Info("[WrapWithUserLocks] Resetting user failedConnections", user.ZapLogin())
				userClient := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
				delete(user.Attributes, "failedConnections")
				userClient.CreateUser(ctx, &idm.CreateUserRequest{User: user})
			}
		}

		// Checking policies
		cli := idm.NewPolicyEngineServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_POLICY, defaults.NewClient())
		policyContext := make(map[string]string)
		permissions.PolicyContextFromMetadata(policyContext, ctx)
		subjects := permissions.PolicyRequestSubjectsFromUser(user)

		// Check all subjects, if one has deny return false
		policyRequest := &idm.PolicyEngineRequest{
			Subjects: subjects,
			Resource: "oidc",
			Action:   "login",
			Context:  policyContext,
		}

		if resp, err := cli.IsAllowed(ctx, policyRequest); err != nil || resp.Allowed == false {
			log.Auditer(ctx).Error(
				"Policy denied login to ["+user.Login+"]",
				log.GetAuditId(common.AUDIT_LOGIN_POLICY_DENIAL),
				zap.String(common.KEY_USER_UUID, user.Uuid),
				zap.Any(common.KEY_POLICY_REQUEST, policyRequest),
				zap.Error(err),
			)
			log.Logger(ctx).Error("policy denies login for request", zap.Any(common.KEY_POLICY_REQUEST, policyRequest), zap.Error(err))
			return errors.Unauthorized(common.SERVICE_USER, "User "+user.Login+" is not authorized to log in")
		}

		// Redirecting if needed
		challenge, ok := in.AuthInfo["challenge"]
		if challenge != "" {

		}

		return nil
	}
}

// LoginFailedWrapper wraps functionalities after user failed to log in
func LoginFailedWrapper(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {
	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {
		if a, ok := in.AuthInfo["type"]; !ok || a != "credentials" && a != "external" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		// MIDDLEWARE
		err := middleware(req, rsp, in, out, session)
		if err == nil {
			return nil
		}

		ctx := req.Request.Context()

		username := in.AuthInfo["login"]

		const maxFailedLogins = 10

		// Searching user for attributes
		user, _ := permissions.SearchUniqueUser(ctx, username, "")

		if user == nil {
			return nil
		}

		// double check if user was already locked to reduce work load
		if permissions.IsUserLocked(user) {
			msg := fmt.Sprintf("locked user %s is still trying to connect", user.GetLogin())
			log.Logger(ctx).Warn(msg, user.ZapLogin())
			return err
		}

		var failedInt int64
		if user.Attributes == nil {
			user.Attributes = make(map[string]string)
		}
		if failed, ok := user.Attributes["failedConnections"]; ok {
			failedInt, _ = strconv.ParseInt(failed, 10, 32)
		}
		failedInt++
		user.Attributes["failedConnections"] = fmt.Sprintf("%d", failedInt)

		if failedInt >= maxFailedLogins {
			// Set lock via attributes
			var locks []string
			if l, ok := user.Attributes["locks"]; ok {
				var existingLocks []string
				if e := json.Unmarshal([]byte(l), &existingLocks); e == nil {
					for _, lock := range existingLocks {
						if lock != "logout" {
							locks = append(locks, lock)
						}
					}
				}
			}
			locks = append(locks, "logout")
			data, _ := json.Marshal(locks)
			user.Attributes["locks"] = string(data)
			msg := fmt.Sprintf("Locked user [%s] after %d failed connections", user.GetLogin(), maxFailedLogins)
			log.Logger(ctx).Error(msg, user.ZapLogin())
			log.Auditer(ctx).Error(
				msg,
				log.GetAuditId(common.AUDIT_LOCK_USER),
				user.ZapLogin(),
				zap.String(common.KEY_USER_UUID, user.GetUuid()),
			)
		}

		log.Logger(ctx).Debug(fmt.Sprintf("[WrapWithUserLocks] Updating failed connection number for user [%s]", user.GetLogin()), user.ZapLogin())
		userClient := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
		if _, e := userClient.CreateUser(ctx, &idm.CreateUserRequest{User: user}); e != nil {
			log.Logger(ctx).Error("could not store failedConnection for user", zap.Error(e))
		}

		return err
	}
}
