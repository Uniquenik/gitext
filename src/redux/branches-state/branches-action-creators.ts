import {branchesActionTypes} from "./branches-action-types";

export const setOpenCommits = (bool:boolean) => {
    return {
        type: branchesActionTypes.SET_VISIBLE_LIST_COMMITS,
        payload: bool
    }
}

export const setVisibleCurrentValue = (bool:boolean) => {
    return {
        type: branchesActionTypes.SET_VISIBLE_CURRENT_VALUE,
        payload: bool
    }
}