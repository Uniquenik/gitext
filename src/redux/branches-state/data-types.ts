export interface Action {
    type: string,
    payload: any
}

export interface branchesState {
    isOpenListCommits: boolean
    isOpenCurrentValue: boolean
}