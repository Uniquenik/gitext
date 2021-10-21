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
import {changeRepoInfo, defaultOwnerRepoValueForm, ownerRepoValueForm} from "./data-types";
import {compareByPushedAt} from "../../types/comparators";

export const ChangeRepoContainer = () => {
    const mainStatus: any = useSelector<RootReducer>(state => state.main);
    const {getUserRepo} = useRepo()
    const {deleteOcto} = useAuth()

    let history = useHistory()

    const [repos, setRepos] = useState<changeRepoInfo[]>([])
    const [isFetching, setIsFetching] = useState(true)
    const [typeModal, setTypeModal] = useState("")
    const [ownerRepo, setOwnerRepo] = useState<ownerRepoValueForm>(defaultOwnerRepoValueForm)

    const onChange = ({target: {name, value}}: ChangeEvent<HTMLInputElement>) => {
        setOwnerRepo({...ownerRepo, [name]: value})
    }

    const onViewBranches = () => {
        if (ownerRepo.owner && ownerRepo.repo)
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
        let repoArr: changeRepoInfo[] = []
        await getUserRepo()
            .then((response) => {
                console.log("Repos get...")
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
                repoArr.sort(compareByPushedAt)
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
                    <LoadingOverlay/>)}
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