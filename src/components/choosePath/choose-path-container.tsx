import {ChoosePath} from "./choose-path";
import React, {useEffect, useState} from "react";
import {useBranches} from "../../hooks/branches-hook";
import {LoadingContainer} from "../../loading/loading-container";
import {ErrorModal} from "../../modalPortal/error-modal";
import {ModalPortal} from "../../modalPortal/modal-portal";
import {useHistory, useParams} from 'react-router-dom';
import {nameNotResolve} from "../../types/errors-const";

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

export const ChoosePathContainer = () => {
    let {owner,
        repo} = useParams()
    const { getTreeFromSha, getAllBranches, getCommitSha } = useBranches()

    const [branches, setBranches] = useState<branch[]>([])
    const [indexBranch, setIndexBranch] = useState(0)
    const [isFetching, setIsFetching] = useState(true)
    const [typeModal, setTypeModal] = useState("")

    const [currentDir, setCurrentDir] = useState<string>("")
    const [currentTree, setCurrentTree] = useState<filePath[]>([])

    const history = useHistory()

    useEffect(()=>{
       getStartInfo()
    },[])

    /*useEffect(() => {
        setIsFetching(true)

        setIsFetching(false)
    },[indexBranch])*/

    async function getStartInfo(){
        setIsFetching(true)
        await getBranches(owner, repo)
            .then((response)=> {
                console.log(response)
                setBranches(response)
                //do not work from function here
                let localTree:filePath[] = []
                response[indexBranch].resp.forEach((item) => {
                    if (item.path.indexOf("/") == -1) localTree.push(item)
                })
                localTree.sort(compareLocalTree)
                setCurrentTree(localTree)
                //
                setCurrentDir("")
                setIsFetching(false)
            })
            .catch((error)=>{
                //setTypeModal(nameNotResolve)
                setIsFetching(false)
                console.log(error)
            })
    }

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
            await getCommitSha(branchesList[i].lastCommitSha, owner, repo)
                .then((resp)=> {
                    branchesList[i].lastCommitShaTree = resp.tree.sha
                    getTreeFromSha(resp.tree.sha, owner, repo)
                        .then((resp)=> {
                            branchesList[i].resp = resp.tree.map(arr => ({path: arr.path!, type:arr.type!}))
                        })
                        .catch((error)=>{
                            setTypeModal(error)
                            console.log(error)
                        })
                })
                .catch((error)=> {
                    setTypeModal(error)
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

    const compareLocalTree = (a:filePath, b:filePath) => {
        if ( a.type < b.type ){
            return 1;
        }
        if ( a.type > b.type ){
            return -1;
        }
        return 0;
    }

    const getFilePath = (index:number) => {
        let localTree:filePath[] = []
        branches[index].resp.forEach((item) => {
            if (item.path.indexOf("/") == -1) localTree.push(item)
        })
        localTree.sort(compareLocalTree)
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
        localTree.sort(compareLocalTree)
        setCurrentTree(localTree)
    }

    const setFile = (str:string) => {
        str = str.replace("$","/")
        history.push(`./${str}/editor/${branches[indexBranch].lastCommitSha}`)
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
                if (item.path.indexOf(path) == 0 &&
                    item.path.slice(path.length, item.path.length).indexOf("/") == -1)
                    localTree.push({path: item.path.slice(path.length, item.path.length),
                        type: item.type
                    })
            })
        }
        else {
            localTree = getFilePath(indexBranch)
        }
        localTree.sort(compareLocalTree)
        setCurrentTree(localTree)
    }

    const onReturnToList = () => {
        history.push('/userrepos')
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
                    <ErrorModal errorMsg={typeModal} onBack={() => history.push('/')}/>
                </ModalPortal>
                {(!isFetching && typeModal==="" && <ChoosePath branchesList={branches}
                            indexBranch={indexBranch} setIndexBranch={setBranch}
                                             setCurrDir={setDir}
                                             setFile={setFile}
                                             currDir={currentDir}
                                             currTree={currentTree}
                                             backDir = {backDir}
                                             owner={owner}
                                             repo={repo}
                                             onReturnToList={onReturnToList}
                />) ||
                <div className={"h-screen w-screen"}></div>}
            </div>
        </LoadingContainer>
    )
}