import React, {useEffect, useState} from "react";
import {useCommits} from "../../hooks/commits-hook";
import {useDispatch, useSelector} from "react-redux";
import {RootReducer} from "../../redux";
import {
    setCurrentValueInfo,
    setIsSaveCurrentValue,
    setIsSaveCurrentValueGit,
    setValueText
} from "../../redux/editor-state/editor-action-creators";
import {
    CHANGE_BRANCH_GET,
    CHANGE_BRANCH_SAVE,
    CHANGE_REPO_MSG,
    OVERRIDE_VALUE
} from "../../types/data-types";
import {useBranches} from "../../hooks/branches-hook";
import {getCommit404, getRepPermission, wrongExtensionLine} from "../../types/errors-const";
import {ModalPortal} from "../../modalPortal/modal-portal";
import {useHistory, useParams} from 'react-router-dom'
import {ErrorModal} from "../../modalPortal/error-modal";
import {ChangeOverrideMsg} from "../../modalPortal/modalContent/change-override-msg";
import {LoadingOverlay} from "../../loading/loading-overlay";
import {ChangeBranch} from "../../modalPortal/modalContent/change-branch";
import {b64DecodeUnicode} from "../other/decode";
import {TinymceEditor} from "./tinymce-editor";
import {ReactComponent as Local } from "./image/localsave.svg"
import {ReactComponent as Cloud } from "./image/cloudsave.svg"


const EditorContainer = () => {
    const per_page = 100;
    let { owner, repo, path, commitSha } = useParams()

    const editorStatus: any = useSelector<RootReducer>(state => state.editor);
    const dispatch = useDispatch();

    const [value, setValue] = useState(() => editorStatus.currentValue)
    const [isFetching, setIsFetching] = useState(true)
    const [isFetchingEditor, setIsFetchingEditor] = useState(true)
    const [typeModal, setTypeModal] = useState("")

    const {
        getSingleTree, getSingleCommit, createBlob, createTree, createCommit, updateRef, getBlob, getRep, getBlobFromFileSha
    } = useCommits()
    const {getCommitSha, getTreeFromSha, getAllBranches, getTreesCommits} = useBranches()

    let history = useHistory()

    useEffect(() => {
        onStart()
            .catch(() => console.log('Global error'))
    }, [])

    useEffect(() => {
        onStart()
            .catch(() => console.log('Global error'))
    }, [owner, repo, path, commitSha])

    async function onStart() {
        setIsFetching(true)
        setIsFetchingEditor(true)
        let pathNew = path.replaceAll("$", "/")
        if (!commitSha && editorStatus.currentValueOwner.toUpperCase() === owner.toUpperCase() &&
            editorStatus.currentValuePath.toUpperCase() === pathNew.toUpperCase() &&
            editorStatus.currentValueRepo.toUpperCase() === repo.toUpperCase()
        ) {
            setIsFetching(false)
        } else {
            checkCorrectData(owner, repo, commitSha)
                .then(() => {
                    if (!editorStatus.currentValueOwner && !editorStatus.currentValueRepo && !editorStatus.currentValuePath)
                        //if editor is empty
                        getCommitFileAndBranch(owner, repo, pathNew, commitSha)
                            .then((branch) => {
                                dispatch(setCurrentValueInfo({
                                    currentValueOwner: owner,
                                    currentValuePath: pathNew,
                                    currentValueRepo: repo,
                                    currentValueParentCommit: commitSha,
                                    currentValueBranch: branch!
                                }))
                                setIsFetching(false)
                            })
                            .catch((error) => {
                                console.log(error)
                                setIsFetching(false)
                            })
                    else {
                        if (owner.toUpperCase() !== editorStatus.currentValueOwner.toUpperCase() ||
                            repo.toUpperCase() !== editorStatus.currentValueRepo.toUpperCase() ||
                            pathNew.toUpperCase() !== editorStatus.currentValuePath.toUpperCase())
                            setTypeModal(CHANGE_REPO_MSG)
                        else setTypeModal(OVERRIDE_VALUE)
                        setIsFetching(false)
                    }
                })
                .catch((error) => {
                    setIsFetching(false)
                    console.log(error)
                })
        }
    }

    //check exists and permissions
    async function checkCorrectData(owner: string, repo: string, commitSha: string) {
        let repInfo = await getRep(owner, repo)
            .catch((error) => {
                setTypeModal(error)
                throw new Error(error)
            })
        if (!repInfo.permissions || !repInfo.permissions.pull || !repInfo.permissions.push) {
            setTypeModal(getRepPermission)
            console.log(getRepPermission)
            throw new Error(getRepPermission)
        }
        if (commitSha) {
            await getCommitSha(commitSha, owner, repo)
                .catch((error)=> {
                    setTypeModal(error)
                    throw new Error(error)
                })
        }
    }

    async function getCommitFileAndBranch(owner: string, repo: string, path: string, commitSha: string) {
        //return branch for redux
        let branch = ""
        if (path.split('.').pop() !== 'html') {
            setTypeModal(wrongExtensionLine)
            throw new Error(wrongExtensionLine)
        }
        await getCommitSha(commitSha, owner, repo)
            .then((treeSha) => {
                return getTreeFromSha(treeSha.tree.sha, owner, repo)
            })
            .then((tree) => {
                let fileSha = ""
                for (let i = 0; i < tree.tree.length; i++) {
                    if (tree.tree[i].path === path && tree.tree[i].sha !== undefined)
                        fileSha = tree.tree[i].sha!
                }
                return getBlobFromFileSha(owner, repo, fileSha)
            })
            .then((fileContent) => {
                let file = b64DecodeUnicode(fileContent.content)
                setValue(file)
                dispatch(setValueText(file))
                dispatch(setIsSaveCurrentValueGit(true))
            })
            .catch((error) => {
                console.log(error)
                setTypeModal(error)
                throw new Error(error)
            })
        //search branch for this commit
        let getBranches = await getAllBranches(owner, repo)
            .catch((error) => {
                setTypeModal(error)
                throw new Error(error)
            })
            let i = 0;
            while (branch === "" && getBranches.length > i) {
                let treeCommits = await getTreesCommits(owner, repo, getBranches[i].name, per_page)
                    .catch((error) => {
                        setTypeModal(error)
                        throw new Error(error);
                    })
                for (let j = 0; j < treeCommits.length && branch === ""; j++) {
                    if (treeCommits[j].sha === commitSha) branch = getBranches[i].name;
                }
                i += 1
            }
        return branch
    }

    async function saveContentInGit(owner:string, repo:string, currentTreeName:string, treeName:string, path:string, msg:string) {
        setTypeModal("")
        setIsFetching(true)
        if (currentTreeName === "") currentTreeName = treeName
        let pathNew = path.replace("$", "/")
        let lastCommitSha
        await getSingleTree(owner, repo, currentTreeName)
            .then(response => {
                return getSingleCommit(owner, repo, response.sha)
            })
            .then(getCommitFromTree => {
                lastCommitSha = getCommitFromTree.sha
                return createBlob(owner, repo, value)
            })
            .then(newBlob => {
                return createTree(lastCommitSha, owner, repo, newBlob.sha, pathNew)
            })
            .then(newTree => {
                return createCommit(owner, repo, msg, lastCommitSha, newTree.sha)
            })
            .then(newCommit => {
                updateRef(owner, repo, treeName, newCommit.sha)
                setIsFetching(false)
                alert("Content successfully saved in Git")
                dispatch(setIsSaveCurrentValueGit(true))
                dispatch(setIsSaveCurrentValue(true))
                dispatch(setCurrentValueInfo({
                    currentValueOwner: owner,
                    currentValuePath: pathNew,
                    currentValueRepo: repo,
                    currentValueParentCommit: newCommit.sha,
                    currentValueBranch: treeName
                }))
            })
            .catch(error => {
                setTypeModal(error)
                console.log(error);
                setIsFetching(false)
            });
    }


    async function reviveFromGit(owner: string, repo: string, path: string, ref: string) {
        setTypeModal("")
        setIsFetching(true)
        await getRep(owner, repo)
            .then(reps => {
                //console.log(reps)
                //check permissions
                if (reps.permissions && reps.permissions.pull && reps.permissions.push) {
                    return reps.owner.login
                } else if (reps.permissions && (!reps.permissions.pull || !reps.permissions.push)) {
                    setTypeModal(getRepPermission)
                    throw new Error("Permission Error")
                }
                setTypeModal(getCommit404)
                throw new Error("Not found")
            })
            .then(owner => {
                return getBlob(owner, repo, path, ref)
            })
            .then(infoFile => {
                // (??) only this place need ts-ignore
                //@ts-ignore
                let file = b64DecodeUnicode(infoFile.content)
                dispatch(setValueText(file))
                setValue(file)
                dispatch(setIsSaveCurrentValueGit(true))
                dispatch(setIsSaveCurrentValue(true))
                dispatch(setCurrentValueInfo({
                    currentValueOwner: owner,
                    currentValuePath: path,
                    currentValueRepo: repo,
                    //@ts-ignore
                    currentValueParentCommit: infoFile.sha,
                    currentValueBranch: ref
                }))
                setIsFetching(false)
            })
            .catch(error => {
                setTypeModal(error)
                console.log(error);
                setIsFetching(false)
            });
    }

    const onBack = () => {
        setTypeModal("")
        history.goBack()
    }

    const onReturn = () => {
        setTypeModal("")
        history.push(`/${editorStatus.currentValueOwner}/${editorStatus.currentValueRepo}/`+
            `${editorStatus.currentValuePath.replaceAll("/", "$")}/editor/`)
    }

    const onOverride = () => {
        setTypeModal("")
        setIsFetching(true)
        let pathNew = path.replaceAll("$", "/")
        //if empty - create new
        if (!commitSha) {
            setValue("")
            dispatch(setValueText(""))
            dispatch(setIsSaveCurrentValue(true))
            dispatch(setCurrentValueInfo({
                currentValueOwner: owner,
                currentValuePath: pathNew,
                currentValueRepo: repo,
                currentValueParentCommit: "",
                currentValueBranch: ""
            }))
            setIsFetching(false)
        } else {
            getCommitFileAndBranch(owner, repo, pathNew, commitSha)
                .then((branch) => {
                    dispatch(setCurrentValueInfo({
                        currentValueOwner: owner,
                        currentValuePath: pathNew,
                        currentValueRepo: repo,
                        currentValueParentCommit: commitSha,
                        currentValueBranch: branch!
                    }))
                    setIsFetching(false)
                    history.push('./')
                })
                .catch((error) => {
                    if (typeModal === "") setTypeModal(error)
                    setIsFetching(false)
                    console.log(error)
                })
        }
    }

    const onBackError = () => {
        history.goBack()
        setTypeModal("")
    }

    const onFocusOutSave = () => {
        dispatch(setValueText(value))
        dispatch(setIsSaveCurrentValue(true))
    }

    const onEditorChange = (newValue:string) => {
        setValue(newValue)
        if (editorStatus.isSaveCurrentValue) dispatch(setIsSaveCurrentValue(false))
        if (editorStatus.isSaveCurrentValueGit) dispatch(setIsSaveCurrentValueGit(false))
    }

    const saveOnGit = () => {
        if (editorStatus.currentValueBranch) {
            saveContentInGit(owner, repo, editorStatus.currentValueBranch,
                editorStatus.currentValueBranch, editorStatus.currentValuePath, "Quick save in current branch")
                .catch(error => {
                    setTypeModal(error)
                    console.log(error);
                });
        }
        else {setTypeModal(CHANGE_BRANCH_SAVE)}
    }

    const reviveGit = () => {
        if (editorStatus.currentValueBranch) {
            reviveFromGit(owner, repo, editorStatus.currentValuePath, editorStatus.currentValueBranch)
                //.then(() => console.log("ok"))
                .catch(error => {
                    setTypeModal(error)
                    console.log(error);
                });
        }
        else setTypeModal(CHANGE_BRANCH_GET)
    }

    const onNewBranch = () => {

    }

    return (
        <>
            <div className={"h-screen"}>
                <ModalPortal
                    show={typeModal !== "" || isFetching || isFetchingEditor}
                    onClose={() => {if (typeModal === CHANGE_BRANCH_SAVE || typeModal === CHANGE_BRANCH_GET) setTypeModal("")}}
                    selector={'#modal'}
                    closable={((typeModal === CHANGE_BRANCH_SAVE || typeModal === CHANGE_BRANCH_GET) && true) || false}
                >
                    {((typeModal === CHANGE_REPO_MSG || typeModal === OVERRIDE_VALUE) &&
                        <ChangeOverrideMsg
                                       isChange={(typeModal === CHANGE_REPO_MSG && true) || false}
                                       currentContent={value}
                                       saveGit={editorStatus.isSaveCurrentValueGit}
                                       from={{
                                           currentValueBranch: editorStatus.currentValueBranch,
                                           currentValueParentCommit: editorStatus.currentValueParentCommit,
                                           currentValueRepo: editorStatus.currentValueRepo,
                                           currentValuePath: editorStatus.currentValuePath,
                                           currentValueOwner: editorStatus.currentValueOwner
                                       }}
                                       to={{
                                           currentValueBranch: "",
                                           currentValueOwner: owner,
                                           currentValuePath: path.replace("$", "/"),
                                           currentValueRepo: repo,
                                           currentValueParentCommit: commitSha
                                       }}
                                       onBack={onBack}
                                       onReturn={onReturn}
                                       onEdit={onOverride}
                        />) || (
                        (typeModal === CHANGE_BRANCH_SAVE || typeModal === CHANGE_BRANCH_GET) &&
                       <ChangeBranch
                           onNewBranch={onNewBranch}
                           isSave={(typeModal === CHANGE_BRANCH_SAVE && true) || false}
                           onGet={reviveFromGit}
                           onBack={()=> {setTypeModal("")}}
                           onSave={saveContentInGit}
                           repo={{
                               currentValueBranch: editorStatus.currentValueBranch,
                               currentValueParentCommit: editorStatus.currentValueParentCommit,
                               currentValueRepo: editorStatus.currentValueRepo,
                               currentValuePath: editorStatus.currentValuePath,
                               currentValueOwner: editorStatus.currentValueOwner
                           }}
                       />
                    ) ||
                    (typeModal &&
                        <ErrorModal errorMsg={typeModal} onBack={onBackError}/>) ||
                    ((isFetching || isFetchingEditor) &&
                        <LoadingOverlay msg={(isFetchingEditor && "Load editors components...") || "Loading..."}/>)
                    }
                </ModalPortal>
                <div className={"h-full flex flex-col"}>
                    <div className={"flex-grow"}>
                        <TinymceEditor value={value}
                                       onFocusOutSave={onFocusOutSave}
                                       onEditorChange={onEditorChange}
                                       setTypeModal={setTypeModal}
                                       quickSave={saveOnGit}
                                       quickRestore={reviveGit}
                                       history={(name)=>history.push(name)}
                                       setIsFetchingEditor={setIsFetchingEditor}
                        />
                    </div>
                    <div className={"flex flex-wrap flex-row bg-accent text-white text-sm px-2.5"}>
                        <div className={"flex"}>{editorStatus.currentValueOwner}/{editorStatus.currentValueRepo}</div>
                        <div
                            className={"flex"}>:{editorStatus.currentValuePath} in {editorStatus.currentValueBranch}</div>
                        <div className={"flex-grow"}/>
                        <div className={"flex gap-x-1"}>{
                            ((editorStatus.isSaveCurrentValue &&
                                <Local fill={"#FFFFFF"} className={"p-0.5"} height={"20"} width={"20"} />) ||
                                <Local fill={"#575757"} className={"p-0.5"} height={"20"} width={"20"} />)}
                            {((editorStatus.isSaveCurrentValueGit &&
                                <Cloud fill={"#FFFFFF"} height={"20"} width={"20"}/>) ||
                                <Cloud fill={"#575757"} height={"20"} width={"20"}/>
                            )}</div>
                    </div>
                </div>
            </div>
        </>

    )

}

export default EditorContainer