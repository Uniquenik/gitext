export interface commitInfo {
    checkTrees:boolean[],
    sha:string,
    committerAuthorLogin:string,
    commitAuthorDate:string,
    committerAuthorAvatarURL:string
    commitMessage:string,
}

export interface branchSimpleInfo {
    name: string,
    color: string,
}

export interface mergeInfo {
    from: string,
    to: string
}

export const commitInfoInitState = {
    checkTrees:[],
    sha:"",
    committerAuthorLogin:"",
    commitAuthorDate:"",
    committerAuthorAvatarURL:"",
    commitMessage:""
}
export const branchSimpleInfoInitState = {
    name:"",
    color:""
}
export const mergeInfoInitState = {
    from: "",
    to: ""
}