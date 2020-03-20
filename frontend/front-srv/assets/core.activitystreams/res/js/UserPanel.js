/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */
import React from 'react'
import {Badge, IconButton, Popover, Divider, List} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import Client from './Client'
import ActivityList from './ActivityList'
import debounce from 'lodash.debounce'
import Color from 'color'

class UserPanel extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            unreadStatus: 0,
            open: false,
            data: [],
        };
        this.reloadData = debounce(this.reloadData.bind(this), 500);
        this.reloadUnread = debounce(this.reloadUnread.bind(this), 500);
    }

    reloadData() {
        Client.loadActivityStreams('USER_ID', this.props.pydio.user.id, 'inbox').then((json) => {
            this.setState({data: json});
        }).catch(msg => {
            this.setState({error: msg});
        });
    }

    reloadUnread() {
        Client.UnreadInbox(this.props.pydio.user.id).then((count) => {
            this.setState({unreadStatus: count});
        }).catch(msg => {});
    }

    onStatusChange(){
        if(this.props.onUnreadStatusChange){
            this.props.onUnreadStatusChange(this.state.unreadStatus);
        }
    }

    handleTouchTap(event) {
        // This prevents ghost click.
        event.preventDefault();
        //if(this.state.unreadStatus){
            //this.updateAlertsLastRead();
        //}
        this.reloadData();
        this.setState({
            open: true,
            anchorEl: event.currentTarget,
            unreadStatus: 0
        }, this.onStatusChange.bind(this));
    }

    handleRequestClose() {
        this.setState({
            open: false,
        });
    }

    componentWillMount() {
        this.reloadUnread();
        this.props.pydio.observe('websocket_event:activity', (event) => {
            if (this.state.open) {
                this.reloadData();
            } else {
                this.reloadUnread();
            }
        })
    }

    render() {
        const {pydio, iconStyle, muiTheme} = this.props;
        const {open, anchorEl, unreadStatus} = this.state;
        let buttonStyle = {borderRadius: '50%'};
        if(open && iconStyle && iconStyle.color){
            buttonStyle = {...buttonStyle, backgroundColor: Color(iconStyle.color).fade(0.9).toString()}
        }
        return (
            <span>
                <div
                    style={{position:'relative', display:'inline-block'}}

                    badgeContent={this.state.unreadStatus}
                    secondary={true}
                    badgeStyle={this.state.unreadStatus ? null : {display: 'none'}}
                >
                    <IconButton
                        onTouchTap={this.handleTouchTap.bind(this)}
                        iconClassName={this.props.iconClassName || "icon-bell"}
                        tooltip={(unreadStatus ? unreadStatus + ' ' : '') + this.props.pydio.MessageHash['notification_center.4']}
                        className="userActionButton alertsButton"
                        iconStyle={iconStyle}
                        style={buttonStyle}
                    />
                    {unreadStatus > 0 &&
                    <div style={{width: 6, height:6, borderRadius:'50%', top: 9, right: 6, position:'absolute', backgroundColor:muiTheme.palette.accent1Color}}></div>
                    }
                </div>
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={this.handleRequestClose.bind(this)}
                    style={{width:320}}
                    zDepth={2}

                >
                    <div style={{display: 'flex', alignItems: 'center', borderRadius:'2px 2px 0 0', padding: '12px 16px', width: '100%',
                        backgroundColor: 'rgb(238, 238, 238)', borderBottom: '1px solid rgb(224, 224, 224)'}}>{pydio.MessageHash['notification_center.1']}</div>
                    {this.state.data &&
                        <ActivityList
                            items={this.state.data.items}
                            style={{overflowY:'scroll', maxHeight: 330, paddingTop: 20}}
                            groupByDate={true}
                            displayContext={"popover"}
                        />}
                </Popover>
            </span>
        );
    }

}

UserPanel = muiThemeable()(UserPanel);

export {UserPanel as default};