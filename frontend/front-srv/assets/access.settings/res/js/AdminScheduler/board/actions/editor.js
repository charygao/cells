export const TOGGLE_EDITOR_MODE = "editor:toggle-edit";
export const EDITOR_SET_DIRTY = "editor:set-dirty";
export const EDITOR_SAVE_SUCCESS = "editor:save";
export const EDITOR_SAVE_ERROR = "editor:save";
export const EDITOR_REVERT = "editor:revert";
export const EDITOR_SET_BOUNDING_REF = "editor:boundingRef";
export const EDITOR_ACTIONS_DESCRIPTIONS = "editor:descriptions";

export const BIND_PAPER_TO_DOM = "editor:bind-paper";
export const SELECTION_CHANGE_ACTION = "selection:change";
export const SELECTION_CLEAR_ACTION = "selection:clear";
export const RESIZE_PAPER = "editor:resize-paper";
export const REQUIRE_LAYOUT = "editor:require-layout";

export const JOB_CHANGED = "job:changed";
export const JOB_SWITCH_TRIGGER = "trigger:switch";
export const JOB_UPDATE_LABEL = "job:label";
export const JOB_UPDATE_PROPERTY = "job:property";

export const EMPTY_MODEL_ACTION = "model:create-empty";
export const ATTACH_MODEL_ACTION = "model:attach";
export const DETACH_MODEL_ACTION = "model:detach";
export const REMOVE_MODEL_ACTION = "model:remove";

export const DROP_FILTER_ACTION = "filter:drop";
export const REMOVE_FILTER_ACTION = "filter:remove";
export const TOGGLE_FILTER_AS_CONDITION = "filter:condition";

export const JOB_ACTION_EMPTY = "EMPTY";

export function toggleEditAction(on = false, layout = () => {}) {
    return {
        type: TOGGLE_EDITOR_MODE,
        edit: on,
        layout
    }
}

export function attachBoundingRefAction(element) {
    return {
        type: EDITOR_SET_BOUNDING_REF,
        boundingRef: element
    }
}

export function attachDescriptions(descriptions) {
    return {
        type: EDITOR_ACTIONS_DESCRIPTIONS,
        descriptions,
    }
}

export function requireLayoutAction(graph, boundingRef, editMode, paper, createLinkTool){
    return {
        type: REQUIRE_LAYOUT,
        graph,boundingRef,editMode, paper, createLinkTool
    }
}

export function bindPaperAction(element, graph, events) {
    return  {
        type: BIND_PAPER_TO_DOM,
        element: element,
        graph:graph,
        events: events
    }
}

export function resizePaperAction (width, height) {
    return  {
        type: RESIZE_PAPER,
        width,
        height
    }
}

export function emptyModelAction(model) {
    return {
        type: EMPTY_MODEL_ACTION,
        model,
    }
}

export function attachModelAction(linkView) {
    return {
        type: ATTACH_MODEL_ACTION,
        linkView,
    }
}

export function detachModelAction(linkView, toolView = null, originalTarget = null) {
    return {
        type: DETACH_MODEL_ACTION,
        linkView,
        toolView,
        originalTarget
    }
}

export function dropFilterAction(target, dropped, filterOrSelector, objectType) {
    return {
        type: DROP_FILTER_ACTION,
        target,
        dropped,
        filterOrSelector,
        objectType
    }
}

export function removeFilterAction(target, filter, filterOrSelector, objectType) {
    return {
        type: REMOVE_FILTER_ACTION,
        target,
        filter,
        filterOrSelector,
        objectType
    }
}

export function toggleFilterAsConditionAction(toggle, action) {
    return {
        type: TOGGLE_FILTER_AS_CONDITION,
        toggle,
        action
    }
}

export function jobChangedAction(job, descriptions, editMode) {
    return {
        type: JOB_CHANGED,
        job, descriptions, editMode
    }
}

export function removeModelAction(model, parentModel, removeFilter) {
    return{
        type: REMOVE_MODEL_ACTION,
        model,
        parentModel,
        removeFilter
    }
}

export function changeTriggerAction(triggerType, triggerData){
    return {
        type: JOB_SWITCH_TRIGGER,
        triggerType,
        triggerData
    }
}

export function updateLabelAction(newLabel){
    return {
        type: JOB_UPDATE_LABEL,
        label: newLabel,
    }
}

export function updateJobPropertyAction(propertyName, propertyValue) {
    return {
        type: JOB_UPDATE_PROPERTY,
        propertyName,
        propertyValue
    }
}

export function setSelectionAction(selectionType, selectionModel) {
    return {
        type: SELECTION_CHANGE_ACTION,
        selectionType,
        selectionModel
    }
}

export function clearSelectionAction(){
    return {
        type: SELECTION_CLEAR_ACTION
    }
}

export function setDirtyAction(dirty = true) {
    return {
        type: EDITOR_SET_DIRTY,
        dirty: dirty
    }
}

export function saveSuccessAction(job) {
    return {
        type: EDITOR_SAVE_SUCCESS,
        job: job
    }
}

export function saveErrorAction(job) {
    return {
        type: EDITOR_SAVE_ERROR,
        job: job
    }
}

export function revertAction(original) {
    return {
        type: EDITOR_REVERT, original
    }
}