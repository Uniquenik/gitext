import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/print';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/help';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/codesample';

import 'tinymce/skins/ui/oxide-dark/skin.min.css';
import 'tinymce/skins/ui/oxide-dark/content.min.css';
import 'tinymce/skins/content/dark/content.min.css';
import { Editor } from '@tinymce/tinymce-react';
import React, {useState} from "react";
import {useCommits} from "./hooks/commits-hook";
import getClient from "././api/auth-token"
import {useDispatch, useSelector} from "react-redux";
import {RootReducer} from "./redux";
import {setValueText} from "./redux/main-state/main-action-creators";

const TinyMCEEditor = () => {
    const mainStatus: any = useSelector<RootReducer>(state => state.main);
    const dispatch = useDispatch();

    const [value, setValue] = useState(() => mainStatus.currentValue)

    const {getSingleTree, getSingleCommit, createBlob, createTree, createCommit, updateRef, getAllRepAuth, getBlob} = useCommits()

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
    async function reviveFromGit():Promise<string> {
        let findrep = 'uniquenik.github.io'
        let result = "error"
        let path = 'index.html'
        let ref = 'save'
        await getAllRepAuth()
            .then(reps => {
                console.log(reps)
                for (let i = 0; i<reps.length; i++){
                    if (reps[i].name === findrep){
                        // @ts-ignore
                        if (reps[i].permissions && reps[i].permissions.pull && reps[i].permissions.push){
                            return reps[i].owner.login
                        }
                    }
                }
                throw new Error ("Not found")
                //let content = getRepFile()
            })
            //searching files and find html for editor
            .then(owner => {
                console.log(owner)
                return getBlob(owner, findrep, path, ref)
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

    async function reviveFromStorage(){
        console.log("nope")
    }

    const getInfo = ()=> {
        getClient()
    }


    return (
        <>
            <div className={""}>
                {//@ts-ignore
                }
                <Editor
                apiKey="6sj9lh4fa3acjffyyeebh3ri1xe4hwbky5jflqg05tlhu50d"
                value = {value}
                onFocusOut={() => {
                    dispatch(setValueText(value))
                }}
                onEditorChange = {(newValue) => {
                    setValue(newValue)
                }}
                init={{
                    height: 500,
                    menubar: "file edit insert view format table tools help custom",
                    menu: {
                        file: { title: 'File', items: 'newdocument restoredraft | preview | print | saveCommit getCommit ' },
                        edit: { title: 'Edit', items: 'undo redo | cut copy paste | selectall | searchreplace' },
                        view: { title: 'View', items: 'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen' },
                        insert: { title: 'Insert', items: 'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime' },
                        format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat' },
                        tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | code wordcount' },
                        table: { title: 'Table', items: 'inserttable | cell row column | tableprops deletetable' },
                        help: { title: 'Help', items: 'help' },
                        custom: { title: 'Custom menu', items: 'nesteditem toggleitem' }
                    },
                    setup: function (editor) {
                        var toggleState = false;
                        editor.ui.registry.addMenuItem('getCommit', {
                            text: 'Get last commit...',
                            onAction: function () {
                                reviveFromGit()
                                    .then(content => {
                                        console.log(content)
                                        editor.setContent(content)
                                    })

                                //
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
                    skin: "oxide-dark",
                    content_css: "dark",
                    plugins: [
                        'advlist autolink lists link image',
                        'charmap print preview anchor help',
                        'searchreplace visualblocks code',
                        'insertdatetime media table paste wordcount codesample'
                    ],
                    toolbar:
                        'undo redo | formatselect fontselect | bold italic | \
                        alignleft aligncenter alignright | \
                        bullist numlist outdent indent | help codesample image'
                }}
                //onChange={handleEditorChange}
                />
                {/*<button placeholder={'sas'} onClick={saveContentInGit} name={'sas1'} className="px-4 py-2 rounded-md text-sm font-medium border-0 focus:outline-none focus:ring transition text-gray-600 bg-gray hover:text-gray hover:bg-gray active:bg-gray focus:ring-gray" type="button">Save Content</button>*/}
                <button placeholder={'sas'} onClick={reviveFromStorage} name={'sas2'} type={'button'}>Revive from localStorage</button>
                <button placeholder={'sas'} onClick={reviveFromGit} name={'sas3'} type={'button'}>Revive from GitHub</button>
                <button placeholder={'sas'} onClick={getInfo} name={'sas3'} type={'button'}>Auth</button>
            </div>
        </>

    )

}

export default TinyMCEEditor