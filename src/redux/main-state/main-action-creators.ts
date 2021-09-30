import {mainActionTypes} from "./main-action-types";

export const setAuth = (token: string) => {
    return {
        type: mainActionTypes.SET_AUTH,
        payload: token
    }
}

export const setValueText = (value: string) => {
    return {
        type: mainActionTypes.SET_VALUE,
        payload: value
    }
}