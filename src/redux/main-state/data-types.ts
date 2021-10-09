export interface mainState {
    isAuth: boolean,
    authToken: string,
    username: string,
}

export interface Action {
    type: string,
    payload: any
}