import {useRepo} from "../../hooks/repo-hook";
import React, {useEffect, useState} from "react";
import {ChangeRepo} from "./change-repo"
import {LoadingContainer} from "../../loading/loading-container";
import {ErrorModal} from "../../modalPortal/error-modal";
import {ModalPortal} from "../../modalPortal/modal-portal";
import {getUserRep401} from "../../types/errors-const";

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

/*export const defaultStateRepoInfo = {
    created_at: "",
    pushed_at: "",
    id_project: 0,
    language: "",
    name: "",
    description: "",
    owner_login: "",
    owner_avatar: "",
    visibility: "",
    permissions: [],
}*/

export const ChangeRepoContainer = (props: {owner:string}) => {
    const {getUserRepo} = useRepo()

    const [repos, setRepos] = useState<repoInfo[]>([])
    const [isFetching, setIsFetching] = useState(true)
    const [typeModal, setTypeModal] = useState("")

    useEffect(() => {
        setIsFetching(true)
        let a = getRepos()
            .then((resp)=>{
                setRepos(resp)
                setIsFetching(false)
            })
            .catch((error)=> {
                setIsFetching(false)
                console.log("Global error")
            })
    },[])

    async function getRepos () {
        let repoArr:repoInfo[] = []
        console.log(props.owner)
        await getUserRepo()
            .then((response)=>{
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
                //console.log(response)
            })
            .catch((error)=>{
                setTypeModal(error)
                throw new Error(error)
            })
        return repoArr
    }


    return(
        <LoadingContainer show={isFetching} errorMsg={""}>
            <div className={"w-full h-full bg-accent"}>
                <ModalPortal
                    show={typeModal !== ""}
                    onClose={""}
                    selector={'#modal'}
                    closable={false}
                >
                    <ErrorModal errorMsg={typeModal}/>
                </ModalPortal>
                    {(!isFetching &&
                    <ChangeRepo owner={props.owner}
                                repos={repos}/>
                    )
                    || (<div className={"h-screen w-screen"}/>)
                    }
            </div>
        </LoadingContainer>
    )
}