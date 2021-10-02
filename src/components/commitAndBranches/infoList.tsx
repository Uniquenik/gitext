import React from "react";
import {Link} from "react-router-dom"
import {branchInfo} from "../../types/data-types";

export const InfoList = (
    props: {
        listBranches: Array<branchInfo>,
        checkTrees: boolean[],
        commitMessage: string,
        sha: string,
        committerAuthorLogin: string,
        committerAuthorAvatarURL: string,
        commitAuthorDate: string
    }
) => {
    return (
        <div className={"w-full text-white h-78px"}>
            <Link to={`/branches/${props.sha}`}>
                <div className={"flex flex-col px-1 py-2"}>
                    <div className={"text-tiny text-white hover:text-gray"}>
                        <div className={"overflow-ellipsis overflow-hidden h-38px w-full"}>
                            {props.commitMessage}
                        </div>
                    </div>
                    <div className={"text-right"}>
                        <div className={"flex justify-end text-base text-gray-middle"}>
                            {props.committerAuthorLogin}
                            <img alt={"icon"}className={"h-20px pl-2"} src={props.committerAuthorAvatarURL}/>
                        </div>
                        <div className={"flex text-xs text-gray"}>
                            <span>
                            {props.sha}
                            </span>
                            <span className={"flex-grow"}> </span>
                            <span>
                            {props.commitAuthorDate}
                            </span>
                        </div>

                    </div>
                </div>
            </Link>
            {/*</div>*/}
        </div>

    )
}