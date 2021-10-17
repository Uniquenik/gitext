
export interface branchInfoInModal {
    name: string,
    date: string,
    lastCommit: string,
    lastCommitMsg: string,
    lastCommitAuthor: string,
    lastCommitAuthorImg: string,
    lastCommitTree:string,
    protected: boolean
}

export const defaultStateBranchInfoInModal = {
    name: "",
    date: "",
    lastCommit: "",
    lastCommitMsg: "",
    lastCommitAuthor: "",
    lastCommitAuthorImg: "",
    lastCommitTree: "",
    protected: false
}

export interface inputBranchModal {
    path: string,
    msg: string,
}