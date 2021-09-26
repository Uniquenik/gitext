import React from "react";
import ReactQuill from "react-quill";
import EditorToolbar, { modules, formats } from "./editorToolbar";
import "react-quill/dist/quill.snow.css";

export const Editor = () => {
    const [state, setState] = React.useState({ value: null });
    const handleChange = value => {
        setState({ value });
    };
    return (
        <div className="text-editor">
            <EditorToolbar />
            <ReactQuill
                theme="snow"
                // @ts-ignore
                value={state.value}
                onChange={handleChange}
                placeholder={"Write something awesome..."}
                modules={modules}
                formats={formats}
            />
            {state.value}
        </div>
    );
};