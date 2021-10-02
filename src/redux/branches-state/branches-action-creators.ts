import {branchesActionTypes} from "./branches-action-types";

export const setCommitsTree = (set: boolean) => {
    return {
        type: branchesActionTypes.SET_COMMITS_TREE,
        payload: set
    }
}

export const setCommits = (bool: boolean) => {
    return {
        type: branchesActionTypes.SET_COMMITS,
        payload: bool
    }
}

export const setOpenCommits = (bool:boolean) => {
    return {
        type: branchesActionTypes.SET_LIST_COMMITS,
        payload: bool
    }
}

export const setVisibleCurrentValue = (bool:boolean) => {
    return {
        type: branchesActionTypes.SET_VISIBLE_CURRENT_VALUE,
        payload: bool
    }
}