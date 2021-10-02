export interface commitInfo {
    checkTrees:boolean[],
    sha:string,
    committerAuthorLogin:string,
    commitAuthorDate:string,
    committerAuthorAvatarURL:string
    commitMessage:string,
}

export interface branchesCompareCommitInfo {
    sha: string,
    committerAuthorLogin: string,
    commitAuthorDate:string,
    commitMessage:string,
}

export const defaultBranchesCompareCommitInfo:branchesCompareCommitInfo = {
    sha:"",
    committerAuthorLogin: "",
    commitMessage: "",
    commitAuthorDate: ""
}

export interface branchInfo {
    name: string,
    color: string,
}

export interface mergeInfo {
    from: string,
    to: string
}