import {fileInfo} from "../../redux/editor-state/data-types";
import {ModalPortal} from "../modal-portal";
import {useEffect, useState} from "react";
import {LoadingOverlay} from "../../loading/loading-overlay";
import {useBranches} from "../../hooks/branches-hook";
import {ErrorModal} from "../error-modal";
import {ChangeBranchCard} from "./change-branch-card";

export interface branchInf {
    name: string,
    date: string,
    lastCommit: string,
    lastCommitMsg: string,
    lastCommitAuthor: string,
    lastCommitAuthorImg: string,
    lastCommitTree:string,
    protected: boolean
}

export const ChangeBranch = (props: {
    repo: fileInfo,
    onBack: (event:any) => void
}) => {

    const [isFetching, setIsFetching] = useState(true)
    const [branches, setBranches] = useState<branchInf[]>([])
    const [error, setError] = useState("")
    const {getAllBranches, getBranch} = useBranches();

    useEffect(() => {
        setIsFetching(true)
        getBranches()
            .then((resp)=> {
                setIsFetching(false)
            })
    }, [])

    async function getBranches ()  {
        let localBranches:branchInf[] = []
        let list = await getAllBranches(props.repo.currentValueOwner, props.repo.currentValueRepo)
            .catch((error)=> {
                console.log(error)
                setError(error)
                setIsFetching(false)
            })
        console.log(list)
        for (let i = 0; i < list!.length; i+=1){
            await getBranch(props.repo.currentValueOwner, props.repo.currentValueRepo, list![i].name)
                .then((response) => {
                    localBranches.push({
                        name: response.name,
                        date: response.commit.commit.author!.date!,
                        lastCommit: response.commit.sha,
                        lastCommitMsg: response.commit.commit.message,
                        lastCommitAuthor: response.commit.author!.login,
                        lastCommitAuthorImg: response.commit.author!.avatar_url,
                        lastCommitTree: response.commit.commit.tree!.sha,
                        protected: response.protected
                    })
                })
                .catch((error)=>{
                    setError(error)
                })
        }
        console.log(localBranches)
        setBranches(localBranches)
    }

    return (
        <div className={"rounded-sm bg-accent-second w-full text-white"}>
            <ModalPortal
                show={error !== "" || isFetching}
                closable={false}
                onClose={()=>{}}
                selector={"#modal"}
            >
                <div>
                    {(error!=="" &&
                        <ErrorModal errorMsg={error} onBack={props.onBack}/> ) ||
                    (isFetching &&
                        <LoadingOverlay show={isFetching}/>)}
                </div>
            </ModalPortal>
            <h2 className={"m-0"}>Save in branch...</h2>
            <div>{props.repo.currentValuePath}</div>
            {
                branches.map((item, key)=>
                    <ChangeBranchCard key={key}
                        branch={item}
                    />
                )
            }
        </div>
    )
}