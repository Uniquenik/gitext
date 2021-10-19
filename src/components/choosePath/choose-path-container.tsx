import {ChoosePath} from "./choose-path";
import React, {useEffect, useState} from "react";
import {useBranches} from "../../hooks/branches-hook";
import {ErrorModal} from "../../modalPortal/error-modal";
import {ModalPortal} from "../../modalPortal/modal-portal";
import {useHistory, useParams} from 'react-router-dom';
import {LoadingOverlay} from "../../loading/loading-overlay";
import {branchChoosePath, filePath} from "./data-types";
import {compareLocalTreeByType} from "../../types/comparators";


export const ChoosePathContainer = () => {
    let {owner, repo, option} = useParams()
    const {getTreeFromSha, getAllBranches, getCommitSha} = useBranches()

    const [branches, setBranches] = useState<branchChoosePath[]>([])
    const [indexBranch, setIndexBranch] = useState(0)
    const [isFetching, setIsFetching] = useState(true)
    const [typeModal, setTypeModal] = useState("")

    const [currentDir, setCurrentDir] = useState<string>("")
    const [currentTree, setCurrentTree] = useState<filePath[]>([])

    //open on editor or commits compare
    const [isEditGlobal, setIsEditGlobal] = useState(true)
    const [isEdit, setIsEdit] = useState(true)

    const onChangeRadio = (e) => setIsEdit(e.target.value !== "compare")

    const history = useHistory()

    useEffect(() => {
        if (option === 'branches') setIsEditGlobal(false)
        else setIsEditGlobal(true)
        getStartInfo()
            .catch((error) => {
                console.log(error)
            })
    }, [])

    const getFilePath = (index: number) => {
        let localTree: filePath[] = []
        branches[index].resp.forEach((item) => {
            if (item.path.indexOf("/") === -1) localTree.push(item)
        })
        localTree.sort(compareLocalTreeByType)
        return localTree
    }

    async function getStartInfo() {
        setIsFetching(true)
        setIndexBranch(0)
        await getBranches(owner, repo)
            .then((response) => {
                //do not work from function here
                let localTree: filePath[] = []
                //get files path for all branches
                response[indexBranch].resp.forEach((item) => {
                    if (item.path.indexOf("/") === -1) localTree.push(item)
                })
                localTree.sort(compareLocalTreeByType)
                setBranches(response)
                setCurrentTree(localTree)
                setCurrentDir("")
                setIsFetching(false)
            })
            .catch((error) => {
                setIsFetching(false)
                throw new Error(error)
            })
    }

    async function getBranches(owner: string, repo: string) {
        let branchesList: branchChoosePath[] = []
        let allBranches = await getAllBranches(owner, repo)
            .catch((error) => {
                setTypeModal(error)
                throw new Error(error)
            })
        console.log("Get last commits from branches...")
        for (let i = 0; i<allBranches.length; i+=1) {
            console.log(i+1, "/", allBranches.length)
            let lastCommit = await getCommitSha(allBranches[i].commit.sha, owner, repo)
            let trees = await getTreeFromSha(lastCommit.tree.sha, owner, repo)
            let paths = trees.tree.map(arr => ({path: arr.path!, type: arr.type!}))
            branchesList.push({
                name: allBranches[i].name,
                lastCommitSha: allBranches[i].commit.sha,
                lastCommitShaTree: lastCommit.tree.sha,
                protected: allBranches[i].protected,
                resp: paths
            })
        }
        return branchesList
    }

    const setBranch = (num: number) => {
        setCurrentDir("")
        setCurrentTree(getFilePath(num))
        setIndexBranch(num)
    }

    const setDir = (str: string) => {
        setCurrentDir(currentDir + str + "/")
        let localTree: filePath[] = []
        if (currentDir + str + "/" !== "") {
            branches[indexBranch].resp.forEach((item) => {
                if (item.path.indexOf(currentDir + str + "/") === 0 &&
                    item.path.slice((currentDir + str + "/").length, item.path.length).indexOf("/") === -1)
                    localTree.push({
                        path: item.path.slice((currentDir + str + "/").length, item.path.length),
                        type: item.type
                    })
            })
        }
        else {
            localTree = getFilePath(indexBranch)
        }
        localTree.sort(compareLocalTreeByType)
        setCurrentTree(localTree)
    }

    const setFile = (str: string) => {
        let str1 = str.replace("/", "$")
        let currDir = currentDir.replaceAll("/", "$")
        if (!isEditGlobal) history.push(`../${currDir + str1}/branches/${branches[indexBranch].lastCommitSha}`)
        else if (!isEdit) history.push(`./${currDir + str1}/branches/${branches[indexBranch].lastCommitSha}`)
        else history.push(`./${currDir + str1}/editor/${branches[indexBranch].lastCommitSha}`)
    }

    const backDir = () => {
        let path
        if (currentDir.indexOf('/') !== currentDir.length)
            path = currentDir.slice(0, currentDir.slice(0, -1).lastIndexOf('/') + 1)
        else path = ""
        setCurrentDir(path)
        let localTree: filePath[] = []
        if (path !== "") {
            branches[indexBranch].resp.forEach((item) => {
                if (item.path.indexOf(path) === 0 &&
                    item.path.slice(path.length, item.path.length).indexOf("/") === -1)
                    localTree.push({
                        path: item.path.slice(path.length, item.path.length),
                        type: item.type
                    })
            })
        } else {
            localTree = getFilePath(indexBranch)
        }
        localTree.sort(compareLocalTreeByType)
        setCurrentTree(localTree)
    }

    const onReturnToList = () => history.push('/userrepos')

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
                    <ErrorModal errorMsg={typeModal} onBack={onReturnToList}/>) ||
                (isFetching &&
                    <LoadingOverlay/>)}
            </ModalPortal>
            <ChoosePath branchesList={branches}
                        indexBranch={indexBranch} setIndexBranch={setBranch}
                        setCurrDir={setDir}
                        setFile={setFile}
                        currDir={currentDir}
                        currTree={currentTree}
                        backDir={backDir}
                        owner={owner}
                        repo={repo}
                        onChangeRadio={onChangeRadio}
                        onReturnToList={onReturnToList}
                        isEditGlobal={isEditGlobal}
            />
        </>
    )
}