import {Editor} from '@tinymce/tinymce-react';
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
    branchesCompareCommitInfo,
    CHANGE_BRANCH_GET,
    CHANGE_BRANCH_SAVE,
    CHANGE_REPO_MSG,
    defaultBranchesCompareCommitInfo,
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

const TinyMCEEditor = () => {
    const per_page = 100;
    let { owner, repo, path, commitSha } = useParams()

    const editorStatus: any = useSelector<RootReducer>(state => state.editor);
    const dispatch = useDispatch();

    const [value, setValue] = useState(() => editorStatus.currentValue)
    const [isFetching, setIsFetching] = useState(true)
    const [typeModal, setTypeModal] = useState("")

    const {
        getSingleTree, getSingleCommit, createBlob, createTree, createCommit, updateRef, getBlob, getRep, getBlobFromFileSha
    } = useCommits()
    const {getCommitSha, getTreeFromSha, getAllBranches, getTreesCommits} = useBranches()

    let history = useHistory()

    useEffect(() => {
        onStart()
    }, [])

    useEffect(() => {
        onStart()
    }, [owner, repo, path, commitSha])

    async function onStart() {
        setIsFetching(true)
        let pathNew = path.replaceAll("$", "/")
        console.log(commitSha)
        console.log(pathNew)
        if (!commitSha && editorStatus.currentValueOwner.toUpperCase() === owner.toUpperCase() &&
            editorStatus.currentValuePath.toUpperCase() === pathNew.toUpperCase() &&
            editorStatus.currentValueRepo.toUpperCase() === repo.toUpperCase()
        ) {
            setIsFetching(false)
        } else {
            checkCorrectData(owner, repo)
                .then(() => {
                    if (!editorStatus.currentValueOwner && !editorStatus.currentValueRepo && !editorStatus.currentValuePath)
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
                        /*dispatch(setCurrentValueInfo({
                            currentValueOwner: owner,
                            currentValuePath: path,
                            currentValueRepo: repo,
                            currentValueParentCommit: "",
                            currentValueBranch: ""
                        }))*/
                    }
                })
                .catch((error) => {
                    //setTypeModal(error.response)
                    setIsFetching(false)
                    console.log(error)
                })
        }
    }

    async function checkCorrectData(owner: string, repo: string) {
        let repInfo = await getRep(owner, repo)
            .catch((error) => {
                setTypeModal(error)
                throw new Error(error)
            })
        console.log(repInfo)
        if (!repInfo.permissions || !repInfo.permissions.pull || !repInfo.permissions.push) {
            setTypeModal(getRepPermission)
            console.log(getRepPermission)
            throw new Error(getRepPermission)
            //throw new Error(getRepPermission)
        }
    }

    async function getCommitFileAndBranch(owner: string, repo: string, path: string, commitSha: string) {
        let branch: string = ""
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
                console.log(tree)
                console.log(path)
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
        for (let i = 0; i < treeMainCommits.length && branch === ""; i++) {
            if (treeMainCommits[i].sha === commitSha) branch = 'main';
        }
        if (branch === "") {
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
        }
        //console.log(file)
        //setInfoCompareCommit(currentCommitInfo)
        return branch
        //return file
    }


    async function saveContentInGit(owner:string, repo:string, currentTreeName:string, treeName:string, path:string, msg:string) {
        setTypeModal("")
        setIsFetching(true)
        let file = value
        if (currentTreeName === "") currentTreeName = treeName
        let pathNew = path.replace("$", "/")
        let lastCommitSha
        console.log(owner, repo, currentTreeName)
        await getSingleTree(owner, repo, currentTreeName)
            .then(response => {
                return getSingleCommit(owner, repo, response.sha)
            })
            .then(getCommitFromTree => {
                lastCommitSha = getCommitFromTree.sha
                return createBlob(owner, repo, file)
            })
            .then(newBlob => {
                return createTree(lastCommitSha, owner, repo, newBlob.sha, pathNew)
            })
            .then(newTree => {
                return createCommit(owner, repo, msg, lastCommitSha, newTree.sha)
            })
            .then(newCommit => {
                updateRef(owner, repo, treeName, newCommit.sha)
                console.log("Commit added!!")
                setIsFetching(false)
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


    function b64DecodeUnicode(str: any) {
        // Going backwards: from bytestream, to percent-encoding, to original string.
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }


    async function reviveFromGit(owner: string, repo: string, path: string, ref: string) {
        setTypeModal("")
        setIsFetching(true)
        await getRep(owner, repo)
            .then(reps => {
                console.log(reps)
                if (reps.permissions && reps.permissions.pull && reps.permissions.push) {
                    return reps.owner.login
                } else if (reps.permissions && (!reps.permissions.pull || !reps.permissions.push)) {
                    setTypeModal(getRepPermission)
                    throw new Error("Permission Error")
                }
                setTypeModal(getCommit404)
                throw new Error("Not found")
            })
            //searching files and find html for editor
            .then(owner => {
                return getBlob(owner, repo, path, ref)
            })
            .then(infoFile => {
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
        history.push('./')
    }

    const onReturn = () => {
        setTypeModal("")
        history.push(`/${editorStatus.currentValueOwner}/${editorStatus.currentValueRepo}/${editorStatus.currentValuePath.replaceAll("/", "$")}/editor/`)
    }

    const onOverride = () => {
        setTypeModal("")
        setIsFetching(true)
        let pathNew = path.replaceAll("$", "/")
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
                    console.log(editorStatus.currentValueBranch)
                })
                .catch((error) => {
                    setTypeModal(error)
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
            <div className={"h-screen"}>
                <ModalPortal
                    show={typeModal !== "" || isFetching}
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
                    (isFetching &&
                        <LoadingOverlay/>)
                    }
                </ModalPortal>
                <div className={"h-full flex flex-col"}>
                    <div className={"flex-grow"}>
                        <Editor
                            tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'}
                            apiKey="6sj9lh4fa3acjffyyeebh3ri1xe4hwbky5jflqg05tlhu50d"
                            value={value}
                            onFocusOut={() => {
                                dispatch(setValueText(value))
                                dispatch(setIsSaveCurrentValue(true))
                            }}
                            onEditorChange={(newValue) => {
                                setValue(newValue)
                                if (editorStatus.isSaveCurrentValue) dispatch(setIsSaveCurrentValue(false))
                                if (editorStatus.isSaveCurrentValueGit) dispatch(setIsSaveCurrentValueGit(false))
                            }}
                            init={{
                                height: '100%',
                                menubar: "file edit insert view format table tools help branches custom",
                                menu: {
                                    file: {title: 'File', items: 'print | changeRepo | quickSave saveIn | quickRestore getFrom '},
                                    edit: {
                                        title: 'Edit',
                                        items: 'undo redo | cut copy paste | selectall | searchreplace'
                                    },
                                    view: {
                                        title: 'View',
                                        items: 'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen'
                                    },
                                    insert: {
                                        title: 'Insert',
                                        items: 'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime'
                                    },
                                    format: {
                                        title: 'Format',
                                        items: 'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat'
                                    },
                                    tools: {
                                        title: 'Tools',
                                        items: 'spellchecker spellcheckerlanguage | code wordcount'
                                    },
                                    table: {
                                        title: 'Table',
                                        items: 'inserttable | cell row column | tableprops deletetable'
                                    },
                                    help: {title: 'Help', items: 'help'},
                                    branches: {title: 'Branches...', items: 'compareBranches'},
                                    custom: {title: 'Custom menu', items: 'nesteditem toggleitem'}
                                },
                                setup: function (editor) {
                                    let toggleState = false;
                                    editor.ui.registry.addMenuItem('saveIn', {
                                        text: `Save in...`,
                                        onAction: function () {
                                            setTypeModal(CHANGE_BRANCH_SAVE)
                                        },
                                    });

                                    editor.ui.registry.addMenuItem('getFrom', {
                                        text: `Get from...`,
                                        onAction: function () {
                                            setTypeModal(CHANGE_BRANCH_GET)
                                        },
                                    });

                                    editor.ui.registry.addMenuItem('changeRepo', {
                                        text: 'Change repo...',
                                        onAction: function () {
                                            history.push(`/userrepos/`)
                                        }
                                    });

                                    editor.ui.registry.addMenuItem('quickSave', {
                                         text: 'Quick save',
                                         onAction: function () {
                                             if (editorStatus.currentValueBranch) {
                                                 saveContentInGit(owner, repo, editorStatus.currentValueBranch,
                                                     editorStatus.currentValueBranch, editorStatus.currentValuePath, "Quick save in current branch")
                                                     .then(() => console.log("ok"))
                                                     .catch(error => {
                                                         setTypeModal(error)
                                                         console.log(error);
                                                     });
                                             }
                                             else {setTypeModal(CHANGE_BRANCH_SAVE)}
                                         }
                                     });

                                    editor.ui.registry.addMenuItem('quickRestore', {
                                        text: 'Quick restore',
                                        onAction: function () {
                                            if (editorStatus.currentValueBranch) {
                                                reviveFromGit(owner, repo, editorStatus.currentValuePath, editorStatus.currentValueBranch)
                                                    .then(() => console.log("ok"))
                                                    .catch(error => {
                                                        setTypeModal(error)
                                                        console.log(error);
                                                    });
                                            }
                                            else {setTypeModal(CHANGE_BRANCH_GET)}
                                        }
                                    });

                                    editor.ui.registry.addMenuItem('compareBranches', {
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
                                            return function () {
                                            };
                                        }
                                    });
                                },
                                branding: false,
                                resize: false,
                                skin: "oxide-dark",
                                content_css: "light",
                                plugins: ['codesample code',
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
                                toolbar: 'undo redo | formatselect fontselect | bold italic | alignleft aligncenter alignright | bullist numlist | outdent indent | image | codesample'
                            }}
                        />
                    </div>
                    <div className={"flex flex-wrap flex-row bg-accent text-white text-sm px-2 "}>
                        <div className={"flex"}>{editorStatus.currentValueOwner}/{editorStatus.currentValueRepo}</div>
                        <div
                            className={"flex"}>:{editorStatus.currentValuePath} in {editorStatus.currentValueBranch}</div>
                        <div className={"flex-grow"}/>
                        <div className={"flex"}>{
                            ((editorStatus.isSaveCurrentValue && "local save") ||
                            "not saved local")}/
                            {((editorStatus.isSaveCurrentValueGit && "git save") ||
                        "not save in git")}</div>
                    </div>
                </div>
            </div>
        </>

    )

}

export default TinyMCEEditor