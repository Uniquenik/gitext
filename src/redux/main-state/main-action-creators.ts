import {mainActionTypes} from "./main-action-types";

export const setAuthToken = (value: string) => {
    return {
        type: mainActionTypes.SET_AUTH_TOKEN,
        payload: value
    }
}

export const deleteAuthToken = () => {
    return {
        type: mainActionTypes.DELETE_AUTH_TOKEN,
    }
}

export const setUsername = (name:string) => {
    return{
        type: mainActionTypes.SET_USERNAME,
        payload: name
    }
}