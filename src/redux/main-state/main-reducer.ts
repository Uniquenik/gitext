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


        default: return state
    }
}