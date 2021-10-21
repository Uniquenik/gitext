import React from "react";
import spinner from "./images/spinner.svg"

export const LoadingOverlay = (props:{
    msg?:string
}) => {
    return (
        <div className={"w-screen"}>
            <div className={"absolute bottom-2/4 left-0 w-full"}>
                <div className={"text-center w-full text-white"}>
                    {props.msg && props.msg || "Loading..." }
                </div>
            </div>
            <div className={"absolute bottom-2/4 z-40 left-2/4 h-30px w-30px"}>
                <img alt={"spinner"}
                     className={"animate-spin ml-m20px mt-m20px"}
                     width={"30"}
                     height={"30"}
                     src={spinner}/>
            </div>
        </div>
    );

}