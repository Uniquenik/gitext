import {branchInf} from "./change-branch";
import React from "react";

export const ChangeBranchCard = (props: {
    branch: branchInf,
    onClick: (name:string) => void
}) => {

    const onCardClick = () => props.onClick(props.branch.name)

    return (
        <button onClick={onCardClick}>
            <div className={"px-2 py-1"}>
                <div className={"m-0"}>{props.branch.name}</div>
                <div className={"text-xs"}>{(props.branch.protected && "true") || "false"}</div>
            </div>
        </button>
    )
}