import {editorActionTypes} from "./editor-action-types";
import {fileInfo} from "./data-types";

export const setValueText = (value: string) => {
    return {
        type: editorActionTypes.SET_VALUE,
        payload: value
    }
}

export const setIsSaveCurrentValue = (bool:boolean) => {
    return {
        type: editorActionTypes.SET_SAVE_CURRENT_VALUE,
        payload: bool
    }
}

export const setIsSaveCurrentValueGit = (bool:boolean) => {
    return {
        type: editorActionTypes.SET_SAVE_CURRENT_VALUE_GIT,
        payload: bool
    }
}

export const setCurrentBranch = (branch:string) => {
    return {
        type: editorActionTypes.SET_CURRENT_BRANCH,
        payload: branch
    }
}

export const setCurrentValueInfo = (info: fileInfo) => {
    return {
        type: editorActionTypes.SET_CURRENT_VALUE_INFO,
        payload: info
    }

}