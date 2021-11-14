import React, {useEffect, useState} from "react";
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
import {ModalPortal} from "../../modalPortal/modal-portal";
import {useHistory, useParams} from 'react-router-dom'
import {ErrorModal} from "../../modalPortal/error-modal";
import {ChangeOverrideMsg} from "../../modalPortal/modalContent/change-override-msg";
import {LoadingOverlay} from "../../loading/loading-overlay";
import {ChangeBranch} from "../../modalPortal/modalContent/change-branch";
import {TinymceEditor} from "./tinymce-editor";
import {ReactComponent as Local } from "./image/localsave.svg"
import {ReactComponent as Cloud } from "./image/cloudsave.svg"
import {useEditorData} from "./git-editor";
import {defaultFileInfoState} from "./data-types";


const EditorContainer = () => {
    const per_page = 100;
    let { owner, repo, path, commitSha } = useParams()

    const editorStatus: any = useSelector<RootReducer>(state => state.editor);
    const dispatch = useDispatch();

    const [value, setValue] = useState(() => editorStatus.currentValue)
    const [isFetching, setIsFetching] = useState(true)
    const [isFetchingEditor, setIsFetchingEditor] = useState(true)
    const [typeModal, setTypeModal] = useState("")

    const {onStartGH, getCommitFileAndBranchGH, saveContentInGitGH, reviveFromGitGH} = useEditorData()

    let history = useHistory()

    useEffect(() => {
        setIsFetching(true)
        setIsFetchingEditor(true)
        onStart()
            //.catch(() => console.log('Global error'))
    }, [])

    useEffect(() => {
        setIsFetching(true)
        setIsFetchingEditor(true)
        onStart()
            //.catch(() => console.log('Global error'))
    }, [owner, repo, path, commitSha])

    const onStart = () => {
        onStartGH(owner, repo, commitSha, path, 30, {
            currentValueOwner: editorStatus.currentValueOwner,
            currentValuePath: editorStatus.currentValuePath,
            currentValueRepo: editorStatus.currentValueRepo,
            currentValueParentCommit: editorStatus.currentValueParentCommit,
            currentValueBranch: editorStatus.currentValueBranch
        })
            .then((resp) => {
                if (resp.typeModal) setTypeModal(resp.typeModal)
                else if (!resp.isCheck && resp.currentValueInfo && resp.value) {
                    if (resp.currentValueInfo !== defaultFileInfoState) dispatch(setCurrentValueInfo(resp.currentValueInfo))
                    setValue(resp.value)
                    dispatch(setValueText(resp.value))
                    dispatch(setIsSaveCurrentValueGit(true))
                }
                setIsFetching(false)
                setIsFetchingEditor(false)
                })
            .catch((error) => {
                setIsFetching(false)
                setIsFetchingEditor(false)
                setTypeModal(error)
            })
    }

    const saveContentInGit = (owner:string, repo:string, currentTreeName:string, treeName:string, path:string, msg:string) => {
        setTypeModal("")
        setIsFetching(true)
        saveContentInGitGH(owner, repo, currentTreeName, treeName, path, msg, value)
            .then((resp)=> {
                setIsFetching(false)
                dispatch(setIsSaveCurrentValueGit(true))
                dispatch(setIsSaveCurrentValue(true))
                dispatch(setCurrentValueInfo(resp))
            })
            .catch((error)=> {
                setIsFetching(false)
                setTypeModal(error)
            })
    }

    const reviveFromGit = (owner: string, repo: string, path: string, ref: string) => {
        setTypeModal("")
        setIsFetching(true)
        reviveFromGitGH(owner, repo, path, ref)
            .then((resp)=> {
                dispatch(setValueText(resp.value))
                setValue(resp.value)
                dispatch(setCurrentValueInfo(resp.currentValueInfo))
                dispatch(setIsSaveCurrentValueGit(true))
                dispatch(setIsSaveCurrentValue(true))
                setIsFetching(false)
            })
            .catch((error)=>{
                setTypeModal(error)
                setIsFetching(false)
            })
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
            getCommitFileAndBranchGH(owner, repo, pathNew, commitSha, 30)
                .then((resp) => {
                    dispatch(setCurrentValueInfo({
                        currentValueOwner: owner,
                        currentValuePath: pathNew,
                        currentValueRepo: repo,
                        currentValueParentCommit: commitSha,
                        currentValueBranch: resp.branch
                    }))
                    setValue(resp.value)
                    dispatch(setValueText(resp.value))
                    dispatch(setIsSaveCurrentValueGit(true))
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
        if (editorStatus.currentValueBranch)
            saveContentInGit(owner, repo, editorStatus.currentValueBranch,
                editorStatus.currentValueBranch, editorStatus.currentValuePath, "Quick save in current branch")
        else {setTypeModal(CHANGE_BRANCH_SAVE)}
    }

    const reviveGit = () => {
        if (editorStatus.currentValueBranch) {
            reviveFromGit(owner, repo, editorStatus.currentValuePath, editorStatus.currentValueBranch)
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