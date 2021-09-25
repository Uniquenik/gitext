import {Action, branchesState} from "./data-types";
import {branchesActionTypes} from "./branches-action-types";

const defaultState: branchesState = {
    getCommits: false,
    getTrees: false
}

export function branchesReducer(state:branchesState = defaultState, action:Action){
    switch (action.type){
        case branchesActionTypes.SET_COMMITS_TREE:
            return {
                ...state,
                getTrees: action.payload
            };
        case branchesActionTypes.SET_COMMITS_TRUE:
            return {
                ...state,
                getCommits: true
            };

        default:
            return state
    }
}