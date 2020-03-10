import {
    JobsActionOutputFilter,
    JobsContextMetaFilter,
    JobsIdmSelector,
    JobsNodesSelector,
    JobsUsersSelector
} from 'pydio/http/rest-api'

const Blue = '#2196f3';
const DarkGrey = '#424242';
const LightGrey = '#e0e0e0';
const Grey = '#9e9e9e';
const White = '#ffffff';
const Orange= '#ff9800';
const Stale = '#607D8B';
const Destructive = '#ef534f';

const BoxSize = {width: 150, height: 64};
const FilterBoxSize = {width: 64, height: 64};

const dropShadow = {
    name: 'dropShadow',
    args: {
        opacity: 0.1,
        dx: 1,
        dy: 1,
        blur: 5
    }
};

const TextIconMarkup = [{
    tagName: 'rect',
    selector: 'rect',
}, {
    tagName: 'text',
    selector: 'icon'
}, {
    tagName: 'text',
    selector: 'text'
}];

const RoundIconMarkup = [{
    tagName: 'circle',
    selector: 'circle',
}, {
    tagName: 'text',
    selector: 'icon'
},{
    tagName: 'text',
    selector: 'type-icon-outline'
}, {
    tagName: 'text',
    selector: 'type-icon'
}, {
    tagName: 'text',
    selector: 'text'
}];

const TextIconFilterMarkup = [{
    tagName: 'rect',
    selector: 'rect',
}, {
    tagName: 'text',
    selector: 'icon'
}, {
    tagName: 'text',
    selector: 'text'
}, {
    tagName: 'line',
    selector: 'separator'
}, {
    tagName: 'rect',
    selector: 'filter-rect'
}, {
    tagName: 'text',
    selector: 'filter-icon'
}, {
    tagName: 'text',
    selector: 'filter-count'
}, {
    tagName: 'rect',
    selector: 'selector-rect'
}, {
    tagName: 'text',
    selector: 'selector-icon'
}, {
    tagName: 'text',
    selector: 'selector-count'
}, {
    tagName: 'text',
    selector: 'legend'
}];

const SimpleIconMarkup = [{
    tagName: 'rect',
    selector: 'rect',
}, {
    tagName: 'text',
    selector: 'icon'
}];

const ClusterConfig = {
    size: {width: 420, height: 104},
    attrs:{rect: {width: 420, height: 104, rx: 5, ry: 5, fill: 'transparent', stroke: LightGrey, 'stroke-width': 2, strokeDasharray: '5,2' }}
};

const PortsConfig = {
    groups: {
        'in': {
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke:'white',
                    'stroke-width':1.5,
                    r:5,
                    magnet:'passive',
                },
                '.port-label': {
                    display:'none',
                    fill: White
                }
            }
        },
        'out': {
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke:'white',
                    'stroke-width':1.5,
                    r:5
                },
                '.port-label': {
                    display:'none',
                    fill: White
                }
            }
        }
    }
};

export const FilterPortsConfig = {
    groups: {
        'in': {
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke:'white',
                    'stroke-width':1.5,
                    r:5,
                    magnet:'passive',
                },
                '.port-label': {
                    display:'none',
                    fill: White
                }
            }
        },
        'out': {
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke:'white',
                    'stroke-width':1.5,
                    r:5,
                    magnet:'passive',
                },
                '.port-label': {
                    display: 'none',
                    fill: White,
                }
            }
        },
        'outx': {
            position:{
                name: 'right'
            },
            label: {
                position:{
                    name: 'right',
                    args:{y: -12, x: 4}
                }
            },
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke:'white',
                    'stroke-width':1.5,
                    r:5,
                    magnet:'passive',
                },
                '.port-label': {
                    text: 'PASS',
                    fill: LightGrey,
                    fontWeight: 500
                }
            }
        },
        'negate': {
            position:{
                name: 'bottom'
            },
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke:'white',
                    'stroke-width':1.5,
                    r:5,
                    magnet:'passive',
                },
                '.port-label': {
                    text:'FAIL',
                    fill: LightGrey,
                    fontWeight: 500
                }
            }
        }
    }
};

const unicodesCache = {};

/**
 * @param iconName
 * @return String unicode character for this mdi icon
 * @constructor
 */
function IconToUnicode(iconName){
    if (unicodesCache[iconName]){
        return unicodesCache[iconName];
    }
    try{
        const el = document.createElement('span');
        el.className = 'mdi mdi-' + iconName;
        el.style = 'visibility:hidden';
        const body = document.getElementsByTagName('body').item(0);
        body.appendChild(el);
        const uCode = window.getComputedStyle(el, ':before').getPropertyValue('content');
        body.removeChild(el);
        unicodesCache[iconName] = uCode.replace(/"/g, '');
        return unicodesCache[iconName]
    } catch (e) {
        console.warn('cannot find unicode for icon ' + iconName, 'Displaying Help icon', e);
        return '\uF625';
    }
}

function positionFilters(model, originalBox, filter, selector, anchor = 'left') {

    if(!selector && !filter){
        model.resize(originalBox.width, originalBox.height);
        model.attr({
            rect: {...originalBox},
            icon: {refX: LightIcon.refX, refX2: 0},
            text: {refX: LightLabel.refX, refX2: 0},
            'separator': {display:'none'},
            'filter-rect': {display:'none'},
            'filter-icon': {display:'none'},
            'filter-count':{display:'none'},
            'selector-rect': {display:'none'},
            'selector-icon': {display:'none'},
            'selector-count':{display:'none'},
        });
        return;
    }
    // General resize
    const newBox=  {width: 180, height: originalBox.height};
    model.resize(newBox.width, newBox.height);
    model.attr({
        rect: {...newBox},
        icon: {refX: anchor=== 'left'? 20 : -20, refX2: '50%'},
        text: {refX: anchor=== 'left'? 20 : -20, refX2: '50%'},
        'separator': {display:'initial'},
    });
    // Position filter boxes
    const multiple = (selector && filter);

    let position;
    position = (i, count) => {
        return {
            rect: {display:'initial', refY: '50%', refY2: i *14 - 12},
            icon: {display:'initial', refY: '50%', refY2: i * 14 - 3},
            count:{text: count, 'font-size':12, display:count>1?'initial':'none', refY: '50%', refY2: i * 14 - 17}
        }
    };
    let filterPosition, selectorPosition;
    const hide = {rect:{display:'none'},icon:{display:'none'}, count:{display:'none'}};
    if(multiple){
        filterPosition = position(-1, filter);
        selectorPosition = position(1, selector);
    } else if(filter){
        filterPosition = position(0, filter);
        selectorPosition = hide;
    } else if(selector){
        filterPosition= hide;
        selectorPosition = position(0, selector);
    }
    model.attr({
        'filter-rect': filterPosition.rect,
        'filter-icon': filterPosition.icon,
        'filter-count': filterPosition.count,
        'selector-rect': selectorPosition.rect,
        'selector-icon': selectorPosition.icon,
        'selector-count': selectorPosition.count
    });

}


function linkAttr(hasData = true) {
    let conn;
    if (hasData){
        conn = {
            stroke: Blue,
            'stroke-width': 1.5,
            targetMarker: {
                'type': 'path',
                'd': 'M 8 -4 0 0 8 4 z'
            }
        };
    } else {
        conn = {
            stroke: DarkGrey,
            'stroke-width': 1.5,
            targetMarker: {
                'type': 'path',
                'd': 'M 8 -4 0 0 8 4 z'
            }
        }
    }
    return {'.connection' : conn};
}

const AllowedKeys = {
    filter: {
        job: {'NodeEventFilter':JobsNodesSelector, 'UserEventFilter': JobsUsersSelector, 'IdmFilter': JobsIdmSelector, 'ContextMetaFilter': JobsContextMetaFilter},
        action:{'NodesFilter': JobsNodesSelector, 'UsersFilter': JobsUsersSelector, 'IdmFilter': JobsIdmSelector, 'ContextMetaFilter': JobsContextMetaFilter, 'ActionOutputFilter': JobsActionOutputFilter}
    },
    selector: {
        job: {},
        action: {'NodesSelector': JobsNodesSelector, 'UsersSelector': JobsUsersSelector, 'IdmSelector': JobsIdmSelector},
    },
    target: {
        job: {
            filter: [
                {type: JobsNodesSelector, key: 'NodeEventFilter', },
                {type: JobsUsersSelector, key: 'UserEventFilter'},
                {type: JobsIdmSelector, key: 'IdmFilter'},
                {type: JobsContextMetaFilter, key: 'ContextMetaFilter'}
            ],
            selector: [],
        },
        action: {
            filter: [
                {type: JobsNodesSelector, key: 'NodesFilter'},
                {type: JobsUsersSelector, key: 'UsersFilter'},
                {type: JobsIdmSelector, key: 'IdmFilter'},
                {type: JobsContextMetaFilter, key: 'ContextMetaFilter'},
                {type: JobsActionOutputFilter, key: 'ActionOutputFilter'}
            ],
            selector: [
                {type: JobsNodesSelector, key: 'NodesSelector'},
                {type: JobsUsersSelector, key: 'UsersSelector'},
                {type: JobsIdmSelector, key: 'IdmSelector'}
            ],
        }
    }
};



const BlueRect = {fill: Blue ,rx: 5,ry: 5, 'stroke-width':1,  'stroke': Blue, filter:dropShadow};
const WhiteRect = {fill: White ,rx: 5,ry: 5, 'stroke-width':1,  'stroke': LightGrey, filter:dropShadow};

const WhiteCircle={fill: White, refX: '50%', refY: '50%', r: 32, 'stroke-width':1, 'stroke': LightGrey, filter: dropShadow};

const LightIcon = { refY:18, refY2: 0, 'text-anchor':'middle', refX:'50%', fill:'#e3f2fd'};
const LightLabel = { refY:'60%', refY2: 0, 'text-anchor':'middle', refX:'50%', 'font-size': 15, fill:White, 'font-family':'Roboto', 'font-weight':500, magnet:null};
const DarkLabel = {...LightLabel, fill: DarkGrey};
const DarkIcon = {...LightIcon, fill: Blue};

export {PortsConfig, ClusterConfig, TextIconMarkup, TextIconFilterMarkup, RoundIconMarkup, SimpleIconMarkup, BoxSize, FilterBoxSize, WhiteCircle, BlueRect, LightLabel, LightIcon, DarkIcon,
    WhiteRect, DarkLabel, Blue, Orange, LightGrey, Grey, DarkGrey, Stale, Destructive, IconToUnicode, positionFilters, linkAttr, AllowedKeys, dropShadow as DropShadow}