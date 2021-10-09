import { Editor } from '@tinymce/tinymce-react';
import React, {useEffect, useState} from "react";
import {useCommits} from "../../hooks/commits-hook";
import {useDispatch, useSelector} from "react-redux";
import {RootReducer} from "../../redux";
import {
    setCurrentValueInfo,
    setIsSaveCurrentValue, setIsSaveCurrentValueGit,
    setValueText
} from "../../redux/editor-state/editor-action-creators";
import {
    branchesCompareCommitInfo, CHANGE_REPO, CHANGE_REPO_MSG,
    defaultBranchesCompareCommitInfo,
    MatchParams,
    OVERRIDE_VALUE
} from "../../types/data-types";
import {useBranches} from "../../hooks/branches-hook";
import {getRepPermission, wrongExtensionLine} from "../../types/errors-const";
import {LoadingContainer} from "../../loading/loading-container";
import {ModalPortal} from "../../modalPortal/modal-portal";
import {OverrideSaveMsg} from "../../modalPortal/modalContent/override-save-msg";
import {useHistory, useParams} from 'react-router-dom'
import {ErrorModal} from "../../modalPortal/error-modal";
import {ChangeRepoMsg} from "../../modalPortal/modalContent/change-repo-msg";

const TinyMCEEditor = () => {
    const per_page = 100;
    let {owner,
        repo,
        path,
        commitSha } = useParams()

    const editorStatus: any = useSelector<RootReducer>(state => state.editor);
    const dispatch = useDispatch();

    const [value, setValue] = useState(() => editorStatus.currentValue)
    //const [globalError, setGlobalError] = useState("")
    const [isFetching, setIsFetching] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [typeModal, setTypeModal] = useState("")

    const {getSingleTree, getSingleCommit, createBlob, createTree, createCommit, updateRef, getAllRepAuth, getBlob, getRep, getBlobFromFileSha} = useCommits()
    const {getCommitSha, getTreeFromSha, getAllBranches, getTreesCommits} = useBranches()

    let history = useHistory()

    useEffect(()=>{
        onStart()
    },[])

    useEffect(() => {
       onStart()
    },[owner, repo, path, commitSha])

    async function onStart () {
        setIsFetching(true)
        let pathNew = path.replace("$","/")
        console.log(commitSha)
        if (!editorStatus.currentValueOwner && !editorStatus.currentValueRepo && !editorStatus.currentValuePath) onOverride()
        else {
            if (commitSha) {
                checkCorrectData(owner, repo)
                    .then(() => {
                        if (owner !== editorStatus.currentValueOwner ||
                            repo !== editorStatus.currentValueRepo ||
                            pathNew !== editorStatus.currentValuePath
                        ) setTypeModal(CHANGE_REPO_MSG)
                        else setTypeModal(OVERRIDE_VALUE)
                        setShowModal(true)
                        setIsFetching(false)
                        /*dispatch(setCurrentValueInfo({
                            currentValueOwner: owner,
                            currentValuePath: path,
                            currentValueRepo: repo,
                            currentValueParentCommit: "",
                            currentValueBranch: ""
                        }))*/
                    })
                    .catch((error) => {
                        //setTypeModal(error)
                        setIsFetching(false)
                        console.log(error)
                    })
            } else {
                if (editorStatus.currentValueOwner !== owner ||
                    editorStatus.currentValueRepo !== repo ||
                    editorStatus.currentValuePath !== pathNew
                ) {
                    setTypeModal(OVERRIDE_VALUE)
                    setShowModal(true)
                } else {
                    /*getCommitFileAndBranch(owner, repo, path, addressInfo.commitSha)
                        .then((branch) => {
                            dispatch(setCurrentValueInfo({
                                currentValueOwner: owner,
                                currentValuePath: path,
                                currentValueRepo:repo,
                                currentValueParentCommit: addressInfo.commitSha,
                                currentValueBranch: branch!
                            }))
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                    console.log(editorStatus.currentValueBranch)*/
                    setIsFetching(false)
                }
            }
        }
    }

    async function checkCorrectData (owner:string, repo:string) {
        let repInfo  = await getRep(owner, repo)
            .catch((error) => {
                setTypeModal(error)
                throw new Error(error)
            })
        if (!repInfo.permissions || !repInfo.permissions.pull || !repInfo.permissions.push){
            setTypeModal(getRepPermission)
            throw new Error("Permissions error")
        }
    }

    async function getCommitFileAndBranch(owner:string, repo:string, path:string, commitSha:string) {
        let branch:string = ""
            if (path.split('.').pop() !== 'html') {
                setTypeModal(wrongExtensionLine)
                throw new Error(wrongExtensionLine)
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
                    let fileSha = ""
                    for (let i = 0; i < tree.tree.length; i++) {
                        if (tree.tree[i].path === path && tree.tree[i].sha !== undefined)
                            fileSha = tree.tree[i].sha!
                    }
                    return getBlobFromFileSha(owner, repo, fileSha)
                })
                .then((fileContent) => {
                    file = b64DecodeUnicode(fileContent.content)
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
            let treeMainCommits = await getTreesCommits(owner, repo, 'main', per_page)
                .catch((error) => {
                    setTypeModal(error)
                    throw new Error(error);
                })
            for (let i=0; i<treeMainCommits.length && branch === ""; i++){
                if (treeMainCommits[i].sha == commitSha) branch = 'main';
            }
            if (branch === "") {
                let getBranches = await getAllBranches(owner, repo)
                    .catch((error) => {
                        setTypeModal(error)
                        throw new Error(error)
                    })
                let i = 0;
                while(branch === "" && getBranches.length > i) {
                    let treeCommits = await getTreesCommits(owner, repo, getBranches[i].name, per_page)
                        .catch((error) => {
                            setTypeModal(error)
                            throw new Error(error);
                        })
                    for (let j = 0; j<treeCommits.length && branch === ""; j++){
                        if (treeCommits[j].sha == commitSha) branch = getBranches[i].name;
                    }
                    i += 1
                }
            }
            //console.log(file)
            //setInfoCompareCommit(currentCommitInfo)
            return branch
            //return file
        }


    async function saveContentInGit(val:string) {
        let file = val
        console.log(val)
        let owner = "uniquenik"
        let repo = 'uniquenik.github.io'
        let treeFromName = "save"
        let path = "index.html"
        let messageCommit = "new commit!"
        let treeToName = "save"
        let lastCommitSha
        await getSingleTree(owner, repo, treeFromName)
            .then(response => {
                let getCommitFromTree = getSingleCommit(owner, repo, response.sha)
                return getCommitFromTree
            })
            .then(getCommitFromTree => {
                lastCommitSha = getCommitFromTree.sha
                return createBlob(owner, repo, file)
            })
            .then(newBlob => {
                return createTree(lastCommitSha, owner, repo, newBlob.sha, path)
            })
            .then(newTree => {
                return createCommit(owner, repo, messageCommit, lastCommitSha, newTree.sha)
            })
            .then(newCommit => {
                updateRef(owner, repo, treeToName, newCommit.sha)
                console.log("Commit added!!")
            })
            .catch(error => {
                console.log(error);
            });

    }


    function b64DecodeUnicode(str: any) {
        // Going backwards: from bytestream, to percent-encoding, to original string.
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    // @ts-ignore
    async function reviveFromGit(owner: string, repo:string, path:string, ref:string):Promise<string> {
        let result = "error"
        await getAllRepAuth()
            .then(reps => {
                console.log(reps)
                for (let i = 0; i<reps.length; i++){
                    if (reps[i].name === repo){
                        // @ts-ignore
                        if (reps[i].permissions && reps[i].permissions.pull && reps[i].permissions.push){
                            return reps[i].owner.login
                        }
                    }
                }
                throw new Error ("Not found")
            })
            //searching files and find html for editor
            .then(owner => {
                console.log(owner)
                return getBlob(owner, repo, path, ref)
            })
            .then (infoFile => {
                console.log(infoFile)
                //@ts-ignore
                let file = b64DecodeUnicode(infoFile.content)
                console.log(file)
                result = file
            })
            .catch(error => {
                console.log(error);
            });
        return result
    }

    const onReturnOld = () => {
        setShowModal(false)
        setTypeModal("")
        history.push('./')
    }
    const onReturn = () => {
        history.push('/')
    }

    const onEdit = () =>{
        setIsFetching(true)
        setTypeModal("")
        setShowModal(false)
        let pathNew = path.replace("$","/")
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
        console.log(editorStatus.currentValueBranch)
    }
    const onOverride = () => {
        setIsFetching(true)
        setShowModal(false)
        setTypeModal("")
        let pathNew = path.replace("$","/")
        if (!commitSha){
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
        }
        else {
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
                    console.log(editorStatus.currentValueBranch)
                })
                .catch((error) => {
                    setIsFetching(false)
                    console.log(error)
                })
        }
    }

    const onBackError = () => {
        history.goBack()
    }

    return (
        <>
            <LoadingContainer errorMsg={""} show={isFetching}>
                <div className={"h-screen"}>
                <ModalPortal
                    show={typeModal !== ""}
                    onClose={""}
                    selector={'#modal'}
                    closable={false}
                >
                    <ErrorModal errorMsg={typeModal} onBack={onBackError}/>
                </ModalPortal>
                <ModalPortal
                    show={showModal}
                    onClose={""}
                    selector={'#modal'}
                    closable={false}
                >
                    {typeModal == OVERRIDE_VALUE &&
                    <OverrideSaveMsg currentContent={value}
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
                                         currentValuePath: path.replace("$","/"),
                                         currentValueRepo: repo,
                                         currentValueParentCommit: commitSha
                                     }}
                                     onReturnOld={onReturnOld}
                                     onOverride={onOverride}
                    /> }
                    { typeModal == CHANGE_REPO_MSG &&
                        <ChangeRepoMsg currentContent={value}
                                       saveGit = {editorStatus.isSaveCurrentValueGit}
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
                                           currentValuePath: path.replace("$","/"),
                                           currentValueRepo: repo,
                                           currentValueParentCommit: commitSha
                                       }}
                                       onReturn={onReturn}
                                       onEdit={onEdit}
                        />
                    }
                </ModalPortal>
                <div className={"h-full flex flex-col"}>
                    <div className={"flex-grow"}>
                    <Editor
                        tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'}
                    apiKey="6sj9lh4fa3acjffyyeebh3ri1xe4hwbky5jflqg05tlhu50d"
                    value = {value}
                    onFocusOut={() => {
                        dispatch(setValueText(value))
                        dispatch(setIsSaveCurrentValue(true))
                    }}
                    onEditorChange = {(newValue) => {
                        setValue(newValue)
                        if (editorStatus.isSaveCurrentValue) dispatch(setIsSaveCurrentValue(false))
                        if (editorStatus.isSaveCurrentValueGit) dispatch(setIsSaveCurrentValueGit(false))
                    }}
                    init={{
                        height: '100%',
                        menubar: "file edit insert view format table tools help branches custom",
                        menu: {
                            file: { title: 'File', items: 'newdocument restoredraft | preview | print | chooseRepo | saveCommit getCommit ' },
                            edit: { title: 'Edit', items: 'undo redo | cut copy paste | selectall | searchreplace' },
                            view: { title: 'View', items: 'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen' },
                            insert: { title: 'Insert', items: 'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime' },
                            format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat' },
                            tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | code wordcount' },
                            table: { title: 'Table', items: 'inserttable | cell row column | tableprops deletetable' },
                            help: { title: 'Help', items: 'help' },
                            branches: {title:'Branches...', items: 'branches'},
                            custom: { title: 'Custom menu', items: 'nesteditem toggleitem' }
                        },
                        setup: function (editor) {
                            var toggleState = false;
                            editor.ui.registry.addMenuItem('getCommit', {
                                text: `Get last commit from ${editorStatus.currentValueBranch}`,
                                onAction: function () {
                                    reviveFromGit(editorStatus.currentValueOwner,
                                        editorStatus.currentValueRepo,
                                        editorStatus.currentValuePath,
                                        editorStatus.currentValueBranch
                                        )
                                        .then(content => {
                                            //console.log(content)
                                            editor.setContent(content)
                                        })

                                    //
                                },
                                //@ts-ignore
                                onSetup: (api) => {
                                    api.setDisabled(editorStatus.currentValueBranch === "")
                                }
                            });

                            editor.ui.registry.addMenuItem('chooseRepo', {
                                text: 'Change repo...',
                                onAction: function () {
                                    history.push(`/${editorStatus.currentValueOwner}/`)
                                }
                            });

                            editor.ui.registry.addMenuItem('saveCommit', {
                                text: 'Save in git...',
                                onAction: function () {
                                    saveContentInGit(editor.getContent())
                                        .then(() => console.log("ok"))
                                        .catch(error => {
                                            console.log(error);
                                        });
                                }
                            });

                            editor.ui.registry.addMenuItem('branches', {
                                text: 'Compare commits...',
                                onAction: function () {
                                    history.push('../branches/')
                                }
                            });

                            editor.ui.registry.addNestedMenuItem('nesteditem', {
                                text: 'My nested menu item',
                                getSubmenuItems: () => {
                                    return [
                                        {
                                            type: 'menuitem',
                                            text: 'My submenu item',
                                            onAction: function () {
                                                editor.insertContent('<p>Here\'s some content inserted from a submenu item!</p>');
                                            }
                                        }
                                    ];
                                }
                            });
                            editor.ui.registry.addToggleMenuItem('toggleitem', {
                                text: 'My toggle menu item',
                                onAction: function () {
                                    toggleState = !toggleState;
                                    editor.insertContent('<p class="toggle-item">Here\'s some content inserted from a toggle menu!</p>');
                                },
                                onSetup: function (api) {
                                    api.setActive(toggleState);
                                    return function () {};
                                }
                            });
                        },
                        branding: false,
                        resize: false,
                        skin: "oxide-dark",
                        content_css: "light",
                        plugins: [ 'codesample code',
                            'advlist autolink lists link image',
                            'charmap print preview anchor help',
                            'searchreplace visualblocks',
                            'insertdatetime media table paste wordcoun'
                        ],
                        codesample_languages: [
                            {text: 'HTML/XML', value: 'markup'},
                            {text: 'JavaScript', value: 'javascript'},
                            {text: 'CSS', value: 'css'},
                            {text: 'PHP', value: 'php'},
                            {text: 'Ruby', value: 'ruby'},
                            {text: 'Python', value: 'python'},
                            {text: 'Java', value: 'java'},
                            {text: 'C', value: 'c'},
                            {text: 'C#', value: 'csharp'},
                            {text: 'C++', value: 'cpp'}
                        ],
                        toolbar: 'codesample \
                           undo redo | codesample code | formatselect fontselect | bold italic | \
                            alignleft aligncenter alignright | \
                            bullist numlist outdent indent | help codesample code image'
                    }}
                    //onChange={handleEditorChange}
                    />
                    </div>
                    <div className={"flex flex-row bg-accent text-white text-sm px-2 "}>
                        <div className={"flex"}>{editorStatus.currentValueOwner}/{editorStatus.currentValueRepo}</div>
                        <div className={"flex"}>:{editorStatus.currentValuePath} in {editorStatus.currentValueBranch}</div>
                        <div className={"flex-grow"}></div>
                        <div className={"flex"}>{editorStatus.isSaveCurrentValue && <div>local save</div> || <div>not saved local</div>}</div>
                        <div className={"flex"}>/{editorStatus.isSaveCurrentValueGit && <div>git save</div> || <div>not save in git</div>}</div>
                    </div>
                </div>
                </div>
            </LoadingContainer>
        </>

    )

}

export default TinyMCEEditor