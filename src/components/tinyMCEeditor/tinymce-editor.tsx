import {Editor} from '@tinymce/tinymce-react';
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
    branchesCompareCommitInfo, CHANGE_REPO_MSG, CHANGE_BRANCH,
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
                    setTypeModal(error)
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
        if (!repInfo.permissions || !repInfo.permissions.pull || !repInfo.permissions.push) {
            setTypeModal(getRepPermission)
            throw new Error("Permissions error")
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


    async function saveContentInGit(val: string) {
        let file = val
        console.log(val)
        // let owner = "uniquenik"
        // let repo = 'uniquenik.github.io'
        let treeFromName = "main"
        let pathNew = path.replace("$", "/")
        let messageCommit = "new commit!"
        let treeToName = "main"
        let lastCommitSha
        console.log(owner, repo, treeFromName)
        await getSingleTree(owner, repo, treeFromName)
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
    async function reviveFromGit(owner: string, repo: string, path: string, ref: string): Promise<string> {
        let result = `<h3>Error</h3>`
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
                console.log(owner)
                return getBlob(owner, repo, path, ref)
            })
            .then(infoFile => {
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

    const onBack = () => {
        setTypeModal("")
        history.push('./')
    }

    const onReturn = () => {
        setTypeModal("")
        history.push(`/${editorStatus.currentValueOwner}/${editorStatus.currentValueRepo}/${editorStatus.currentValuePath.replaceAll("/", "$")}/editor`)
    }

    const onOverride = () => {
        setIsFetching(true)
        setTypeModal("")
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
            <div className={"h-screen"}>
                <ModalPortal
                    show={typeModal !== "" || isFetching}
                    onClose={() => {if (typeModal === CHANGE_BRANCH) setTypeModal("")}}
                    selector={'#modal'}
                    closable={(typeModal === CHANGE_BRANCH && true) || false}
                >
                    {((typeModal === CHANGE_REPO_MSG || typeModal === OVERRIDE_VALUE) &&
                        <ChangeOverrideMsg
                                       isChange={(CHANGE_REPO_MSG && true) || false}
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
                       typeModal === CHANGE_BRANCH &&
                       <ChangeBranch
                           onBack={()=> {setTypeModal("")}}
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
                        <LoadingOverlay show={isFetching}/>)
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
                                    file: {title: 'File', items: 'print | chooseRepo | saveCommit getCommit '},
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
                                    branches: {title: 'Branches...', items: 'branches'},
                                    custom: {title: 'Custom menu', items: 'nesteditem toggleitem'}
                                },
                                setup: function (editor) {
                                    let toggleState = false;
                                    editor.ui.registry.addMenuItem('getCommit', {
                                        text: `Save in...`,
                                        onAction: function () {
                                            setTypeModal(CHANGE_BRANCH)
                                            // reviveFromGit(editorStatus.currentValueOwner,
                                            //     editorStatus.currentValueRepo,
                                            //     editorStatus.currentValuePath,
                                            //     editorStatus.currentValueBranch
                                            // )
                                            //     .then(content => {
                                            //         //console.log(content)
                                            //         editor.setContent(content)
                                            //     })

                                            //
                                        },
                                    });

                                    editor.ui.registry.addMenuItem('chooseRepo', {
                                        text: 'Change repo...',
                                        onAction: function () {
                                            history.push(`/userrepos/`)
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