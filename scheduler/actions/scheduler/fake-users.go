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

package scheduler

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/dchest/uniuri"
	"github.com/gosimple/slug"
	"github.com/micro/go-micro/client"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	fakeUserCreationActionName = "fake.users.creation"
)

type FakeUsersAction struct {
	prefix string
	number string
}

func (f *FakeUsersAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              fakeUserCreationActionName,
		Label:           "Fake Users",
		Icon:            "account-multiple-plus",
		Category:        actions.ActionCategoryIDM,
		Description:     "For debugging purpose, create many users using a remote API for generating names",
		SummaryTemplate: "",
		HasForm:         true,
	}
}

func (f *FakeUsersAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "number",
					Type:        forms.ParamString,
					Label:       "Number of users",
					Description: "Total number of users to create",
					Default:     "100",
					Mandatory:   true,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "prefix",
					Type:        forms.ParamString,
					Label:       "Ticks",
					Description: "Optional prefix to use for users logins",
					Default:     "user-",
					Mandatory:   false,
					Editable:    true,
				},
			},
		},
	}}
}

// GetName returns this action unique identifier
func (f *FakeUsersAction) GetName() string {
	return fakeUserCreationActionName
}

// Implement ControllableAction
func (f *FakeUsersAction) CanPause() bool {
	return false
}

// Implement ControllableAction
func (f *FakeUsersAction) CanStop() bool {
	return false
}

// ProvidesProgress mocks ProgressProviderAction interface method
func (f *FakeUsersAction) ProvidesProgress() bool {
	return true
}

// Init passes parameters to the action
func (f *FakeUsersAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	f.prefix = "user-"
	if prefix, ok := action.Parameters["prefix"]; ok {
		f.prefix = prefix
	}
	f.number = "200"
	if strNumber, ok := action.Parameters["number"]; ok {
		f.number = strNumber
	}
	return nil
}

// Run the actual action code
func (f *FakeUsersAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {
	log.TasksLogger(ctx).Info("Starting fake users creation")

	var number int64
	if n, err := strconv.ParseInt(jobs.EvaluateFieldStr(ctx, input, f.number), 10, 64); err == nil {
		number = n
	} else {
		return input.WithError(err), err
	}

	prefix := f.prefix
	if f.prefix != "" {
		prefix = jobs.EvaluateFieldStr(ctx, input, f.prefix)
	}

	outputMessage := input
	outputMessage.AppendOutput(&jobs.ActionOutput{StringBody: "Creating random users"})

	userServiceClient := idm.NewUserServiceClient(registry.GetClient(common.SERVICE_USER))
	rolesServiceClient := idm.NewRoleServiceClient(registry.GetClient(common.SERVICE_ROLE))
	builder := service.NewResourcePoliciesBuilder()

	groupPaths := []string{"/"}
	// Create Groups
	for _, g := range []string{"Sales", "Marketing", "Developers", "Support"} {
		groupName := slug.Make(g)
		groupPaths = append(groupPaths, "/"+groupName)
		if r, e := userServiceClient.CreateUser(ctx, &idm.CreateUserRequest{
			User: &idm.User{
				IsGroup:    true,
				GroupLabel: groupName,
				GroupPath:  "/" + groupName,
				Attributes: map[string]string{"displayName": g},
				Policies:   builder.Reset().WithProfileRead(common.PYDIO_PROFILE_STANDARD).WithProfileWrite(common.PYDIO_PROFILE_ADMIN).Policies(),
			},
		}); e == nil {
			rolesServiceClient.CreateRole(ctx, &idm.CreateRoleRequest{
				Role: &idm.Role{
					Uuid:      r.User.Uuid,
					Label:     slug.Make(groupName),
					GroupRole: true,
					Policies:  r.User.Policies,
				},
			})
		}
	}

	steps := float32(number)
	step := float32(0)
	rand.Seed(time.Now().Unix())
	type Value struct {
		Login  string
		Label  string
		Region string
	}
	var values []Value

	if response, err := http.Get(fmt.Sprintf("https://uinames.com/api/?region=france&amount=%d", number)); err == nil {
		if contents, err := ioutil.ReadAll(response.Body); err == nil {
			type Response struct {
				Name    string `json:"name"`
				Surname string `json:"surname"`
				Region  string `json:"region"`
				Gender  string `json:"gender"`
			}
			var data []*Response
			if e := json.Unmarshal(contents, &data); e == nil {
				for _, d := range data {
					label := fmt.Sprintf("%s %s", d.Name, d.Surname)
					values = append(values, Value{
						Label:  label,
						Login:  slug.Make(label),
						Region: d.Region,
					})
				}
			}
		}
		response.Body.Close()
	}
	if len(values) == 0 {
		for i := int64(0); i < number; i++ {
			s := uniuri.NewLen(4)
			login := fmt.Sprintf("%s-%s-%d", prefix, s, i+1)
			values = append(values, Value{
				Login:  login,
				Label:  login,
				Region: "France",
			})
		}
	}

	for i, v := range values {
		groupPath := groupPaths[rand.Intn(len(groupPaths))]
		if response, err := userServiceClient.CreateUser(ctx, &idm.CreateUserRequest{
			User: &idm.User{
				Login:     v.Login,
				Password:  "azeazeaze",
				GroupPath: groupPath,
				Attributes: map[string]string{
					"displayName": v.Label,
					"country":     v.Region,
					"profile":     "standard",
				},
				Policies: builder.Reset().WithStandardUserPolicies(v.Login).Policies(),
			},
		}); err != nil {
			output := input.WithError(err)
			return output, err
		} else {
			log.TasksLogger(ctx).Info("Created user " + v.Label)
			_, e := rolesServiceClient.CreateRole(ctx, &idm.CreateRoleRequest{
				Role: &idm.Role{
					Uuid:     response.User.Uuid,
					Label:    slug.Make(v.Label),
					UserRole: true,
					Policies: builder.Reset().WithStandardUserPolicies(v.Login).Policies(),
				},
			})
			if e != nil {
				return input.WithError(e), e
			}
		}
		step = float32(i)
		channels.Progress <- step / steps
		channels.StatusMsg <- "Created user " + v.Label
		<-time.After(50 * time.Millisecond)
	}

	return outputMessage, nil
}
