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

const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: `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` });

const repo = 'uniquenik.github.io'
let r = 'sas'


const App = () => {
    const [editorState, setEditorState] = useState(()=>EditorState.createEmpty(),);

    useEffect( () => {
        //let content = localStorage.getItem('file')
        //let contentParse
        //setEditorState(EditorState.createEmpty())
        /*console.log(content)
        if (content) {
            contentParse = convertFromRaw(JSON.parse(content))
        }
        else { setEditorState(EditorState.createEmpty()) }
        console.log(contentParse)
        if (contentParse) {
            const { contentBlocks, entityMap } = contentParse;
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            setEditorState(EditorState.createWithContent(contentState));
        }
        else
            {
            setEditorState(EditorState.createEmpty())
            }*/
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
        let currentContentAsHTML = draftToHtml(convertToRaw(/*{
            styleToHTML: (style) => {
                if (style === 'BOLD') {
                    return <span style={{color: 'blue'}} />;
                }
            },
            blockToHTML: (block) => {
                /!*if (block.type === 'IMAGE') {
                    return <img src={block.data.src} />;
                }*!/
            },
            entityToHTML: (entity, originalText) => {
                if (entity.type === 'LINK') {
                    return <a href={entity.data.url}>{originalText}</a>;
                }
                if (entity.type === "IMAGE") {
                    return { start: "<img src='" + (entity.data.src) + "'", end:"</img>" };
                }
                return originalText;
            }
        })(*/editorState.getCurrentContent()));
        setConvertedContent(currentContentAsHTML);
        localStorage.setItem('contentHTML', currentContentAsHTML)
        console.log("HTML: ", currentContentAsHTML)

    }

    const saveGitContent =   () => {
        let htmlFile = draftToHtml(convertToRaw(editorState.getCurrentContent()))
        console.log("File:", htmlFile)
        //console.log(b64EncodeUnicode(localStorage.getItem('file')))
        //convertContentToHTML();
        octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
            owner: 'uniquenik',
            repo: repo,
            tree_sha: 'main'
        })
            .then((response:any) => {
                console.log(response.data)
                octokit.request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', {
                    owner: 'uniquenik',
                    repo: repo,
                    commit_sha: response.data.sha
                })
                    .then((response:any) => {
                        console.log(response.data)
                        let lastCommit = response.data.sha
                        octokit.request('POST /repos/{owner}/{repo}/git/blobs', {
                            owner: 'uniquenik',
                            repo: repo,
                            content: htmlFile,
                            encoding: "utf-8"
                        })
                            .then((response:any)=> {
                                console.log(response.data)
                                octokit.request('POST /repos/{owner}/{repo}/git/trees', {
                                    base_tree: lastCommit,
                                    owner: 'uniquenik',
                                    repo: repo,
                                    tree: [
                                        {
                                            path: 'index.html',
                                            mode: '100644',
                                            type: 'blob',
                                            sha: response.data.sha,
                                        }
                                    ]
                                })
                                    .then ((response:any) => {
                                        console.log(response.data)
                                        octokit.request('POST /repos/{owner}/{repo}/git/commits', {
                                            owner: 'uniquenik',
                                            repo: repo,
                                            message: 'very very very very large commit.................',
                                            parents: [lastCommit],
                                            tree: response.data.sha
                                        })
                                            .then((response:any) => {
                                                octokit.request('PATCH /repos/{owner}/{repo}/git/refs/{ref}', {
                                                    owner: 'uniquenik',
                                                    repo: repo,
                                                    ref: 'heads/save',
                                                    sha: response.data.sha,
                                                    force: true
                                                })
                                                    .then ((response:any) => {
                                                        console.log(response.data)
                                                    })
                                            })
                                    })
                                    .catch ((error:any) => {
                                        console.log(error)
                                    })
                            })
                            .catch((error:any) => {
                                console.log(error)
                            })

                    })
                    .catch((error:any) => {
                        console.log(error)
                    })

        })
            .catch((error:any) => {
                console.log(error)

            })
        /*octokit.request('POST /repos/{owner}/{repo}/git/blobs', {
            owner: 'uniquenik',
            repo: 'sas',
            content: b64EncodeUnicode(localStorage.getItem('file'))
        })
            .then((response:any) => {
            console.log(response.data)
                octokit.request('POST /repos/{owner}/{repo}/git/commits', {
                    owner: 'uniquenil',
                    repo: 'sas',
                    message: 'message',
                    tree: response.data.sha
                })
                    .then((response:any)=> {
                        console.log('sas')

                    })

        })*/

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
