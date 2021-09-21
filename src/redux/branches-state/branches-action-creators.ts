import {branchesActionTypes} from "./branches-action-types";

export const setCommitsTrue = () => {
    return {
        type: branchesActionTypes.SET_COMMITS_TRUE,
    }
}