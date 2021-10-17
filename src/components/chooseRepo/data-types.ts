export interface changeRepoInfo {
    created_at: string,
    pushed_at: string,
    id_project: number,
    language: string,
    name: string,
    description: string,
    owner_login: string,
    owner_avatar: string,
    visibility: string,
    permissions: boolean[],
    //admin/pull/push
}

export interface ownerRepoValueForm {
    owner: string,
    repo: string
}

export const defaultOwnerRepoValueForm = {
    owner: "",
    repo: "",
}