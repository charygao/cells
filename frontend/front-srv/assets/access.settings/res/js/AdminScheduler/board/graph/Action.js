import {shapes} from 'jointjs'
import {
    Blue,
    BlueRect,
    BoxSize,
    DarkGrey,
    Grey,
    IconToUnicode,
    LightIcon,
    LightLabel,
    Orange,
    PortsConfig,
    positionFilters, Stale,
    TextIconFilterMarkup
} from "./Configs";
import {JOB_ACTION_EMPTY} from "../actions/editor";
import {JobsAction} from 'pydio/http/rest-api';
import ActionFilter from "./ActionFilter";

class Action extends shapes.devs.Model{

    _edit;
    _leftFilter;
    _leftSelector;

    static createEmptyAction(descriptions){
        return new Action(descriptions, JobsAction.constructFromObject({ID:JOB_ACTION_EMPTY}), true);
    }

    /**
     *
     * @param descriptions
     * @param action {JobsAction}
     * @param edit boolean open in edit mode
     */
    constructor(descriptions, action, edit = false){

        let iconCode = IconToUnicode("chip");
        if(descriptions && descriptions[action.ID] && descriptions[action.ID].Icon){
            iconCode = IconToUnicode(descriptions[action.ID].Icon);
        }

        const config = {
            size: { ...BoxSize, fill: 'transparent' ,rx: 5,ry: 5, 'stroke-width':1.5,  'stroke': '#31d0c6' },
            inPorts: ['input'],
            markup: TextIconFilterMarkup,
            attrs: {
                rect: { ...BoxSize, ...BlueRect},
                icon: {text: iconCode, ...LightIcon},
                text: { text: Action.computeLabel(action, descriptions) , ...LightLabel},
                'separator': {display:'none', x1:44, y1:0, x2: 44, y2:BoxSize.height, stroke: 'white', 'stroke-width': 1.5, 'stroke-dasharray': '3 3'},
                'filter-rect': {display:'none', fill: 'white', refX: 10, refY: '50%', refY2: -12, width: 24, height: 24, rx: 12, ry:12, event:'element:filter:pointerdown'},
                'filter-icon': {display:'none', text: IconToUnicode('filter'), ...LightIcon, fill: Orange, refX: 22, refY:'50%', refY2: -3, event:'element:filter:pointerdown'},
                'filter-count':{display:'none', refX: 33},
                'selector-rect': {display:'none', fill: 'white', refX: 10, refY: '50%', refY2: -12, width: 24, height: 24, rx: 12, ry:12, event:'element:selector:pointerdown'},
                'selector-icon': {display:'none', text: IconToUnicode('magnify'), ...LightIcon, fill: Stale, refX: 22, refY:'50%', refY2: -3, event:'element:selector:pointerdown'},
                'selector-count':{display:'none', refX: 33},
                'legend':{display: 'none', fill: Grey, refX: '50%', refY: '110%', 'text-anchor': 'middle'}
            },
            ports:PortsConfig
        };

        if (action.ChainedActions || edit) {
            config.outPorts = ['output'];
        }

        super(config);
        this._edit = edit;
        this._descriptions = descriptions;
        this.notifyJobModel(action);
    }

    clearSelection(){
        this.attr('rect/stroke', Blue);
        this.attr('filter-rect/stroke', 'transparent');
        this.attr('selector-rect/stroke', 'transparent');
    }

    select(){
        this.attr('rect/stroke', Orange);
    }

    selectFilter(){
        this.attr('filter-rect/stroke', DarkGrey);
        this.attr('filter-rect/stroke-width', 2);
        this.attr('filter-rect/stroke-dasharray', '3px 2px');
    }

    selectSelector(){
        this.attr('selector-rect/stroke', DarkGrey);
        this.attr('selector-rect/stroke-width', 2);
        this.attr('selector-rect/stroke-dasharray', '3px 2px');
    }

    notifyJobModel(action){
        this._jobModel = action;
        action.model = this;
        this.setFilter(0);
        this.setSelector( (action.NodesSelector?1:0) + (action.IdmSelector?1:0)  + (action.UsersSelector?1:0));
        this.attr('text/text', Action.computeLabel(action, this._descriptions))
    }

    static computeLabel(action, descriptions){
        let aName;
        if(action.Label){
            aName = action.Label;
        } else if(descriptions && descriptions[action.ID] && descriptions[action.ID].Label){
            aName = descriptions[action.ID].Label
        } else {
            const parts = action.ID.split(".");
            aName = parts.pop();
        }
        return aName
    }

    setFilter(b){
        this._leftFilter = b;
        positionFilters(this, BoxSize, this._leftFilter, this._leftSelector);
    }

    setSelector(b){
        this._leftSelector = b;
        positionFilters(this, BoxSize, this._leftFilter, this._leftSelector);
    }

    toggleEdit(){
        this._edit = !this._edit;
        // Show out port in edit mode even if no actions
        if(!this._jobModel.ChainedActions || !this._jobModel.ChainedActions.length) {
            if(this._edit){
                this.addOutPort('output')
            } else {
                this.removeOutPort('output')
            }
        }
    }

    showLegend(legendText){
        this.attr('legend/display', 'block');
        this.attr('legend/text', legendText);
    }

    hideLegend(){
        this.attr('legend/display', 'none');
    }

    /**
     *
     * @return {JobsAction}
     */
    getJobsAction(){
        return this._jobModel;
    }

    getActionFilter() {
        if (this._jobModel.NodesFilter || this._jobModel.IdmFilter || this._jobModel.UsersFilter || this._jobModel.ContextMetaFilter || this._jobModel.ActionOutputFilter) {
            return new ActionFilter(this._jobModel);
        } else {
            return null;
        }
    }

}

export default Action;