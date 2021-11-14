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
import {useChangeRepo} from "./git-change-repo";

export const ChangeRepoContainer = () => {
    const mainStatus: any = useSelector<RootReducer>(state => state.main);
    const {deleteOcto} = useAuth()
    const {getReposGH} = useChangeRepo()

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
        getReposGH()
            .then((resp) => {
                setRepos(resp)
                setIsFetching(false)
            })
            .catch((error) => {
                setTypeModal(error)
                setIsFetching(false)
                console.log("Global error")
            })
    }, [])



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