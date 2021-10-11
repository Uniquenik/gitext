import React from "react";
import spinner from "./images/spinner.svg"

export const LoadingOverlay = ({show}) => {
    return (
        <>
            <div className={"bottom-2/4 left-2/4 h-30px w-30px bg-transparent"}>
                <img alt={"spinner"}
                     className={"animate-spin"}
                     width={"30"}
                     height={"30"}
                     src={spinner}/>
            </div>
        </>
    );

}