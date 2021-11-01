import {ChangePath} from "./change-path";
import React, {useEffect, useState} from "react";
import {ErrorModal} from "../../modalPortal/error-modal";
import {ModalPortal} from "../../modalPortal/modal-portal";
import {useHistory, useParams} from 'react-router-dom';
import {LoadingOverlay} from "../../loading/loading-overlay";
import {branchChoosePath, filePath} from "./data-types";
import {compareLocalTreeByType} from "../../types/comparators";
import {useChangePath} from "./gh-change-path";


export const ChangePathContainer = () => {
    let {owner, repo, option} = useParams()

    const [branches, setBranches] = useState<branchChoosePath[]>([])
    const [indexBranch, setIndexBranch] = useState(0)
    const [isFetching, setIsFetching] = useState(true)
    const [typeModal, setTypeModal] = useState("")
    const {getBranchesGH} = useChangePath()

    const [currentDir, setCurrentDir] = useState<string>("")
    const [currentTree, setCurrentTree] = useState<filePath[]>([])
    const [statusLoading, setStatusLoading] = useState("")

    //open on editor or commits compare
    const [isEditGlobal, setIsEditGlobal] = useState(true)
    const [isEdit, setIsEdit] = useState(true)

    const onChangeRadio = (e:any) => setIsEdit(e.target.value !== "compare")

    const history = useHistory()

    useEffect(() => {
        if (option === 'branches') setIsEditGlobal(false)
        else setIsEditGlobal(true)
        getStartInfo(owner, repo)
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

    async function getStartInfo(owner: string, repo: string) {
        setIsFetching(true)
        setIndexBranch(0)
        await getBranchesGH(owner, repo, setStatusLoading)
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
                console.log(error)
                setTypeModal(error)
                throw new Error(error)
            })
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
                    <LoadingOverlay msg={statusLoading && "Get branches... "+statusLoading || "Analyze..."}/>)}
            </ModalPortal>
            <ChangePath branchesList={branches}
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