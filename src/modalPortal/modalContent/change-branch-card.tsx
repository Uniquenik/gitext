
import React from "react";
import {branchInfoInModal} from "./data-types";

export const ChangeBranchCard = (props: {
    branch: branchInfoInModal,
    onClick: (name:string) => void
}) => {

    const onCardClick = () => props.onClick(props.branch.name)

    return (
        <button onClick={onCardClick}>
            <div className={"px-2 py-1 hover:text-white"}>
                <div className={"m-0"}>{props.branch.name}</div>
                <div className={"text-xs"}>{(props.branch.protected && "true") || "false"}</div>
            </div>
        </button>
    )
}