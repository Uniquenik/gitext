import {Action, mainState} from "./data-types";
import {mainActionTypes} from "./main-action-types";

const defaultState:mainState = {
    isAuth: false,
    authToken: "",
    username: ""
}

export function mainReducer(state:mainState = defaultState, action:Action){
    switch (action.type) {
        case mainActionTypes.SET_AUTH_TOKEN:
            return {
                ...state,
                isAuth: true,
                authToken: action.payload
            }
        case mainActionTypes.SET_USERNAME:
            return {
                ...state,
                username: action.payload
            }
        case mainActionTypes.DELETE_AUTH_TOKEN:
            return {
                ...state,
                isAuth: false,
                authToken: ""
            }

        default: return state
    }
}