import {Action, branchesState} from "./data-types";
import {branchesActionTypes} from "./branches-action-types";

const defaultState: branchesState = {
    getCommits: false
}

export function branchesReducer(state:branchesState = defaultState, action:Action){
    switch (action.type){
        case branchesActionTypes.SET_COMMITS_TRUE:
            return {
                ...state,
                getCommits: true
            }
        default:
            return state
    }

}