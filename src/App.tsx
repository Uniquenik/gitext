import React, {useEffect, useState} from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './App.css';
//import { convertToHTML, convertFromHTML } from 'draft-convert';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { EditorState, convertToRaw, convertFromRaw, ContentState, Entity, inBlock } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import {EndpointDefaults, Endpoints} from "@octokit/types";
import {compileFunction} from "vm";
import {stringify} from "querystring";
import {BranchesContainer} from "./components/commitAndBranches/branches-container";
import {useCommits} from "./hooks/commits-hook";

const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: `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` });

const repo = 'uniquenik.github.io'
let r = 'sas'


const App = () => {
    const {getSingleTree, getSingleCommit, createBlob, createTree, createCommit, updateRef} = useCommits()

    const [editorState, setEditorState] = useState(()=>EditorState.createEmpty(),);



    useEffect( () => {
    },[])

    const [convertedContent, setConvertedContent] = useState("");

    async function getAllRep() {
        return new Promise<string[]>((resolve, reject) =>
        {
            octokit.request('GET /user/repos')
                .then((response: any) => {
                    console.log(response.data)
                    for (let i=0; i< response.data.length; i++)
                        if (response.data[i].name === "uniquenik.github.io") {
                            resolve(new Array(response.data[i].owner.login, response.data[i].name));
                            //getRep(response.data[i].owner.login, response.data[i].name)
                            //console.log("In ",i, "repository find file")
                        }

                })
                .catch((error: any) => {
                    reject(new Array(stringify(error)));
                });
        });
        //return new Array("wtf");
    }

    function getRep(owner:string, repo:string) {
        return new Promise<any>((resolve, reject) =>
        {
            octokit.request('GET /repos/{owner}/{repo}/contents/index.html', {
                'owner': owner,
                'repo': repo
            })
                .then((response:any)=> {
                    localStorage.removeItem('file')
                    console.log('Localstorage clean, get file...')
                    let ENTITY_TYPE = 'IMAGE';
                    let BLOCK_TYPE = 'atomic';
                    let blocksFromHTML = //htmlToDraft(
                        /*{htmlToBlock: (nodeName, node) => {
                            if ((nodeName === 'figure' && node.firstChild.nodeName === 'img') || (nodeName === 'img' && inBlock !== BLOCK_TYPE)) {
                                return BLOCK_TYPE;
                            }
                            if (nodeName === 'figure') {
                                return BLOCK_TYPE;
                            }
                        },
                        htmlToEntity: (nodeName, node, createEntity) => {
                            if (nodeName === 'img') {
                                //console.log(node)
                                return createEntity(
                                    'IMAGE',
                                    'MUTABLE',
                                    {src: node.src,
                                        height:"auto", width:"auto"}
                                )
                            }
                        },
                        blockRendererFn: (block) => {
                            if (block.getType() === 'atomic' && block.length > 0 && Entity.get(block.getEntityAt(0)).getType() === ENTITY_TYPE) {
                                return {
                                    component: ({block}) => {
                                        console.log("!!!", Entity.get(block.getEntityAt(0)).getData())
                                        const {src} = Entity.get(block.getEntityAt(0)).getData();
                                        return <img src={src} />;
                                    },
                                    editable: false
                                };
                            }
                        },
                        blockToHTML: {
                            'atomic': {
                                start: '<figure>',
                                end: '</figure>'
                            }
                        },
                        entityToHTML: (entity, originalText) => {
                            if (entity.type === ENTITY_TYPE) {
                                return `<img src="${entity.data.src}" />`;
                            }
                        }

}
                  */  b64DecodeUnicode(response.data.content)


                    /*let convertContent = ContentState.createFromBlockArray(
                        blocksFromHTML.contentBlocks,
                        blocksFromHTML.entityMap,
                    );*/
                    console.log("From rep: ", blocksFromHTML)
                    console.log("Send in main function...")
                    resolve(blocksFromHTML)
                    //console.log(convertToRaw(convertContent))
                    //console.log(b64DecodeUnicode(response.data.content))
                    //localStorage.setItem("file",JSON.stringify(convertToRaw(
                    //convertFromHTML(b64DecodeUnicode(response.data.content)))))
                    //let file = localStorage.getItem('file')
                    //console.log(file)
                    //if (file) {
                    //    contentFromHTML = b64DecodeUnicode(file)
                    //}
                })
                .catch((error:any) => {
                    console.log(error)
                    reject(error)
                });
        });

    }

    function b64DecodeUnicode(str: any) {
        // Going backwards: from bytestream, to percent-encoding, to original string.
        return decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    function b64EncodeUnicode(str) {
        // first we use encodeURIComponent to get percent-encoded UTF-8,
        // then we convert the percent encodings into raw bytes which
        // can be fed into btoa.
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode(Number('0x' + p1));
            }));
    }

    const reviveFromStorage = () => {
        let content = localStorage.getItem('file');
        let contentFrom
        if (content) { contentFrom = htmlToDraft(JSON.parse(content)) }
        console.log("From lc:", contentFrom)
        if (contentFrom) {
            const { contentBlocks, entityMap } = contentFrom;
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            setEditorState(EditorState.createWithContent(contentState));
        }
       /* if (content) {
            setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(content))));
        } else {
            setEditorState(EditorState.createEmpty());
        }*/
    }

    async function reviveFromGit () {
        let names = await getAllRep()
        console.log(names)
        let contentGit = await getRep(names[0],names[1])
        //let contentGit = localStorage.getItem('file')
        //console.log('New content:')
        console.log("From rep HTML:", htmlToDraft(contentGit))
        if (contentGit) {
            const { contentBlocks, entityMap } = htmlToDraft(contentGit);
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            setEditorState(EditorState.createWithContent(contentState));
        }
        console.log("In state, write in localstorage...")
        localStorage.setItem("file",JSON.stringify(contentGit))
        //localStorage.setItem("file2",JSON.stringify(contentGit.entityMap))
            //console.log("convert:", convertFromHTML(contentFromHTML))

    }

    const handleEditorChange = (state) => {
        const contentState = state.getCurrentContent()
        //saveContent(contentState);
        console.log(contentState)
        //let content = localStorage.getItem("content")
        //console.log("Raw:", content)
        //if (content) console.log("Convert:", convertFromRaw(JSON.parse(content)))
        //console.log(editorState)
        setEditorState(state);
        convertContentToHTML();
    }

    const saveContent = (content) => {
        window.localStorage.setItem('content', JSON.stringify(convertToRaw(content)));
    }
    const convertContentToHTML = () => {
        let currentContentAsHTML = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        setConvertedContent(currentContentAsHTML);
        localStorage.setItem('contentHTML', currentContentAsHTML)
        console.log("HTML: ", currentContentAsHTML)

    }

    async function saveContentInGit (owner:string, repo:string, treeFromName:string,
                                     file:any, path:string, messageCommit:string, treeToName:string) {
        let lastCommitSha
        let getLastTree = await getSingleTree(owner, repo, treeFromName)
            .then(response => {
                let getCommitFromTree = getSingleCommit(owner, repo, response.sha)
                //let forCommitInfo = {lastCommit: getCommitFromTree.sha, blob: newBlob.sha}
                return getCommitFromTree
            })
            .then(getCommitFromTree => {
                lastCommitSha = getCommitFromTree.sha
                let newBlob = createBlob(owner, repo, file)
                return newBlob
            })
            .then(newBlob => {
                let newTree = createTree(lastCommitSha, owner, repo, newBlob.sha, path)
                return newTree
            })
            .then(newTree => {
                let newCommit = createCommit(owner, repo, messageCommit, lastCommitSha, newTree.sha)
                return newCommit
            })
            .then(newCommit => {
                let updRef = updateRef(owner, repo, treeToName, newCommit.sha )
            })
            .catch(error => {
                console.log(error);
            });
        console.log("Commit added!!")
    }

    const saveGitContent = () => {
        let htmlFile = draftToHtml(convertToRaw(editorState.getCurrentContent()))
        let owner = "uniquenik"
        let treeFromName = "save"
        let path = "index.html"
        let messageCommit = "new commit!"
        let treeToName = "save"
        saveContentInGit(owner, repo, treeFromName, htmlFile, path, messageCommit, treeToName)
        console.log("File:", htmlFile)
    }

    const createMarkup = (html) => {
        return  {
            __html: html
        }
    }

    return (
        <div className="App">
            <BranchesContainer/>
            <header className="App-header">
                Rich Text Editor Example
            </header>
            <Editor
                editorState={editorState}
                onEditorStateChange={handleEditorChange}
                //onChange={handleChange}
                wrapperClassName="wrapper-class"
                editorClassName="editor-class"
                toolbarClassName="toolbar-class"
            />
            <div className="preview" dangerouslySetInnerHTML={createMarkup(convertedContent)}></div>
            <button placeholder={'sas'} onClick={saveGitContent} name={'sas1'} type={'button'}>Save Content</button>
            <button placeholder={'sas'} onClick={reviveFromStorage} name={'sas2'} type={'button'}>Revive from localStorage</button>
            <button placeholder={'sas'} onClick={reviveFromGit} name={'sas3'} type={'button'}>Revive from GitHub</button>
        </div>
    )
}

export default App;
