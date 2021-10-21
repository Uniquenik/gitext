import {CHANGE_BRANCH_GET, CHANGE_BRANCH_SAVE} from "../../types/data-types";
import React from "react";
import {Editor} from "@tinymce/tinymce-react";
import {useAuth} from "../../hooks/auth-hook";

export const TinymceEditor = (props: {
    value: string,
    onFocusOutSave: (event: any) => void,
    onEditorChange: (value: string) => void,
    setTypeModal: (name: string) => void,
    quickSave: (event: any) => void,
    quickRestore: (event: any) => void,
    history: (address: string) => void,
    setIsFetchingEditor:(bool:boolean)=> void,
}) => {

    const {deleteOcto} = useAuth()

    const menu = {
            gitext: {title: 'Gitext', items: 'changeRepo changeFile | compareBranches | logout'},
            file: {title: 'File', items: 'print | quickSave saveIn | quickRestore getFrom'},
            edit: {
                title: 'Edit',
                items: 'undo redo | cut copy paste | selectall | searchreplace'
            },
            view: {
                title: 'View',
                items: 'code | visualaid visualchars visualblocks | wordcount'
            },
            insert: {
                title: 'Insert',
                items: 'image link media template codesample inserttable | charmap emoticons hr | ' +
                    'pagebreak nonbreaking anchor toc | insertdatetime'
            },
            format: {
                title: 'Format',
                items: 'strikethrough superscript subscript codesample code | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat'
            },
            table: {
                title: 'Table',
                items: 'inserttable | cell row column | tableprops deletetable'
            },
            help: {title: 'Help', items: 'help'},
            custom: {title: 'Custom menu', items: 'nesteditem toggleitem'}
        }

    return (
        <>
            <Editor
                tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'}
                apiKey="6sj9lh4fa3acjffyyeebh3ri1xe4hwbky5jflqg05tlhu50d"
                value={props.value}
                onFocusOut={props.onFocusOutSave}
                onEditorChange={(newValue) => props.onEditorChange(newValue)}
                init={{
                    height: '100%',
                    invalid_elements: 'form, input, textarea, button, select, script',
                    menubar: "gitext file edit insert view format table help branches custom",
                    mobile: {
                        menubar: "gitext file edit insert view format table help branches custom",
                        menu: menu,
                        toolbar_mode: 'sliding',
                        contextmenu_never_use_native: true,
                    },
                    menu: menu,
                    setup: function (editor) {
                        editor.on('init', function(e) {
                            props.setIsFetchingEditor(false)
                        });
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

                        editor.ui.registry.addMenuItem('logout', {
                            text: `Sign out`,
                            onAction: deleteOcto
                        });

                        editor.ui.registry.addMenuItem('changeRepo', {
                            text: 'Change repo...',
                            onAction: function () {
                                props.history(`/userrepos/`)
                            }
                        });

                        editor.ui.registry.addMenuItem('changeFile', {
                            text: 'Change file in repo...',
                            onAction: function () {
                                props.history(`./../../`)
                            }
                        });

                        editor.ui.registry.addMenuItem('compareBranches', {
                            text: 'Compare branches...',
                            onAction: function () {
                                props.history(`../branches/`)
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
                    },
                    branding: false,
                    resize: false,
                    skin: "oxide-dark",
                    content_css: "light",
                    plugins: ['codesample code',
                        'advlist autolink lists link image',
                        'charmap print preview anchor help',
                        'searchreplace visualblocks visualchars',
                        'insertdatetime media table paste wordcount quickbars'
                    ],
                    contextmenu: 'copy paste cut | link',
                    contextmenu_never_use_native: true,
                    quickbars_insert_toolbar: false,
                    quickbars_selection_toolbar: 'copy paste cut | bold italic | formatselect | quicklink',
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
                    toolbar: 'undo redo | formatselect fontselect | bold italic underline strikethrough ' +
                    'forecolor backcolor | align | bullist numlist | image | table | codesample',
                    toolbar_mode: 'sliding',
                }}
            />
        </>
    )
}