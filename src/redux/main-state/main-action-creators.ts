import {mainActionTypes} from "./main-action-types";

export const setAuthToken = (value: string) => {
    return {
        type: mainActionTypes.SET_AUTH_TOKEN,
        payload: value
    }
}