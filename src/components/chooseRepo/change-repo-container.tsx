import {useRepo} from "../../hooks/repo-hook";
import React, {ChangeEvent, useEffect, useState} from "react";
import {ChangeRepo} from "./change-repo"
import {ErrorModal} from "../../modalPortal/error-modal";
import {ModalPortal} from "../../modalPortal/modal-portal";
import {useHistory} from "react-router-dom"
import {useSelector} from "react-redux";
import {RootReducer} from "../../redux";
import {useAuth} from "../../hooks/auth-hook";
import {LoadingOverlay} from "../../loading/loading-overlay";

export interface repoInfo {
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

export interface ownerRepoValue {
    owner: string,
    repo: string
}

export const defaultOwnerRepoValue = {
    owner: "",
    repo: "",
}

export const ChangeRepoContainer = () => {
    const mainStatus: any = useSelector<RootReducer>(state => state.main);
    const {getUserRepo} = useRepo()
    const {deleteOcto} = useAuth()

    let history = useHistory()

    const [repos, setRepos] = useState<repoInfo[]>([])
    const [isFetching, setIsFetching] = useState(true)
    const [typeModal, setTypeModal] = useState("")
    const [ownerRepo, setOwnerRepo] = useState<ownerRepoValue>(defaultOwnerRepoValue)

    const onChange = ({target: {name, value}}: ChangeEvent<HTMLInputElement>) => {
        setOwnerRepo({...ownerRepo, [name]: value})
    }

    const onViewBranches = () => {
        history.push(`/${ownerRepo.owner}/${ownerRepo.repo}/branches/`)
    }

    useEffect(() => {
        setIsFetching(true)
        getRepos()
            .then((resp) => {
                setRepos(resp)
                setIsFetching(false)
            })
            .catch(() => {
                setIsFetching(false)
                console.log("Global error")
            })
    }, [])

    async function getRepos() {
        let repoArr: repoInfo[] = []
        await getUserRepo()
            .then((response) => {
                console.log(response)
                response.forEach((item) => {
                        repoArr.push({
                            created_at: item.created_at!,
                            pushed_at: item.pushed_at!,
                            id_project: item.id!,
                            language: item.language!,
                            name: item.name!,
                            description: item.description!,
                            owner_login: item.owner.login!,
                            owner_avatar: item.owner.avatar_url,
                            visibility: item.visibility!,
                            permissions: [item.permissions!.admin, item.permissions!.pull, item.permissions!.push]
                        })
                    }
                )
                repoArr.sort(function (a, b) {
                    if (a.pushed_at! > b.pushed_at!) return -1
                    if (a.pushed_at! < b.pushed_at!) return 1
                    else return 0
                })
            })
            .catch((error) => {
                console.log(error)
                setTypeModal(error)
                throw new Error(error)
            })
        return repoArr
    }

    const onLogout = () => {
        deleteOcto()
    }

    const onBack = () => {
        history.push("/")
    }

    return (
        <>
            <ModalPortal
                show={typeModal !== "" || isFetching}
                closable={false}
                onClose={() => {
                }}
                selector={"#modal"}
            >
                {(typeModal !== "" &&
                    <ErrorModal errorMsg={typeModal} onBack={onBack}/>) ||
                (isFetching &&
                    <LoadingOverlay show={isFetching}/>)}
            </ModalPortal>
            <ChangeRepo owner={mainStatus.username}
                        repos={repos}
                        onLogout={onLogout}
                        onChange={onChange}
                        onViewBranches={onViewBranches}
                        ownerValue={ownerRepo.owner}
                        repoValue={ownerRepo.repo}
            />
        </>
    )
}