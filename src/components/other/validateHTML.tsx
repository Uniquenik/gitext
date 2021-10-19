import parse, {attributesToProps, domToReact} from "html-react-parser";
import {Element} from "domhandler/lib/node";
import React from "react";

export const parser = (input: string) =>
    parse(input, options)

const options = {
    replace: domNode => {
        if (domNode instanceof Element && domNode.tagName === "html") {
            console.log("Remove html tag")
            return (
                <>
                    {domToReact(domNode.children, options)}
                </>
            );
        }
        if (domNode instanceof Element && domNode.tagName === "body") {
            console.log("Remove body tag")
            let props = attributesToProps(domNode.attribs);
            return (
                <div {...props}>
                    {domToReact(domNode.children, options)}
                </div>
            );
        }
        if (domNode instanceof Element && domNode.tagName === "head") {
            console.log("Remove head tag and content")
            return (
                <></>
            );
        }
        if (domNode instanceof Element && domNode.tagName === "input") {
            console.log("Remove input tag")
            return (
                <>{domToReact(domNode.children, options)}</>
            );
        }
        if (domNode instanceof Element && domNode.tagName === "select") {
            console.log("Remove select tag")
            return (
                <>{domToReact(domNode.children, options)}</>
            );
        }
        if (domNode instanceof Element && domNode.tagName === "textarea") {
            console.log("Remove textarea tag")
            return (
                <>{domToReact(domNode.children, options)}</>
            );
        }
        if (domNode instanceof Element && domNode.tagName === "script") {
            console.log("Remove script tag")
            return (
                <>{domToReact(domNode.children, options)}</>
            );
        }
    }
}

export default parser