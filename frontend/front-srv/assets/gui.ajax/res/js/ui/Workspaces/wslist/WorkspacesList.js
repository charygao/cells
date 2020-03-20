/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
const {withVerticalScroll, ModernTextField} = Pydio.requireLib('hoc');
import WorkspaceEntry from './WorkspaceEntry'
import Repository from 'pydio/model/repository'
import MetaNodeProvider from 'pydio/model/meta-node-provider'
import ResourcesManager from 'pydio/http/resources-manager'
import {IconButton, Popover, FlatButton} from 'material-ui'
const {muiThemeable} = require('material-ui/styles');
import Color from 'color'

class Entries extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            toggleFilter: false,
            filterValue: ''
        };
    }

    computePagination(entries){
        if (!entries || !entries.length) {
            return {use: false}
        }
        const pageSize = 15;
        if (entries.length <= pageSize) {
            return {use: false}
        }
        let {page} = this.state;
        const {activeWorkspace} = this.props;
        if(!page) {
            page = 1;
            if(activeWorkspace){
                const wsIndex = entries.map(ws => ws.getId()).indexOf(activeWorkspace);
                if(wsIndex > -1) {
                    // Select page that shows active workspace
                    page = Math.floor(wsIndex / pageSize) + 1;
                }
            }
        }
        const max = Math.ceil(entries.length / pageSize);
        const sliceStart = (page - 1) * pageSize;
        const sliceEnd = Math.min((page) * pageSize, entries.length);
        let pages = [];
        for (let i = 1; i <= max; i ++) {
            pages.push(i);
        }
        return {
            use: true,
            sliceStart,
            sliceEnd,
            total: entries.length,
            pages,
            page,
            pageSize,
        }
    }

    renderPagination(pagination){
        const {titleStyle} = this.props;
        const {page, pages, sliceStart, sliceEnd, total} = pagination;
        const chevStyles = {style:{width: 36, height: 36, padding:6}, iconStyle:{color:titleStyle.color}};
        return (
            <div style={{display:'flex', backgroundColor:'rgba(0, 0, 0, 0.03)', color:titleStyle.color, alignItems:'center', justifyContent:'center', fontWeight:400}}>
                <IconButton iconClassName={"mdi mdi-chevron-left"} disabled={page === 1} onTouchTap={() => this.setState({page:page-1})} {...chevStyles}/>
                <div>{sliceStart+1}-{sliceEnd} of {total}</div>
                <IconButton iconClassName={"mdi mdi-chevron-right"} disabled={page === pages.length} onTouchTap={() => this.setState({page:page+1})} {...chevStyles}/>
            </div>
        );
    }


    render(){
        const {title, entries, filterHint, titleStyle, pydio, createAction, activeWorkspace, palette, buttonStyles, emptyState, nonActiveRoots} = this.props;
        const {toggleFilter, filterValue} = this.state;

        const filterFunc = (t, f, ws)=> (!t || !f || ws.getLabel().toLowerCase().indexOf(f.toLowerCase()) >= 0);

        let wss = entries.filter((ws) => filterFunc(toggleFilter, filterValue, ws));
        const pagination = this.computePagination(wss);
        if(pagination.use){
            wss = wss.slice(pagination.sliceStart, pagination.sliceEnd);
        }
        let uniqueResult;
        if(toggleFilter && filterValue && wss.length === 1 && wss[0].getId() !== activeWorkspace){
            uniqueResult = wss[0];
        }

        return (
            <div>
                {!toggleFilter &&
                    <div key="shared-title" className="section-title" style={titleStyle}>
                        <span style={{cursor:'pointer'}} title={filterHint} onClick={()=>{this.setState({toggleFilter: true})}}>
                            {title}
                            <span style={{fontSize: 12, opacity: '0.4',marginLeft: 3}} className={"mdi mdi-filter"}/>
                        </span>
                        {createAction}
                    </div>
                }
                {toggleFilter &&
                    <div key="shared-title" className="section-title" style={{...titleStyle, paddingLeft: 12, paddingRight: 8, textTransform: 'none', transition:'none'}}>
                        <ModernTextField
                            focusOnMount={true}
                            fullWidth={true}
                            style={{marginTop: -16, marginBottom: -16, top: -1}}
                            hintText={filterHint}
                            hintStyle={{fontWeight: 400}}
                            inputStyle={{fontWeight: 400, color:palette.primary1Color}}
                            value={filterValue}
                            onChange={(e,v) => {this.setState({filterValue:v})}}
                            onBlur={()=>{setTimeout(()=>{if(!filterValue) this.setState({toggleFilter:false})}, 150)}}
                            onKeyPress={(ev) =>  {
                                if(ev.key === 'Enter' && uniqueResult){
                                    pydio.triggerRepositoryChange(uniqueResult.getId());
                                    this.setState({filterValue:'', toggleFilter: false});
                                }
                            }}
                        />
                        {uniqueResult &&
                            <div style={{...buttonStyles.button, right: 28, lineHeight:'24px', fontSize:20, opacity: 0.5}}>
                                <span className={"mdi mdi-keyboard-return"}/>
                            </div>
                        }
                        <IconButton
                            key={"close-filter"}
                            iconClassName={"mdi mdi-close"}
                            style={buttonStyles.button}
                            iconStyle={buttonStyles.icon}
                            onTouchTap={()=>{this.setState({toggleFilter: false, filterValue:''})}}
                        />
                    </div>
                }
                <div className={"workspaces"}>
                    {wss.map((ws) => (
                        <WorkspaceEntry
                            pydio={pydio}
                            key={ws.getId()}
                            workspace={ws}
                            showFoldersTree={activeWorkspace && activeWorkspace===ws.getId()}
                            nonActiveRoot={nonActiveRoots[ws.getSlug()]}
                        />
                    ))}
                    {!entries.length && emptyState}
                    {pagination.use && this.renderPagination(pagination)}
                </div>
            </div>
        );

    }

}

class WorkspacesList extends React.Component{

    constructor(props, context){
        super(props, context);
        this.state = this.stateFromPydio(props.pydio);
        this._reloadObserver = () => {
            this.setState(this.stateFromPydio(this.props.pydio));
        };
    }

    shouldComponentUpdate(nextProps, nextState){
        return nextState.random !== this.state.random || nextState.popoverOpen !== this.state.popoverOpen;
    }

    stateFromPydio(pydio){
        const workspaces = pydio.user ? pydio.user.getRepositoriesList() : [];
        const wsList = [];
        workspaces.forEach(o => wsList.push(o));
        const notActives = wsList
            .filter(ws => !(pydio && pydio.user && pydio.user.activeRepository === ws.getId()))
            .filter(ws => ws.getNodeProviderDef() && ws.getNodeProviderDef().name === 'MetaNodeProvider');

        if(notActives.length) {
            this.loadNonActiveRoots(notActives);
        }
        return {
            random: Math.random(),
            workspaces,
            nonActiveRoots:{},
            activeWorkspace: pydio.user ? pydio.user.activeRepository : false,
            activeRepoIsHome: pydio.user && pydio.user.activeRepository === 'homepage'
        };
    }

    loadNonActiveRoots(workspaces){
        MetaNodeProvider.loadRoots(workspaces.map(ws => ws.getSlug())).then(nonActiveRoots => {
            this.setState({nonActiveRoots, random: Math.random()});
        }).catch(e => {
            this.setState({nonActiveRoots: {}, random: Math.random()});
        });
    }

    componentDidMount(){
        this.props.pydio.observe('repository_list_refreshed', this._reloadObserver);
    }

    componentWillUnmount(){
        this.props.pydio.stopObserving('repository_list_refreshed', this._reloadObserver);
    }

    createRepositoryEnabled(){
        return this.props.pydio.getPluginConfigs("auth").get("USER_CREATE_CELLS");
    }

    render(){
        let createAction;
        const {workspaces,activeWorkspace, nonActiveRoots, popoverOpen, popoverAnchor, popoverContent} = this.state;
        const {pydio, className, muiTheme, sectionTitleStyle} = this.props;

        // Split Workspaces from Cells
        let wsList = [];
        workspaces.forEach(o => wsList.push(o));
        wsList = wsList.filter(ws => !Repository.isInternal(ws.getId()));
        wsList.sort((oA, oB) => {
            const res = oA.getLabel().localeCompare(oB.getLabel(), undefined, {numeric: true});
            if (res === 0) {
                return oA.getSlug().localeCompare(oB.getSlug());
            } else {
                return res;
            }
        });
        let entries = wsList.filter(ws => !ws.getOwner());
        let sharedEntries = wsList.filter(ws => ws.getOwner());


        const messages = pydio.MessageHash;

        const createClick = function(event){
            const target = event.target;
            ResourcesManager.loadClassesAndApply(['ShareDialog'], () => {
                this.setState({
                    popoverOpen: true,
                    popoverAnchor: target,
                    popoverContent: <ShareDialog.CreateCellDialog pydio={pydio} onDismiss={()=> {this.setState({popoverOpen: false})}}/>
                })
            })
        }.bind(this);

        const buttonStyles = {
            button: {
                width: 36,
                height: 36,
                padding: 6,
                position:'absolute',
                right: 4,
                top: 8
            },
            icon : {
                fontSize: 22,
                color: muiTheme.palette.primary1Color //'rgba(0,0,0,.54)'
            }
        };

        if(this.createRepositoryEnabled() && sharedEntries.length){
            createAction = <IconButton
                key={"create-cell"}
                style={buttonStyles.button}
                iconStyle={buttonStyles.icon}
                iconClassName={"mdi mdi-plus"}
                tooltip={messages[417]}
                tooltipPosition={"top-left"}
                onTouchTap={createClick}
            />
        }


        let classNames = ['user-workspaces-list'];
        if(className) {
            classNames.push(className);
        }

        return (
            <div className={classNames.join(' ')}>
                <Popover
                    open={popoverOpen}
                    anchorEl={popoverAnchor}
                    useLayerForClickAway={true}
                    onRequestClose={() => {this.setState({popoverOpen: false})}}
                    anchorOrigin={sharedEntries.length ? {horizontal:"left",vertical:"top"} : {horizontal:"left",vertical:"bottom"}}
                    targetOrigin={sharedEntries.length ? {horizontal:"left",vertical:"top"} : {horizontal:"left",vertical:"bottom"}}
                    zDepth={3}
                    style={{borderRadius:6, overflow: 'hidden', marginLeft:sharedEntries.length?-10:0, marginTop:sharedEntries.length?-10:0}}
                >{popoverContent}</Popover>
                {entries.length > 0 &&
                    <Entries
                        title={messages[468]}
                        entries={entries}
                        filterHint={messages['ws.quick-filter']}
                        titleStyle={{...sectionTitleStyle, marginTop:5, position:'relative', overflow:'visible', transition:'none'}}
                        pydio={pydio}
                        activeWorkspace={activeWorkspace}
                        nonActiveRoots={nonActiveRoots}
                        palette={muiTheme.palette}
                        buttonStyles={buttonStyles}
                    />
                }
                <Entries
                    title={messages[469]}
                    entries={sharedEntries}
                    filterHint={messages['cells.quick-filter']}
                    titleStyle={{...sectionTitleStyle, position:'relative', overflow:'visible', transition:'none'}}
                    pydio={pydio}
                    createAction={createAction}
                    activeWorkspace={activeWorkspace}
                    nonActiveRoots={nonActiveRoots}
                    palette={muiTheme.palette}
                    buttonStyles={buttonStyles}
                    emptyState={
                        <div style={{textAlign: 'center', color: Color(muiTheme.palette.primary1Color).fade(0.6).toString()}}>
                            <div className="icomoon-cells" style={{fontSize: 80}}></div>
                            {this.createRepositoryEnabled() && <FlatButton style={{color: muiTheme.palette.accent2Color, marginTop:5}} primary={true} label={messages[418]} onTouchTap={createClick}/>}
                            <div style={{fontSize: 13, padding: '5px 20px'}}>{messages[633]}</div>
                        </div>
                    }
                />
            </div>
        );
    }
}

WorkspacesList.PropTypes =   {
    pydio                   : React.PropTypes.instanceOf(Pydio),
    workspaces              : React.PropTypes.instanceOf(Map),
    onHoverLink             : React.PropTypes.func,
    onOutLink               : React.PropTypes.func,
    className               : React.PropTypes.string,
    style                   : React.PropTypes.object,
    sectionTitleStyle       : React.PropTypes.object,
    filterByType            : React.PropTypes.oneOf(['shared', 'entries', 'create'])
};


WorkspacesList = withVerticalScroll(WorkspacesList);
WorkspacesList = muiThemeable()(WorkspacesList);

export {WorkspacesList as default}