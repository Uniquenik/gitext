import {ChoosePath} from "./choose-path";
import React, {useEffect, useState} from "react";
import {useBranches} from "../../hooks/branches-hook";
import {LoadingContainer} from "../../loading/loading-container";
import {ErrorModal} from "../../modalPortal/error-modal";
import {ModalPortal} from "../../modalPortal/modal-portal";
import {useHistory} from 'react-router-dom';

export interface filePath {
    type:string,
    path:string
}

export interface branch {
    name: string,
    lastCommitSha: string,
    lastCommitShaTree: string,
    protected: boolean,
    resp: filePath[]
}

export const ChoosePathContainer = (props:{
    owner:string,
    repo:string
}) => {
    const { getTreeFromSha, getAllBranches, getCommitSha } = useBranches()

    const [branches, setBranches] = useState<branch[]>([])
    const [indexBranch, setIndexBranch] = useState(0)
    const [isFetching, setIsFetching] = useState(true)
    const [typeModal, setTypeModal] = useState("")

    const [currentDir, setCurrentDir] = useState<string>("")
    const [currentTree, setCurrentTree] = useState<filePath[]>([])

    const history = useHistory()

    useEffect(()=>{
        setIsFetching(true)
        getBranches(props.owner, props.repo)
            .then((resp)=> {
                setBranches(resp)
                console.log(resp)
                let localTree:filePath[] = []
                branches[indexBranch].resp.forEach((item) => {
                    if (item.path.indexOf("/") == -1) localTree.push(item)
                })
                setCurrentTree(localTree)
                setCurrentDir("")
                setIsFetching(false)
            })
            .catch((error)=>{
                setIsFetching(false)
                console.log("Global error")
            })
    },[])

    /*useEffect(() => {
        setIsFetching(true)

        setIsFetching(false)
    },[indexBranch])*/

    async function getBranches(owner:string,repo:string) {
        let branchesList:branch[] = []
        await getAllBranches(owner,repo)
            .then((resp) => {
                resp.forEach((item) =>
                    branchesList.push({
                        name: item.name,
                        lastCommitSha: item.commit.sha,
                        lastCommitShaTree: "",
                        protected: item.protected,
                        resp: []
                    })
                )
            })
            .catch((error)=> {
                setTypeModal(error)
                throw new Error(error)
            })
        for (let i = 0; i < branchesList.length; i++){
            await getCommitSha(branchesList[i].lastCommitSha, props.owner, props.repo)
                .then((resp)=> {
                    branchesList[i].lastCommitShaTree = resp.tree.sha
                    getTreeFromSha(resp.tree.sha, props.owner, props.repo)
                        .then((resp)=> {
                            branchesList[i].resp = resp.tree.map(arr => ({path: arr.path!, type:arr.type!}))
                        })
                        .catch((error)=>{
                            console.log(error)
                        })
                })
                .catch((error)=> {
                    console.log(error)
                })
        }
        return branchesList
    }

    const setBranch = (num:number) => {
        setCurrentDir("")
        setCurrentTree(getFilePath(num))
        setIndexBranch(num)
    }

    const getFilePath = (index:number) => {
        let localTree:filePath[] = []
        branches[index].resp.forEach((item) => {
            if (item.path.indexOf("/") == -1) localTree.push(item)
        })
        return localTree
    }

    const setDir = (str:string) => {
        setCurrentDir(currentDir+str+"/")
        let localTree:filePath[] = []
        if (currentDir+str+"/"!==""){
            branches[indexBranch].resp.forEach((item) => {
                if(item.path.indexOf(currentDir+str+"/") == 0 &&
                    item.path.slice((currentDir+str+"/").length, item.path.length).indexOf("/") == -1)
                    localTree.push({path: item.path.slice((currentDir+str+"/").length, item.path.length),
                                    type: item.type
                    })
            })
        }
        else {
            localTree = getFilePath(indexBranch)
        }
        setCurrentTree(localTree)
    }

    const setFile = (str:string) => {
        str = str.replace("$","/")
        history.push(`./${str}/`)
    }

    const backDir = () => {
        let path
        if (currentDir.indexOf('/') != currentDir.length)
            path = currentDir.slice(0, currentDir.slice(0,-1).lastIndexOf('/')+1)
        else path = ""
        setCurrentDir(path)
        let localTree:filePath[] = []
        if (path!==""){
            branches[indexBranch].resp.forEach((item) => {
                if(item.path.indexOf(path) == 0 &&
                    item.path.slice(path.length, item.path.length).indexOf("/") == -1)
                    localTree.push({path: item.path.slice(path.length, item.path.length),
                        type: item.type
                    })
            })
        }
        else {
            localTree = getFilePath(indexBranch)
        }
        setCurrentTree(localTree)
    }

    return(
        <LoadingContainer show={isFetching} errorMsg={""}>
            <div className={"w-full h-full"}>
                <ModalPortal
                    show={typeModal !== ""}
                    onClose={""}
                    selector={'#modal'}
                    closable={false}
                >
                    <ErrorModal errorMsg={typeModal}/>
                </ModalPortal>
                {(!isFetching && <ChoosePath branchesList={branches}
                            indexBranch={indexBranch} setIndexBranch={setBranch}
                                             setCurrDir={setDir}
                                             setFile={setFile}
                                             currDir={currentDir}
                                             currTree={currentTree}
                                             backDir = {backDir}
                />) ||
                <div className={"h-screen w-screen"}></div>}
            </div>
        </LoadingContainer>
    )
}