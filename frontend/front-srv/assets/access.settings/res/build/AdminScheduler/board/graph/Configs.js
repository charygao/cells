'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _pydioHttpRestApi = require('pydio/http/rest-api');

var Blue = '#2196f3';
var DarkGrey = '#424242';
var LightGrey = '#e0e0e0';
var Grey = '#9e9e9e';
var White = '#ffffff';
var Orange = '#ff9800';
var Stale = '#607D8B';
var Destructive = '#ef534f';

var BoxSize = { width: 150, height: 64 };
var FilterBoxSize = { width: 64, height: 64 };

var dropShadow = {
    name: 'dropShadow',
    args: {
        opacity: 0.1,
        dx: 1,
        dy: 1,
        blur: 5
    }
};

var TextIconMarkup = [{
    tagName: 'rect',
    selector: 'rect'
}, {
    tagName: 'text',
    selector: 'icon'
}, {
    tagName: 'text',
    selector: 'text'
}];

var RoundIconMarkup = [{
    tagName: 'circle',
    selector: 'circle'
}, {
    tagName: 'text',
    selector: 'icon'
}, {
    tagName: 'text',
    selector: 'type-icon-outline'
}, {
    tagName: 'text',
    selector: 'type-icon'
}, {
    tagName: 'text',
    selector: 'text'
}];

var TextIconFilterMarkup = [{
    tagName: 'rect',
    selector: 'rect'
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

var SimpleIconMarkup = [{
    tagName: 'rect',
    selector: 'rect'
}, {
    tagName: 'text',
    selector: 'icon'
}];

var ClusterConfig = {
    size: { width: 420, height: 104 },
    attrs: { rect: { width: 420, height: 104, rx: 5, ry: 5, fill: 'transparent', stroke: LightGrey, 'stroke-width': 2, strokeDasharray: '5,2' } }
};

var PortsConfig = {
    groups: {
        'in': {
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke: 'white',
                    'stroke-width': 1.5,
                    r: 5,
                    magnet: 'passive'
                },
                '.port-label': {
                    display: 'none',
                    fill: White
                }
            }
        },
        'out': {
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke: 'white',
                    'stroke-width': 1.5,
                    r: 5
                },
                '.port-label': {
                    display: 'none',
                    fill: White
                }
            }
        }
    }
};

var FilterPortsConfig = {
    groups: {
        'in': {
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke: 'white',
                    'stroke-width': 1.5,
                    r: 5,
                    magnet: 'passive'
                },
                '.port-label': {
                    display: 'none',
                    fill: White
                }
            }
        },
        'out': {
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke: 'white',
                    'stroke-width': 1.5,
                    r: 5,
                    magnet: 'passive'
                },
                '.port-label': {
                    display: 'none',
                    fill: White
                }
            }
        },
        'outx': {
            position: {
                name: 'right'
            },
            label: {
                position: {
                    name: 'right',
                    args: { y: -12, x: 4 }
                }
            },
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke: 'white',
                    'stroke-width': 1.5,
                    r: 5,
                    magnet: 'passive'
                },
                '.port-label': {
                    text: 'PASS',
                    fill: LightGrey,
                    fontWeight: 500
                }
            }
        },
        'negate': {
            position: {
                name: 'bottom'
            },
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke: 'white',
                    'stroke-width': 1.5,
                    r: 5,
                    magnet: 'passive'
                },
                '.port-label': {
                    text: 'FAIL',
                    fill: LightGrey,
                    fontWeight: 500
                }
            }
        }
    }
};

exports.FilterPortsConfig = FilterPortsConfig;
var unicodesCache = {};

/**
 * @param iconName
 * @return String unicode character for this mdi icon
 * @constructor
 */
function IconToUnicode(iconName) {
    if (unicodesCache[iconName]) {
        return unicodesCache[iconName];
    }
    try {
        var el = document.createElement('span');
        el.className = 'mdi mdi-' + iconName;
        el.style = 'visibility:hidden';
        var body = document.getElementsByTagName('body').item(0);
        body.appendChild(el);
        var uCode = window.getComputedStyle(el, ':before').getPropertyValue('content');
        body.removeChild(el);
        unicodesCache[iconName] = uCode.replace(/"/g, '');
        return unicodesCache[iconName];
    } catch (e) {
        console.warn('cannot find unicode for icon ' + iconName, 'Displaying Help icon', e);
        return '';
    }
}

function positionFilters(model, originalBox, filter, selector) {
    var anchor = arguments.length <= 4 || arguments[4] === undefined ? 'left' : arguments[4];

    if (!selector && !filter) {
        model.resize(originalBox.width, originalBox.height);
        model.attr({
            rect: _extends({}, originalBox),
            icon: { refX: LightIcon.refX, refX2: 0 },
            text: { refX: LightLabel.refX, refX2: 0 },
            'separator': { display: 'none' },
            'filter-rect': { display: 'none' },
            'filter-icon': { display: 'none' },
            'filter-count': { display: 'none' },
            'selector-rect': { display: 'none' },
            'selector-icon': { display: 'none' },
            'selector-count': { display: 'none' }
        });
        return;
    }
    // General resize
    var newBox = { width: 180, height: originalBox.height };
    model.resize(newBox.width, newBox.height);
    model.attr({
        rect: _extends({}, newBox),
        icon: { refX: anchor === 'left' ? 20 : -20, refX2: '50%' },
        text: { refX: anchor === 'left' ? 20 : -20, refX2: '50%' },
        'separator': { display: 'initial' }
    });
    // Position filter boxes
    var multiple = selector && filter;

    var position = undefined;
    position = function (i, count) {
        return {
            rect: { display: 'initial', refY: '50%', refY2: i * 14 - 12 },
            icon: { display: 'initial', refY: '50%', refY2: i * 14 - 3 },
            count: { text: count, 'font-size': 12, display: count > 1 ? 'initial' : 'none', refY: '50%', refY2: i * 14 - 17 }
        };
    };
    var filterPosition = undefined,
        selectorPosition = undefined;
    var hide = { rect: { display: 'none' }, icon: { display: 'none' }, count: { display: 'none' } };
    if (multiple) {
        filterPosition = position(-1, filter);
        selectorPosition = position(1, selector);
    } else if (filter) {
        filterPosition = position(0, filter);
        selectorPosition = hide;
    } else if (selector) {
        filterPosition = hide;
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

function linkAttr() {
    var hasData = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

    var conn = undefined;
    if (hasData) {
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
        };
    }
    return { '.connection': conn };
}

var AllowedKeys = {
    filter: {
        job: { 'NodeEventFilter': _pydioHttpRestApi.JobsNodesSelector, 'UserEventFilter': _pydioHttpRestApi.JobsUsersSelector, 'IdmFilter': _pydioHttpRestApi.JobsIdmSelector, 'ContextMetaFilter': _pydioHttpRestApi.JobsContextMetaFilter },
        action: { 'NodesFilter': _pydioHttpRestApi.JobsNodesSelector, 'UsersFilter': _pydioHttpRestApi.JobsUsersSelector, 'IdmFilter': _pydioHttpRestApi.JobsIdmSelector, 'ContextMetaFilter': _pydioHttpRestApi.JobsContextMetaFilter, 'ActionOutputFilter': _pydioHttpRestApi.JobsActionOutputFilter }
    },
    selector: {
        job: {},
        action: { 'NodesSelector': _pydioHttpRestApi.JobsNodesSelector, 'UsersSelector': _pydioHttpRestApi.JobsUsersSelector, 'IdmSelector': _pydioHttpRestApi.JobsIdmSelector }
    },
    target: {
        job: {
            filter: [{ type: _pydioHttpRestApi.JobsNodesSelector, key: 'NodeEventFilter' }, { type: _pydioHttpRestApi.JobsUsersSelector, key: 'UserEventFilter' }, { type: _pydioHttpRestApi.JobsIdmSelector, key: 'IdmFilter' }, { type: _pydioHttpRestApi.JobsContextMetaFilter, key: 'ContextMetaFilter' }],
            selector: []
        },
        action: {
            filter: [{ type: _pydioHttpRestApi.JobsNodesSelector, key: 'NodesFilter' }, { type: _pydioHttpRestApi.JobsUsersSelector, key: 'UsersFilter' }, { type: _pydioHttpRestApi.JobsIdmSelector, key: 'IdmFilter' }, { type: _pydioHttpRestApi.JobsContextMetaFilter, key: 'ContextMetaFilter' }, { type: _pydioHttpRestApi.JobsActionOutputFilter, key: 'ActionOutputFilter' }],
            selector: [{ type: _pydioHttpRestApi.JobsNodesSelector, key: 'NodesSelector' }, { type: _pydioHttpRestApi.JobsUsersSelector, key: 'UsersSelector' }, { type: _pydioHttpRestApi.JobsIdmSelector, key: 'IdmSelector' }]
        }
    }
};

var BlueRect = { fill: Blue, rx: 5, ry: 5, 'stroke-width': 1, 'stroke': Blue, filter: dropShadow };
var WhiteRect = { fill: White, rx: 5, ry: 5, 'stroke-width': 1, 'stroke': LightGrey, filter: dropShadow };

var WhiteCircle = { fill: White, refX: '50%', refY: '50%', r: 32, 'stroke-width': 1, 'stroke': LightGrey, filter: dropShadow };

var LightIcon = { refY: 18, refY2: 0, 'text-anchor': 'middle', refX: '50%', fill: '#e3f2fd' };
var LightLabel = { refY: '60%', refY2: 0, 'text-anchor': 'middle', refX: '50%', 'font-size': 15, fill: White, 'font-family': 'Roboto', 'font-weight': 500, magnet: null };
var DarkLabel = _extends({}, LightLabel, { fill: DarkGrey });
var DarkIcon = _extends({}, LightIcon, { fill: Blue });

exports.PortsConfig = PortsConfig;
exports.ClusterConfig = ClusterConfig;
exports.TextIconMarkup = TextIconMarkup;
exports.TextIconFilterMarkup = TextIconFilterMarkup;
exports.RoundIconMarkup = RoundIconMarkup;
exports.SimpleIconMarkup = SimpleIconMarkup;
exports.BoxSize = BoxSize;
exports.FilterBoxSize = FilterBoxSize;
exports.WhiteCircle = WhiteCircle;
exports.BlueRect = BlueRect;
exports.LightLabel = LightLabel;
exports.LightIcon = LightIcon;
exports.DarkIcon = DarkIcon;
exports.WhiteRect = WhiteRect;
exports.DarkLabel = DarkLabel;
exports.Blue = Blue;
exports.Orange = Orange;
exports.LightGrey = LightGrey;
exports.Grey = Grey;
exports.DarkGrey = DarkGrey;
exports.Stale = Stale;
exports.Destructive = Destructive;
exports.IconToUnicode = IconToUnicode;
exports.positionFilters = positionFilters;
exports.linkAttr = linkAttr;
exports.AllowedKeys = AllowedKeys;
exports.DropShadow = dropShadow;
