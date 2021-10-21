import {fileInfo} from "../../redux/editor-state/data-types";
import {ModalPortal} from "../modal-portal";
import React, {ChangeEvent, useEffect, useState} from "react";
import {LoadingOverlay} from "../../loading/loading-overlay";
import {useBranches} from "../../hooks/branches-hook";
import {ErrorModal} from "../error-modal";
import {ChangeBranchCard} from "./change-branch-card";
import {compareLocalBranchesByDate} from "../../types/comparators";
import {branchInfoInModal, defaultStateBranchInfoInModal, inputBranchModal} from "./data-types";

export const ChangeBranch = (props: {
    repo: fileInfo,
    isSave: boolean,
    onNewBranch: (event:any)=> void,
    onBack: (event:any) => void,
    onSave: (owner:string, repo:string, currentTreeName:string, treeName:string, path:string, msg:string) => void,
    onGet: (owner: string, repo: string, path: string, ref: string) => void
}) => {

    const [isFetching, setIsFetching] = useState(true)
    const [branches, setBranches] = useState<branchInfoInModal[]>([])
    const [error, setError] = useState("")
    const {getAllBranches, getBranch} = useBranches();
    const [currentBranch, setCurrentBranch] = useState("")
    const [currentInfo, setCurrentInfo] = useState<branchInfoInModal>(defaultStateBranchInfoInModal)
    const [inputs, setInputs] = useState<inputBranchModal>({path:"", msg: ""})

    const onChangeInput = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
        setInputs({...inputs, [name]:value})
    }

    useEffect(() => {
        setCurrentBranch(props.repo.currentValueBranch)
        setInputs({...inputs, path: props.repo.currentValuePath})
        setIsFetching(true)
        getBranches()
            .then(()=> {
                setIsFetching(false)
            })
    }, [])

    async function getBranches ()  {
        let localBranches:branchInfoInModal[] = []
        let list = await getAllBranches(props.repo.currentValueOwner, props.repo.currentValueRepo)
            .catch((error)=> {
                console.log(error)
                setError(error)
                setIsFetching(false)
            })
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
                    if (response.name === props.repo.currentValueBranch) setCurrentInfo(localBranches[localBranches.length-1])
                })
                .catch((error)=>{
                    setError(error)
                })
        }
        localBranches.sort(compareLocalBranchesByDate)
        if (currentBranch) {
            setCurrentInfo(localBranches[0])
            setCurrentBranch(localBranches[0].name)
        }
        setBranches(localBranches)
    }

    const setCurrBranch = (name:string) => {
        setCurrentBranch(name)
        let ind = branches.findIndex((element) => element.name === name)
        setCurrentInfo(branches[ind])
    }

    const onSaveContent = () => {
        props.onSave(props.repo.currentValueOwner, props.repo.currentValueRepo, props.repo.currentValueBranch,
            currentBranch, inputs.path, inputs.msg)
    }

    const onGetContent = () => {
        props.onGet(props.repo.currentValueOwner, props.repo.currentValueRepo,
            props.repo.currentValuePath, currentBranch)
    }

    return (
        <div className={"rounded-md bg-accent-second w-full text-white"}>
            <ModalPortal
                show={error !== "" || isFetching}
                closable={false}
                onClose={()=>{}}
                selector={"#modal"}
            >
                    {(error!=="" &&
                        <ErrorModal errorMsg={error} onBack={props.onBack}/> ) ||
                    (isFetching &&
                        <div className={"bg-opacity-50 w-screen h-screen z-40 bg-black"}>
                            <LoadingOverlay/>
                        </div>)}
            </ModalPortal>
            <div className={"w-full border-b border-black"}>
                <h2 className={"m-0 w-max px-2"}>{(props.isSave && "Save in branch...") || "Restore from branch..."
                }</h2>
            </div>
            <div className={"text-sm text-center px-2 pt-1 text-gray"}>{props.repo.currentValueOwner}/{props.repo.currentValueRepo}</div>
            {(!props.repo.currentValueBranch &&
                <div>Quick save is not available, parent commit doesn't exist</div>)
            }
            <div className={"text-center text-sm px-2"}>
                Select branch:
            </div>
            <div className={"max-h-70vh overflow-y-auto"}>
                <div className={"flex flex-row flex-wrap text-center"}>
     {/*           {
                    (props.isSave &&
                        <div>
                            <button onClick={props.onNewBranch}>
                                <div className={"px-2 py-1 text-gray hover:text-white flex-grow"}>
                                    <div className={"m-0"}>+</div>
                                    <div className={"text-xs"}>New branch</div>
                                </div>
                            </button>
                        </div>)}*/}
                    {branches.map((item, key)=>
                        <div key={key} className={(currentBranch === item.name && "text-white flex-grow text-xl") || "text-gray flex-grow text-base"}>
                            <ChangeBranchCard
                                branch={item}
                                onClick={setCurrBranch}
                            />
                        </div>
                    )}
                </div>
                <div>
                    <div className={"text-sm pt-2 px-2"}>{currentInfo.lastCommitMsg}</div>
                    <div className={"flex pt-2 px-2 flex-wrap gap-x-2"}>
                        <img src={currentInfo.lastCommitAuthorImg} alt={"avatar"} width={"20"}/>
                        <div className={"text-sm"}>{currentInfo.lastCommitAuthor}</div>
                        <div className={"flex-grow"}/>
                        <div className={"text-sm"}>{currentInfo.date}</div>
                    </div>
                    <div className={"text-gray px-2 text-xs"}>{currentInfo.lastCommit}</div>
                    {(props.isSave &&
                    <div className={""}>
                        <div className={"px-2"}>
                            <input type={"text"}
                                   name={"path"}
                                   className={"w-full rounded-sm border border-gray-middle p-1 my-1 px-2 bg-dark"}
                                   onChange={onChangeInput}
                                   value={inputs.path}
                                   placeholder={"Path"}
                            />
                            <input type={"text"}
                                   name={"msg"}
                                   className={"w-full rounded-sm border border-gray-middle px-2 my-1 p-1 bg-dark"}
                                   onChange={onChangeInput}
                                   value={inputs.msg}
                                   placeholder={"Message commit"}
                            />
                        </div>
                        <button className={"w-full mt-1 px-4 py-3 border-0 transition text-white bg-black-second hover:bg-gray"}
                                onClick={onSaveContent} >Commit</button>
                    </div>) ||
                    <button className={"w-full mt-1 px-4 py-3 border-0 transition text-white bg-black-second hover:bg-gray"}
                            onClick={onGetContent} >Restore</button>
                    }
                </div>
            </div>
        </div>
    )
}