export interface commitInfo {
    checkTrees:boolean[],
    sha:string,
    committerAuthorLogin:string,
    commitAuthorDate:string,
    committerAuthorAvatarURL:string
    commitMessage:string,
}

export interface branchInfo {
    name: string,
    color: string,
}

export interface mergeInfo {
    from: string,
    to: string
}