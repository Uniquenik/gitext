import {Action, mainState} from "./data-types";
import {mainActionTypes} from "./main-action-types";

const defaultState:mainState = {
    isAuth: false,
    authToken: "",
    currentValue: ""
}

export function mainReducer(state:mainState = defaultState, action:Action){
    switch (action.type){
        case mainActionTypes.SET_AUTH:
            return {
                ...state,
                authToken: action.payload,
                isAuth: true
            };
        case mainActionTypes.SET_VALUE:
            return {
                ...state,
                currentValue: action.payload
            }
        default:
            return state
    }
}