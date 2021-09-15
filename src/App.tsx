import React, {useEffect, useState} from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './App.css';
import { convertToHTML, convertFromHTML } from 'draft-convert';
import { EditorState, convertToRaw, convertFromRaw, ContentState, Entity, inBlock } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import {EndpointDefaults, Endpoints} from "@octokit/types";
import {compileFunction} from "vm";

const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: `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` });

getAllRep()
const repo = 'uniquenik.github.io'
let r = 'sas'

function getAllRep() {
    octokit.request('GET /user/repos')
        .then((response: any) => {
            console.log(response.data)
            getRep(response.data[9].owner.login, response.data[9].name)

        })
        .catch((error: any) => {
        });
}

function getRep(owner:string, repo:string) {
    octokit.request('GET /repos/{owner}/{repo}/contents/index.html', {
        'owner': owner,
        'repo': repo
    })
        .then((response:any)=> {
            const ENTITY_TYPE = 'IMAGE';
            const BLOCK_TYPE = 'atomic';
            let blocksFromHTML = convertFromHTML({
                htmlToBlock: (nodeName, node) => {
                    if ((nodeName === 'figure' && node.firstChild.nodeName === 'img') || (nodeName === 'img' && inBlock !== BLOCK_TYPE)) {
                        console.log("!!!", node)
                        return BLOCK_TYPE;
                    }
                    if (nodeName === 'figure') {
                        return BLOCK_TYPE;
                    }
                },
                htmlToEntity: (nodeName, node, createEntity) => {
                    if (nodeName === 'img') {
                        console.log(node)
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


            })(b64DecodeUnicode(response.data.content))


            /*let convertContent = ContentState.createFromBlockArray(
                blocksFromHTML.contentBlocks,
                blocksFromHTML.entityMap,
            );*/
            console.log("ConvertContent: ", blocksFromHTML)
            localStorage.setItem("file",JSON.stringify(convertToRaw(blocksFromHTML)))
            //console.log(convertToRaw(convertContent))
            console.log(b64DecodeUnicode(response.data.content))
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

const App = () => {
    const [editorState, setEditorState] = useState(
        () => EditorState.createEmpty()
    );

    const [convertedContent, setConvertedContent] = useState(null);

    const reviveFromStorage = ()=> {
        let content = localStorage.getItem('content');

        if (content) {
            setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(content))));
        } else {
            setEditorState(EditorState.createEmpty());
        }
    }

    const reviveFromGit = () => {
        getAllRep()
        let contentGit = localStorage.getItem('file')
        console.log("From git:", contentGit)
        if (contentGit) {
            setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(contentGit))))
        }
            //console.log("convert:", convertFromHTML(contentFromHTML))

    }


    const handleEditorChange = (state) => {
        const contentState = state.getCurrentContent()
        saveContent(contentState);
        console.log(contentState)
        let content = localStorage.getItem("content")
        console.log("Raw:", content)
        if (content) console.log("Convert:", convertFromRaw(JSON.parse(content)))
        //console.log(editorState)
        setEditorState(state);
        convertContentToHTML();
    }

    const saveContent = (content) => {
        window.localStorage.setItem('content', JSON.stringify(convertToRaw(content)));
    }
    const convertContentToHTML = () => {
        let currentContentAsHTML = convertToHTML({
            styleToHTML: (style) => {
                if (style === 'BOLD') {
                    return <span style={{color: 'blue'}} />;
                }
            },
            blockToHTML: (block) => {
                /*if (block.type === 'IMAGE') {
                    return <img src={block.data.src} />;
                }*/
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
        })(editorState.getCurrentContent());
        setConvertedContent(currentContentAsHTML);
        localStorage.setItem('contentHTML', currentContentAsHTML)
        console.log("HTML: ", currentContentAsHTML)

    }

    const saveGitContent =   () => {
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
                            content: localStorage.getItem('contentHTML'),
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
                                            message: 'first commit!!!',
                                            parents: [lastCommit],
                                            tree: response.data.sha
                                        })
                                            .then((response:any) => {
                                                octokit.request('PATCH /repos/{owner}/{repo}/git/refs/{ref}', {
                                                    owner: 'uniquenik',
                                                    repo: repo,
                                                    ref: 'heads/main',
                                                    sha: response.data.sha
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
            <button placeholder={'sas'} onClick={saveGitContent} name={'sas'} type={'button'}>sas</button>
            <button placeholder={'sas'} onClick={reviveFromStorage} name={'sas'} type={'button'}>sas2</button>
            <button placeholder={'sas'} onClick={reviveFromGit} name={'sas'} type={'button'}>sas3</button>
        </div>
    )
}

export default App;
