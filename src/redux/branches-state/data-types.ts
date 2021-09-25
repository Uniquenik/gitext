export interface Action {
    type: string,
    payload: any
}

export interface branchesState {
    getTrees: boolean,
    getCommits: boolean
}