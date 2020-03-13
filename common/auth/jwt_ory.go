/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package auth

import (
	"context"
	"encoding/json"
	"net/url"

	"github.com/ory/fosite"
	"github.com/ory/fosite/token/jwt"
	"github.com/ory/hydra/oauth2"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	goauth "golang.org/x/oauth2"

	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/auth/hydra"
	"github.com/pydio/cells/common/log"
)

type oryprovider struct {
	oauth2Provider fosite.OAuth2Provider
}

type orytoken struct {
	claims *jwt.IDTokenClaims
}

func RegisterOryProvider(o fosite.OAuth2Provider) {
	p := new(oryprovider)

	p.oauth2Provider = o

	addProvider(p)
}

func (p *oryprovider) GetType() ProviderType {
	return ProviderTypeOry
}

func (p *oryprovider) LoginChallengeCode(ctx context.Context, claims claim.Claims, opts ...TokenOption) (string, error) {
	v := url.Values{}
	for _, opt := range opts {
		opt.setValue(v)
	}

	// Getting or creating challenge
	challenge := v.Get("challenge")
	if challenge == "" {
		if c, err := hydra.CreateLogin("cells-frontend", []string{"openid", "profile", "offline"}, []string{}); err != nil {
			return "", err
		} else {
			challenge = c.Challenge
		}
	}

	// Searching login challenge
	login, err := hydra.GetLogin(challenge)
	if err != nil {
		log.Logger(ctx).Error("Failed to get login ", zap.Error(err))
		return "", err
	}

	// Accepting login challenge
	if _, err := hydra.AcceptLogin(challenge, claims.Subject); err != nil {
		log.Logger(ctx).Error("Failed to accept login ", zap.Error(err))
		return "", err
	}

	// Creating consent
	consent, err := hydra.CreateConsent(challenge)
	if err != nil {
		log.Logger(ctx).Error("Failed to create consent ", zap.Error(err))
		return "", err
	}

	// Accepting consent
	if _, err := hydra.AcceptConsent(
		consent.Challenge,
		login.GetRequestedScope(),
		login.GetRequestedAudience(),
		map[string]string{},
		map[string]string{
			"name":  claims.Name,
			"email": claims.Email,
		},
	); err != nil {
		log.Logger(ctx).Error("Failed to accept consent ", zap.Error(err))
		return "", err
	}

	requestURL, err := url.Parse(login.GetRequestURL())
	if err != nil {
		return "", err
	}

	requestURLValues := requestURL.Query()

	redirectURL, err := fosite.GetRedirectURIFromRequestValues(requestURLValues)
	if err != nil {
		return "", err
	}

	code, err := hydra.CreateAuthCode(consent, login.GetClientID(), redirectURL)
	if err != nil {
		log.Logger(ctx).Error("Failed to create auth code ", zap.Error(err))
		return "", err
	}

	if err != nil {
		return "", err
	}

	return code, err
}

func (p *oryprovider) PasswordCredentialsCode(ctx context.Context, userName string, password string, opts ...TokenOption) (string, error) {

	v := url.Values{}
	for _, opt := range opts {
		opt.setValue(v)
	}

	// Getting or creating challenge
	challenge := v.Get("challenge")
	if challenge == "" {
		if c, err := hydra.CreateLogin("cells-frontend", []string{"openid", "profile", "offline"}, []string{}); err != nil {
			return "", err
		} else {
			challenge = c.Challenge
		}
	}

	var identity Identity
	var valid bool
	var err error

	connectors := GetConnectors()
	for _, c := range connectors {
		cc, ok := c.Conn().(PasswordConnector)
		if !ok {
			continue
		}

		identity, valid, err = cc.Login(ctx, Scopes{}, userName, password)
		// Error means the user is unknwown to the system, we contine to the next round
		if err != nil {
			continue
		}

		// Invalid means we found the user but did not match the password
		if !valid {
			err = errors.New("password does not match")
			continue
		}

		break
	}

	if err != nil {
		return "", err
	}

	// Searching login challenge
	login, err := hydra.GetLogin(challenge)
	if err != nil {
		log.Logger(ctx).Error("Failed to get login ", zap.Error(err))
		return "", err
	}

	// Accepting login challenge
	if _, err := hydra.AcceptLogin(challenge, identity.UserID); err != nil {
		log.Logger(ctx).Error("Failed to accept login ", zap.Error(err))
		return "", err
	}

	// Creating consent
	consent, err := hydra.CreateConsent(challenge)
	if err != nil {
		log.Logger(ctx).Error("Failed to create consent ", zap.Error(err))
		return "", err
	}

	// Accepting consent
	if _, err := hydra.AcceptConsent(
		consent.Challenge,
		login.GetRequestedScope(),
		login.GetRequestedAudience(),
		map[string]string{},
		map[string]string{
			"name":  identity.Username,
			"email": identity.Email,
		},
	); err != nil {
		log.Logger(ctx).Error("Failed to accept consent ", zap.Error(err))
		return "", err
	}

	requestURL, err := url.Parse(login.GetRequestURL())
	if err != nil {
		return "", err
	}

	requestURLValues := requestURL.Query()

	redirectURL, err := fosite.GetRedirectURIFromRequestValues(requestURLValues)
	if err != nil {
		return "", err
	}

	code, err := hydra.CreateAuthCode(consent, login.GetClientID(), redirectURL)
	if err != nil {
		log.Logger(ctx).Error("Failed to create auth code ", zap.Error(err))
		return "", err
	}

	if err != nil {
		return "", err
	}

	return code, err
}

func (p *oryprovider) PasswordCredentialsToken(ctx context.Context, userName string, password string) (*goauth.Token, error) {

	// Getting or creating challenge
	c, err := hydra.CreateLogin("cells-frontend", []string{"openid", "profile", "offline"}, []string{})
	if err != nil {
		return nil, errors.Wrap(err, "PasswordCredentialsToken")
	}
	challenge := c.Challenge

	var identity Identity
	var valid bool

	connectors := GetConnectors()
	attempt := 0
	for _, c := range connectors {
		cc, ok := c.Conn().(PasswordConnector)
		if !ok {
			continue
		}

		attempt++

		identity, valid, err = cc.Login(ctx, Scopes{}, userName, password)
		// Error means the user is unknwown to the system, we contine to the next round
		if err != nil {
			continue
		}

		// Invalid means we found the user but did not match the password
		if !valid {
			err = errors.New("password does not match")
			continue
		}

		break
	}

	if attempt == 0 {
		return nil, errors.New("No password connector found")
	}

	if err != nil {
		return nil, err
	}

	// Searching login challenge
	login, err := hydra.GetLogin(challenge)
	if err != nil {
		log.Logger(ctx).Error("Failed to get login ", zap.Error(err))
		return nil, err
	}

	// Accepting login challenge
	if _, err := hydra.AcceptLogin(challenge, identity.UserID); err != nil {
		log.Logger(ctx).Error("Failed to accept login ", zap.Error(err))
		return nil, err
	}

	// Creating consent
	consent, err := hydra.CreateConsent(challenge)
	if err != nil {
		log.Logger(ctx).Error("Failed to create consent ", zap.Error(err))
		return nil, err
	}

	// Accepting consent
	if _, err := hydra.AcceptConsent(
		consent.Challenge,
		login.GetRequestedScope(),
		login.GetRequestedAudience(),
		map[string]string{},
		map[string]string{
			"name":  identity.Username,
			"email": identity.Email,
		},
	); err != nil {
		log.Logger(ctx).Error("Failed to accept consent ", zap.Error(err))
		return nil, err
	}

	requestURL, err := url.Parse(login.GetRequestURL())
	if err != nil {
		return nil, err
	}

	requestURLValues := requestURL.Query()

	redirectURL, err := fosite.GetRedirectURIFromRequestValues(requestURLValues)
	if err != nil {
		return nil, err
	}

	code, err := hydra.CreateAuthCode(consent, login.GetClientID(), redirectURL)
	if err != nil {
		e := fosite.ErrorToRFC6749Error(err)
		log.Logger(ctx).Error("Failed to create auth code ", zap.Error(e))
		return nil, err
	}

	if err != nil {
		return nil, err
	}

	return hydra.Exchange(code)
}

func (c *oryprovider) Logout(ctx context.Context, requestUrl, username, sessionID string, opts ...TokenOption) error {
	v := url.Values{}
	for _, opt := range opts {
		opt.setValue(v)
	}

	logout, err := hydra.CreateLogout(requestUrl, username, sessionID)
	if err != nil {
		return err
	}

	if err := hydra.AcceptLogout(logout.Challenge, v.Get("access_token"), v.Get("refresh_token")); err != nil {
		return err
	}

	return nil
}

func (c *oryprovider) Verify(ctx context.Context, accessToken string) (IDToken, error) {

	session := oauth2.NewSession("")

	tokenType, ar, err := c.oauth2Provider.IntrospectToken(ctx, accessToken, fosite.AccessToken, session)
	if err != nil {
		return nil, err
	}

	if tokenType != fosite.AccessToken {
		return nil, errors.New("Only access tokens are allowed in the authorization header")
	}

	return &orytoken{ar.GetSession().(*oauth2.Session).IDTokenClaims()}, nil
}

func (t *orytoken) Claims(v interface{}) error {

	data, err := json.Marshal(t.claims.ToMap())
	if err != nil {
		return err
	}

	if err := json.Unmarshal(data, &v); err != nil {
		return err
	}

	return nil
}
