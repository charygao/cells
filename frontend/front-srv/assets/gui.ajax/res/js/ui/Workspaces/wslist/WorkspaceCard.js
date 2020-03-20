/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Pydio from 'pydio'
import ResourcesManager from 'pydio/http/resources-manager'

const {GenericCard, GenericLine} = Pydio.requireLib('components');

class WorkspaceCard extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
        const {rootNode} = this.props;
        if(rootNode.getMetadata().has('virtual_root')){
            // Use node children instead
            if(rootNode.isLoaded()){
                this.state.rootNodes = [];
                rootNode.getChildren().forEach(n => this.state.rootNodes.push(n));
            } else {
                // Trigger children load
                rootNode.observeOnce('loaded', () => {
                    const rootNodes = [];
                    rootNode.getChildren().forEach(n => rootNodes.push(n));
                    this.setState({rootNodes});
                });
                rootNode.load();
            }
        } else {
            this.state.rootNodes = [rootNode];
        }
        ResourcesManager.loadClassesAndApply(["PydioActivityStreams"], () => {
            this.setState({ASLib: true})
        });
        ResourcesManager.loadClassesAndApply(["PydioCoreActions"], () => {
            this.setState({CALib: true})
        });
    }

    render(){

        const {pydio, workspace, onDismiss} = this.props;
        const {rootNodes} = this.state;
        const {ASLib, CALib} = this.state;

        let watchLine, bookmarkAction;
        if(pydio.getPluginConfigs('core.activitystreams').get('ACTIVITY_SHOW_ACTIVITIES') && ASLib && rootNodes){

            const selector = <PydioActivityStreams.WatchSelector pydio={pydio} nodes={rootNodes}/>;
            watchLine = <GenericLine iconClassName={"mdi mdi-bell-outline"} legend={"Get notifications..."} iconStyle={{marginTop:32}} data={selector}/>

        }
        if (CALib && rootNodes){
            bookmarkAction = <PydioCoreActions.BookmarkButton pydio={pydio} nodes={rootNodes} styles={{iconStyle:{color:'white'}}}/>;
        }

        return (
            <GenericCard
                pydio={pydio}
                title={workspace.getLabel()}
                onDismissAction={onDismiss}
                style={{width: 350}}
                otherActions={[bookmarkAction]}
            >
                {workspace.getDescription() &&
                    <GenericLine iconClassName="mdi mdi-information" legend={"Description"} data={workspace.getDescription()}/>
                }
                {watchLine}
            </GenericCard>
        );


    }

}

export default WorkspaceCard