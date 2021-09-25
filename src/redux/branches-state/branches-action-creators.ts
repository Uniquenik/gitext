import {branchesActionTypes} from "./branches-action-types";

export const setCommitsTree = (set: boolean) => {
    return {
        type: branchesActionTypes.SET_COMMITS_TREE,
        payload: set
    }
}

export const setCommitsTrue = () => {
    return {
        type: branchesActionTypes.SET_COMMITS_TRUE,
    }
}
