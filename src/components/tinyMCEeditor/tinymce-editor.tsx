import {CHANGE_BRANCH_GET, CHANGE_BRANCH_SAVE} from "../../types/data-types";
import React from "react";
import {Editor} from "@tinymce/tinymce-react";

export const TinymceEditor = (props: {
    value:string,
    onFocusOutSave:(event:any) => void,
    onEditorChange:(value:string) => void,
    setTypeModal:(name:string) => void,
    quickSave:(event:any)=>void,
    quickRestore:(event:any)=>void,
    history: (address:string) => void
}) => {


    return (
        <Editor
            // @ts-ignore
            tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'}
            apiKey="6sj9lh4fa3acjffyyeebh3ri1xe4hwbky5jflqg05tlhu50d"
            value={props.value}
            onFocusOut={props.onFocusOutSave}
            onEditorChange={(newValue) => props.onEditorChange(newValue)}
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
                            props.setTypeModal(CHANGE_BRANCH_SAVE)
                        },
                    });

                    editor.ui.registry.addMenuItem('getFrom', {
                        text: `Get from...`,
                        onAction: function () {
                            props.setTypeModal(CHANGE_BRANCH_GET)
                        },
                    });

                    editor.ui.registry.addMenuItem('changeRepo', {
                        text: 'Change repo...',
                        onAction: function () {
                            props.history(`/userrepos/`)
                        }
                    });

                    editor.ui.registry.addMenuItem('quickSave', {
                        text: 'Quick save',
                        onAction: props.quickSave
                    });

                    editor.ui.registry.addMenuItem('quickRestore', {
                        text: 'Quick restore',
                        onAction: props.quickRestore
                    });

                    editor.ui.registry.addMenuItem('compareBranches', {
                        text: 'Compare commits...',
                        onAction: function () {
                            props.history('../branches/')
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
    )
}