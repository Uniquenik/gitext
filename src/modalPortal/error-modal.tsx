import error from "../loading/images/error.svg";
import React from "react";
import parse from "html-react-parser";

export const ErrorModal = (props: {
    errorMsg:string,
    onBack:(event:any)=>void
}) => {
    return (
        <div>
        <img alt={"error"}
             className={"mx-auto py-2"}
             width={"50"}
             height={"50"}
             src={error}/>
            <div className={"pb-6 p-3 border-t-2 border-black whitespace-pre overflow-ellipsis overflow-hidden text-center text-gray-middle"}>
                {props.errorMsg && parse(props.errorMsg)}
            </div>
            <button className={"w-full p-2 bg-error hover:bg-gray"} onClick={props.onBack}>Go back</button>
        </div>
    )
}