export interface filePath {
    type: string,
    path: string
}

export interface branchChoosePath {
    name: string,
    lastCommitSha: string,
    lastCommitShaTree: string,
    protected: boolean,
    resp: filePath[]
}