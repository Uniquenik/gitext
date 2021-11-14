import React, {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux";
import {BranchesContainerDraws} from "./branches-container-draws";
import {CSSTransition} from 'react-transition-group'
import styles from './loading-styles.module.css'

import Prism from "prismjs";
import './../../prism/prism.css'

import {useHistory, useParams} from 'react-router-dom';
import {RootReducer} from "../../redux";
import {setOpenCommits, setVisibleCurrentValue} from "../../redux/branches-state/branches-action-creators";
import {BranchesListButton} from "../../buttons/brancheslist-button";
import {
    emptyFileError,
    openFileMsg, unhandledError, universal401
} from "../../types/errors-const";
import {CompareButton} from "../../buttons/compare-button";
import {ErrorModal} from "../../modalPortal/error-modal";
import {ModalPortal} from "../../modalPortal/modal-portal";
import {LoadingOverlay} from "../../loading/loading-overlay";
import {
    branchSimpleInfo,
    branchSimpleInfoInitState,
    commitInfo,
    commitInfoInitState,
    mergeInfo,
    mergeInfoInitState
} from "./data-types";
import {branchesCompareCommitInfo, defaultBranchesCompareCommitInfo} from "../../types/data-types";
import parser from "../other/validateHTML";
import {useCommitBranchesData} from "./git-branches";


export const BranchesContainer = () => {
    let {owner, repo, path, commitSha} = useParams()
    const branchesStatus: any = useSelector<RootReducer>(state => state.branches);
    const editorStatus: any = useSelector<RootReducer>(state => state.editor);
    const dispatch = useDispatch();

    const history = useHistory()
    const {getCommitFromTreeShaGH, getCommitAndBranchesGH} = useCommitBranchesData()

    const [typeModal, setTypeError] = useState("");
    const [isMounted, setIsMounted] = useState(false)

    const [statusLoading, setStatusLoading] = useState("")
    const [isNotLoadCommits, setLoadCommit] = useState(false)
    const [infoCompareCommit, setInfoCompareCommit] =
        useState<branchesCompareCommitInfo>(defaultBranchesCompareCommitInfo)
    const [compareContent, setCompareContent] = useState("")
    const [isSetCommits, setCommits] = useState(false)
    const [isEdit, setIsEdit] = useState(false)

    const [listBranches, setListBranches] =
        useState<branchSimpleInfo[]>(() => new Array(branchSimpleInfoInitState))
    const [listCommits, setListCommits] =
        useState<Array<commitInfo>>(() => new Array(commitInfoInitState))
    const [mainBranch, setMainBranch] = useState<number>(0)
    const [listMerge, setListMerge] = useState<Array<mergeInfo>>(() => new Array(mergeInfoInitState))

    //on load
    useEffect(() => {
        setLoadCommit(false)
        setCommits(false)
        if (listCommits !== Array(commitInfoInitState)) {
            getCommitAndBranchesGH(owner, repo, 30, path, setIsEdit, setStatusLoading)
                .then((resp) => {
                    if (resp) {
                        setListBranches(resp.listBranches)
                        setListCommits(resp.listCommits)
                        setMainBranch(resp.mainBranch)
                    }
                    setCommits(true)
                    setIsMounted(true)
                    setLoadCommit(true)
                    Prism.highlightAll();
                })
                .catch((error) => {
                    if (typeModal === "" && universal401) setTypeError(universal401)
                    else setTypeError(unhandledError)
                    console.log(error)
                    console.log("Global error")
                })
        }
    }, [])

    //on change content
    useEffect(() => {
        setLoadCommit(false)
        let pathNew = path.replaceAll("$", "/")
        if (commitSha) {
            getCommitFromTreeShaGH(commitSha, owner, repo, pathNew,setInfoCompareCommit)
                .then((compareCommit) => {
                    if (compareCommit !== "") setCompareContent(compareCommit)
                    else setCompareContent(emptyFileError)
                    setLoadCommit(true)
                    Prism.highlightAll();
                })
                .catch((error) => {
                    setTypeError(error)
                    console.log("Global error")
                    setLoadCommit(true)
                })
        } else {
            setCompareContent(openFileMsg)
            setLoadCommit(true)
        }
    }, [commitSha])


    /*async function createBranch(owner:string, repo:string, branchFrom:string, branchTo:string){
        let treeSha = await getTreeFromSha(branchFrom, owner, repo)
            .then(response => {
                let commitSha = getCommitSha(response.sha, owner, repo)
                return commitSha
            })
            .then(commit => {
                let newBranch = createNewBranch(branchTo, owner, repo, commit.sha)
                return newBranch
            })
            .catch(error => {
                console.log(error);
            });
    }*/

    const onListCommitsButton = () => {
        dispatch(setOpenCommits(!branchesStatus.isOpenListCommits))
    }

    const onVisibleCurrentValueButton = () => {
        dispatch((setVisibleCurrentValue(!branchesStatus.isOpenCurrentValue)))
        Prism.highlightAll();
    }

    const editCommit = () => {
        if (commitSha) history.push(`../editor/${commitSha}`)
    }

    const backEditor = () => history.push(`../editor/`)

    const mainPage = () => history.push('/userrepos')

    const nodeRef = React.useRef(null);

    const onBackError = () => {
        history.push('/')
    }

    return (
        <>
            <ModalPortal
                show={typeModal !== "" || !isSetCommits || !isNotLoadCommits}
                closable={false}
                onClose={() => {
                }}
                selector={"#modal"}
            >
                {(typeModal !== "" &&
                    <ErrorModal errorMsg={typeModal} onBack={onBackError}/>) ||
                ((!isSetCommits || !isNotLoadCommits) &&
                    <LoadingOverlay msg={(statusLoading && "Load branches commits... "+statusLoading) || "Load file..."}/>)}
            </ModalPortal>
            <div className={"h-screen relative overflow-hidden bg-accent"}>
                <div className={`flex flex-col px-1 h-full`}>
                    <div className={"w-full h-min"}>
                        <div className={"flex p-0.5"}>
                            <div
                                className={"py-1 flex-grow text-base text-white overflow-ellipsis overflow-hidden max-h-48px"}>
                                {infoCompareCommit.commitMessage}
                            </div>
                        </div>
                        <div className={"flex flex-wrap text-xs text-gray p-0.5"}>
                            {isEdit &&
                            <button onClick={backEditor}
                                    className={"mr-2 px-4 py-2 rounded-sm text-sm font-medium border-0 transition text-white bg-gray-middle hover:bg-gray"}
                                    placeholder={'sas'} type={'button'}>Back to editor
                            </button>}
                            <button onClick={mainPage}
                                    className={"px-4 py-2 rounded-sm text-sm font-medium border-0 transition text-white bg-gray-dark hover:bg-gray"}
                                    placeholder={'sas'} type={'button'}>Go to main page
                            </button>
                            <div className={"flex-grow mx-2"}>
                                {infoCompareCommit.commitAuthorDate &&
                                <div className={"text-right"}>
                                    <div className={"hidden sm:block"}> {infoCompareCommit.sha} </div>
                                    <div> {infoCompareCommit.commitAuthorDate}/{infoCompareCommit.committerAuthorLogin}  </div>
                                </div>}
                            </div>
                            {isEdit &&
                            <button onClick={editCommit} disabled={commitSha === ""}
                                        className={"px-4 py-2 disabled:opacity-70 rounded-sm text-sm font-medium border-0 transition text-white bg-black-second hover:bg-gray"}
                                        placeholder={'sas'} type={'button'}>Edit
                            </button>}
                        </div>
                    </div>
                    <div className={"flex flex-wrap h-full"}>
                        {isSetCommits && branchesStatus.isOpenCurrentValue &&
                        <div
                            className={"font-sans bg-white h-1/2 sm:h-full w-full sm:w-1/2 overflow-y-auto border-2 border-accent"}>
                            {parser(editorStatus.currentValue) }
                            <div className={"h-72px"}/>
                        </div>
                        }
                        {isSetCommits && isNotLoadCommits &&
                            <div
                                className={`${(!branchesStatus.isOpenCurrentValue && "w-full h-full ") || "w-full sm:w-1/2 h-1/2 sm:h-full "} font-sans overflow-y-auto bg-white border-2 border-accent`}>
                                {parser(compareContent)}
                                <div className={"h-72px"}/>
                            </div>
                        }
                    </div>
                </div>
                <CSSTransition in={isSetCommits && branchesStatus.isOpenListCommits}
                               nodeRef={nodeRef}
                               classNames={{
                                   enter: styles.enter,
                                   enterActive: styles.enterActive,
                                   exit: styles.exit,
                                   exitActive: styles.exitActive
                               }}
                               timeout={1000}
                               unmountOnExit>
                    <div ref={nodeRef}
                         className={"absolute bottom-0 left-0 h-2/5 w-full bg-accent-second border-t-2 border-black-second"}>
                        <div className={"overflow-y-auto h-full"}>
                            <BranchesContainerDraws listBranches={listBranches}
                                                    listCommits={listCommits}
                                                    listMerge={listMerge}
                                                    mainBranch={mainBranch}
                                                    isMounted={isMounted}
                                                    isSetCommits={isSetCommits}
                            />
                        </div>
                    </div>
                </CSSTransition>
                <div className={"absolute right-0 bottom-0"}>
                    <BranchesListButton callback={onListCommitsButton} selected={branchesStatus.isOpenListCommits}/>
                </div>
                <div className={"absolute left-0 bottom-0"}>
                    <CompareButton callback={onVisibleCurrentValueButton} selected={branchesStatus.isOpenListCommits}/>
                </div>
            </div>
        </>
    )
}