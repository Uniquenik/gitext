import {fileInfo} from "../../redux/editor-state/data-types";
import {ModalPortal} from "../modal-portal";
import {ChangeEvent, useEffect, useState} from "react";
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

export const defaultStateBranchInf = {
    name: "",
    date: "",
    lastCommit: "",
    lastCommitMsg: "",
    lastCommitAuthor: "",
    lastCommitAuthorImg: "",
    lastCommitTree: "",
    protected: false
}

export interface inputBranch {
    path: string,
    msg: string,
}

export const ChangeBranch = (props: {
    repo: fileInfo,
    isSave: boolean,
    onBack: (event:any) => void,
    onSave: (owner:string, repo:string, currentTreeName:string, treeName:string, path:string, msg:string) => void,
    onGet: (owner: string, repo: string, path: string, ref: string) => void
}) => {

    const [isFetching, setIsFetching] = useState(true)
    const [branches, setBranches] = useState<branchInf[]>([])
    const [error, setError] = useState("")
    const {getAllBranches, getBranch} = useBranches();
    const [currentBranch, setCurrentBranch] = useState("")
    const [currentInfo, setCurrentInfo] = useState<branchInf>(defaultStateBranchInf)
    const [inputs, setInputs] = useState<inputBranch>({path:"", msg: ""})

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
        let localBranches:branchInf[] = []
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
        localBranches.sort(compareLocalBranches)
        if (currentBranch) {
            setCurrentInfo(localBranches[0])
            setCurrentBranch(localBranches[0].name)
        }
        setBranches(localBranches)
    }

    const compareLocalBranches = (a: branchInf, b: branchInf) => {
        let a1 = Date.parse(a.date)
        let b1 = Date.parse(b.date)
        if (a1 < b1) return 1;
        if (a1 > b1) return -1;
        return 0;
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
        <div className={"rounded-sm bg-accent-second w-full text-white p-1"}>
            <ModalPortal
                show={error !== "" || isFetching}
                closable={false}
                onClose={()=>{}}
                selector={"#modal"}
            >
                    {(error!=="" &&
                        <ErrorModal errorMsg={error} onBack={props.onBack}/> ) ||
                    (isFetching &&
                        <LoadingOverlay/>)}
            </ModalPortal>
            <h2 className={"m-0 w-max"}>{(props.isSave && "Save in branch...") || "Restore from branch..."
            }</h2>
            <div className={"text-sm text-center"}>{props.repo.currentValueOwner}/{props.repo.currentValueRepo}</div>
            {(props.repo.currentValueBranch &&
            <div className={"text-center"}>Last commit in {props.repo.currentValueBranch}</div>)
            || <div>Quick save is not available, parent commit doesn't exist</div>
            }
            <div className={"max-h-70vh overflow-y-auto"}>
                <div className={"flex flex-row flex-wrap text-center"}>
                {
                    branches.map((item, key)=>
                        <div key={key} className={(currentBranch === item.name && "text-white text-xl") || "text-gray text-base"}>
                            <ChangeBranchCard
                                branch={item}
                                onClick={setCurrBranch}
                            />
                        </div>
                    )
                }
                </div>
                <div>
                    <div className={"text-sm py-2"}>{currentInfo.lastCommitMsg}</div>
                    <div className={"text-gray text-xs"}>{currentInfo.lastCommit}</div>
                    <div className={"flex py-1 flex-wrap gap-x-2"}>
                        <img src={currentInfo.lastCommitAuthorImg} alt={"avatar"} width={"20"}/>
                        <div className={"text-sm"}>{currentInfo.lastCommitAuthor}</div>
                        <div className={"flex-grow"}/>
                        <div className={"text-sm"}>{currentInfo.date}</div>
                    </div>
                    {(props.isSave &&
                    <div className={"py-1"}>
                        <input type={"text"}
                               name={"path"}
                               className={"w-full rounded-sm border border-gray-middle p-1 bg-dark"}
                               onChange={onChangeInput}
                               value={inputs.path}
                               placeholder={"Path"}
                        />
                        <input type={"text"}
                               name={"msg"}
                               className={"w-full rounded-sm border border-gray-middle p-1 bg-dark"}
                               onChange={onChangeInput}
                               value={inputs.msg}
                               placeholder={"Message commit"}
                        />
                        <button className={"w-full mt-2 px-4 py-2 rounded-sm text-sm font-medium border-0 transition text-white bg-black-second hover:bg-gray"}
                                onClick={onSaveContent} >Commit</button>
                    </div>) ||
                    <button className={"w-full mt-2 px-4 py-2 rounded-sm text-sm font-medium border-0 transition text-white bg-black-second hover:bg-gray"}
                            onClick={onGetContent} >Restore</button>
                    }
                </div>
            </div>
        </div>
    )
}