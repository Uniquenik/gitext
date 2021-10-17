import {Action, branchesState} from "./data-types";
import {branchesActionTypes} from "./branches-action-types";

const defaultState: branchesState = {
    isOpenListCommits: true,
    isOpenCurrentValue: true
}

export function branchesReducer(state:branchesState = defaultState, action:Action){
    switch (action.type){
        case branchesActionTypes.SET_VISIBLE_LIST_COMMITS:
            return {
                ...state,
                isOpenListCommits: action.payload
            }
        case branchesActionTypes.SET_VISIBLE_CURRENT_VALUE:
            return {
                ...state,
                isOpenCurrentValue: action.payload
            }
        default:
            return state
    }
}