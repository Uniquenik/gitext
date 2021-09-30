export interface mainState {
    isAuth: boolean,
    /*isSelected: boolean,
    userName:string,
    currentRepoName: string,
    currentRepo: string,
    currentRef: string,
    currentCommit: string,*/
    authToken: string,
    currentValue:string
}

export interface Action {
    type: string,
    payload: any
}