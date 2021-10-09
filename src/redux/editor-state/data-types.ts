export interface editorState {
    currentValue:string,
    isSaveCurrentValue: boolean,
    isSaveCurrentValueGit: boolean,
    currentValueBranch: string,
    currentValueOwner: string,
    currentValueRepo: string,
    currentValuePath: string
    currentValueParentCommit: string
}

export interface Action {
    type: string,
    payload: any
}

export interface fileInfo {
    currentValueBranch: string,
    currentValueOwner: string,
    currentValueRepo: string,
    currentValuePath: string,
    currentValueParentCommit: string
}