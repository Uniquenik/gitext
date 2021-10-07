import {Action, editorState} from "./data-types";
import {editorActionTypes} from "./editor-action-types";

const defaultState:editorState = {
    isAuth: false,
    authToken: "",
    currentValue: "",
    isSaveCurrentValue: false,
    isSaveCurrentValueGit: false,
    currentValueBranch: "",
    currentValueOwner: "",
    currentValueParentCommit: "",
    currentValuePath: "",
    currentValueRepo: ""
}

export function editorReducer(state:editorState = defaultState, action:Action){
    switch (action.type){
        case editorActionTypes.SET_AUTH:
            return {
                ...state,
                authToken: action.payload,
                isAuth: true
            };
        case editorActionTypes.SET_VALUE:
            return {
                ...state,
                currentValue: action.payload
            }
        case editorActionTypes.SET_SAVE_CURRENT_VALUE:
            return {
                ...state,
                isSaveCurrentValue:action.payload
            }
        case editorActionTypes.SET_SAVE_CURRENT_VALUE_GIT:
            return {
                ...state,
                isSaveCurrentValueGit:action.payload
            }
        case editorActionTypes.SET_CURRENT_BRANCH:
            return {
                ...state,
                currentBranch: action.payload
            }
        case editorActionTypes.SET_CURRENT_VALUE_INFO:
            return {
                ...state,
                currentValueBranch: action.payload.currentValueBranch,
                currentValueRepo: action.payload.currentValueRepo,
                currentValueParentCommit: action.payload.currentValueParentCommit,
                currentValuePath: action.payload.currentValuePath,
                currentValueOwner: action.payload.currentValueOwner,
            }
        default:
            return state
    }
}