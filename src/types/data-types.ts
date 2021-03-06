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

export const OVERRIDE_VALUE = "OVERRIDE_VALUE"
export const CHANGE_REPO_MSG = "CHANGE_REPO_MSG"
export const CHANGE_BRANCH_SAVE = "CHANGE_BRANCH_SAVE"
export const CHANGE_BRANCH_GET = "CHANGE_BRANCH_GET"