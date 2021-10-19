import React, {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux";
import {BranchesContainerDraws} from "./branches-container-draws";
import {CSSTransition} from 'react-transition-group'
import styles from './loading-styles.module.css'

import Prism from "prismjs";
import './../../prism/prism.css'

import {useHistory, useParams} from 'react-router-dom';
import {useBranches} from "../../hooks/branches-hook";
import {getRandomColor} from "../other/randomColor";
import {RootReducer} from "../../redux";
import {setOpenCommits, setVisibleCurrentValue} from "../../redux/branches-state/branches-action-creators";
import {BranchesListButton} from "../../buttons/brancheslist-button";
import {useCommits} from "../../hooks/commits-hook";
import {
    emptyFileError, getCommit404,
    openFileMsg, unhandledError, wrongExtension
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
import {b64DecodeUnicode} from "../other/decode";
import {compareCommitsByDate} from "../../types/comparators";
import parser from "../other/validateHTML";


export const BranchesContainer = () => {
    let {owner, repo, path, commitSha} = useParams()
    const branchesStatus: any = useSelector<RootReducer>(state => state.branches);
    const editorStatus: any = useSelector<RootReducer>(state => state.editor);
    const dispatch = useDispatch();

    const {
        getAllBranches, getCommitSha,
        getTreeFromSha, getTreesCommits
    } = useBranches();

    const {getBlobFromFileSha, getRep} = useCommits();
    const history = useHistory()

    const [typeModal, setTypeError] = useState("");
    const [isMounted, setIsMounted] = useState(false)

    const [isNotLoadCommits, setLoadCommit] = useState(false)
    const [infoCompareCommit, setInfoCompareCommit] =
        useState<branchesCompareCommitInfo>(defaultBranchesCompareCommitInfo)
    const [compareContent, setCompareContent] = useState("")
    const [isSetCommits, setCommits] = useState(false)
    const [isEdit, setIsEdit] = useState(false)

    //on change global params
    useEffect(() => {
        setLoadCommit(false)
        setCommits(false)
        getCommitAndBranches(owner, repo, 30)
            .then(() => {
                setLoadCommit(true)
                Prism.highlightAll();
            })
            .catch((error) => {
                if (typeModal === "") setTypeError(unhandledError)
                console.log(error)
                console.log("Global error")
            })
    }, [owner, repo, path])

    //on change content
    useEffect(() => {
        setLoadCommit(false)
        let pathNew = path.replaceAll("$", "/")
        if (commitSha) {
            getCommitFromTreeSha(commitSha, owner, repo, pathNew)
                .then((compareCommit) => {
                    if (compareCommit !== "") setCompareContent(compareCommit)
                    else setCompareContent(emptyFileError)
                    Prism.highlightAll();
                    setLoadCommit(true)
                })
                .catch(() => {
                    console.log("Global error")
                    setLoadCommit(true)
                })
        } else {
            setCompareContent(openFileMsg)
            setLoadCommit(true)
        }
    }, [owner, repo, path, commitSha])


    async function getCommitFromTreeSha(commitSha: string, owner: string, repo: string, path: string) {
        if (path.split('.').pop() !== 'html') {
            setCompareContent(wrongExtension)
            throw new Error(wrongExtension)
        }
        let currentCommitInfo: branchesCompareCommitInfo = defaultBranchesCompareCommitInfo
        let file
        await getCommitSha(commitSha, owner, repo)
            .then((treeSha) => {
                currentCommitInfo = {
                    sha: treeSha.sha,
                    commitAuthorDate: treeSha.author.date,
                    commitMessage: treeSha.message,
                    committerAuthorLogin: treeSha.author.name
                }
                return getTreeFromSha(treeSha.tree.sha, owner, repo)
            })
            .then((tree) => {
                console.log(path)
                let fileSha = ""
                for (let i = 0; i < tree.tree.length; i++) {
                    if (tree.tree[i].path === path && tree.tree[i].sha !== undefined)
                        fileSha = tree.tree[i].sha!
                }
                return getBlobFromFileSha(owner, repo, fileSha)
            })
            .then((fileContent) => {
                file = b64DecodeUnicode(fileContent.content)
            })
            .catch((error) => {
                setCompareContent(error)
                throw new Error(error)
            })
        //console.log(file)
        setInfoCompareCommit(currentCommitInfo)
        return file
    }

    const [listBranches, setListBranches] =
        useState<branchSimpleInfo[]>(() => new Array(branchSimpleInfoInitState))
    const [listCommits, setListCommits] =
        useState<Array<commitInfo>>(() => new Array(commitInfoInitState))
    const [mainBranch, setMainBranch] = useState<number>(0)
    const [listMerge, setListMerge] = useState<Array<mergeInfo>>(() => new Array(mergeInfoInitState))


    async function getCommitAndBranches(owner: string, repo: string, per_page: number) {
        let getBranches = await getAllBranches(owner, repo)
            .catch((error) => {
                console.log(error)
                setTypeError(error)
                throw new Error(error)
            })
        getRep(owner, repo)
            .then(reps => {
                //check permissions
                if (reps.permissions && reps.permissions.pull && reps.permissions.push) setIsEdit(true)
                else if (reps.permissions && (!reps.permissions.pull || !reps.permissions.push)) setIsEdit(false)
                else {
                    setTypeError(getCommit404)
                    throw new Error(getCommit404)
                }
            })
        //get some data and create new array for commits on every branch
        let commitsInfo = new Array<commitInfo>()
        let mainBranch = 0
        if (getBranches) {
            let branchesInfo = new Array<branchSimpleInfo>()
            //create first branch
            branchesInfo.push({
                name: getBranches[0].name,
                color: getRandomColor()
            })
            //get commits for first branch
            let branchCommits = await getTreesCommits(owner, repo, getBranches[0].name, per_page)
                .catch((error) => {
                    setTypeError(error)
                    throw new Error(error)
                })
            let checkTrees: boolean[] = [];
            for (let k = 0; k < getBranches.length; ++k) checkTrees.push(false);
            checkTrees[0] = true
            if (branchCommits) branchCommits.forEach(function (item) {
                getTreeFromSha(item.sha, owner, repo)
                    .then((resp) => {
                        if (resp.tree.findIndex((i) => i.path === path.replaceAll("$", "/")) !== -1) {
                            commitsInfo.push({
                                checkTrees: checkTrees,
                                sha: item.sha,
                                commitAuthorDate: item.commit.committer!.date!,
                                commitMessage: item.commit.message,
                                committerAuthorLogin: item.committer!.login,
                                committerAuthorAvatarURL: item.committer!.avatar_url
                            })
                        }
                    })
                    .catch((error)=> {
                        setTypeError(error)
                    })
            })
            console.log("Get data...")
            for (let i = 1; i < getBranches.length; i++) {
                if (getBranches[i].name === 'main' || getBranches[i].name === 'master') {
                    //if main - set main branch
                    mainBranch = i
                }
                //create array with name and color every branch
                branchesInfo.push({
                    name: getBranches[i].name,
                    color: getRandomColor()
                })
                //get commits...
                let branchCommits = await getTreesCommits(owner, repo, getBranches[i].name, per_page)
                    .catch((error) => {
                        setTypeError(error);
                        throw new Error(error);
                    })
                console.log(i+1,"/",getBranches.length)
                if (branchCommits) {
                    //new list commits checks
                    for (let j = 0; j < branchCommits.length; j++) {
                        //if commit already exist - flag in checkTree
                        //or add commit
                        let ind = commitsInfo.findIndex(i => i.sha === branchCommits[j].sha)
                        if (ind !== -1) {
                            let checkTrees: boolean[] = commitsInfo[ind].checkTrees.slice();
                            commitsInfo[ind].checkTrees = []
                            checkTrees[i] = true
                            commitsInfo[ind].checkTrees = checkTrees
                        } else if (getBranches) {
                            let checkTrees: boolean[] = []
                            for (let w = 0; w < getBranches.length; ++w) checkTrees.push(false)
                            checkTrees[i] = true
                            getTreeFromSha(branchCommits[j].sha, owner, repo)
                                .then((resp) => {
                                    if (resp.tree.findIndex((i) => i.path === path.replaceAll("$", "/")) !== -1) {
                                        commitsInfo.push({
                                            checkTrees: checkTrees,
                                            sha: branchCommits[j].sha,
                                            commitAuthorDate: branchCommits[j].commit.committer!.date!,
                                            commitMessage: branchCommits[j].commit.message,
                                            committerAuthorLogin:
                                                (branchCommits[j].committer && branchCommits[j].committer!.login
                                                    && branchCommits[j].committer!.login) || "",
                                            committerAuthorAvatarURL:
                                                (branchCommits[j].committer && branchCommits[j].committer!.avatar_url!) || ""
                                        })
                                    }
                                })
                                .catch((error)=> {
                                    setTypeError(error)
                                })
                        }
                    }
                }
            }
            commitsInfo.sort(compareCommitsByDate)
            console.log("Final", commitsInfo.length, "commits...")
            setListBranches(branchesInfo.slice(0,70))
            setListCommits(commitsInfo.slice(0,70))
            setMainBranch(mainBranch)
            //get pull requests(not work)
            // let result = await getAllPullRequests(owner, repo)
            //     .catch((error) => {
            //         setTypeError(error);
            //         throw new Error(error);
            //     })
            // let newListMerge: mergeInfo[] = []
            // result.forEach(function (item) {
            //     if (item.state === 'closed') {
            //         newListMerge.push({
            //             from: item.head.sha,
            //             to: item.merge_commit_sha!
            //         })
            //     }
            // })
            // if (!isMounted)
            //     setListMerge(newListMerge)
            setCommits(true)
            setIsMounted(true)
        }
    }

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
                    <LoadingOverlay/>)}
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
                        {branchesStatus.isOpenCurrentValue &&
                        <div
                            className={"font-sans bg-white h-1/2 sm:h-full w-full sm:w-1/2 overflow-y-auto border-2 border-accent"}>
                            {parser(editorStatus.currentValue) }
                            <div className={"h-72px"}/>
                        </div>
                        }
                        <div
                            className={`${(!branchesStatus.isOpenCurrentValue && "w-full h-full ") || "w-full sm:w-1/2 h-1/2 sm:h-full "} font-sans overflow-y-auto bg-white border-2 border-accent`}>
                            {parser(compareContent)}
                            <div className={"h-72px"}/>
                        </div>
                    </div>
                </div>
                <CSSTransition in={branchesStatus.isOpenListCommits && branchesStatus.getCommits}
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