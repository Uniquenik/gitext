import React from "react";
import {branchInfo} from "../../types/data-types";
import dot from "../other/dot.svg"

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
        <div className={"w-full bg-dark text-white h-104px"}>

           {/* <div className={"col-span-2"}>
                <div className={`grid grid-cols-${props.listBranches.length}`}>
                    {props.checkTrees.map((br,key) =>
                        <div key={key} className={"text-base text-white"}>
                    {br && <img src={dot} />}
                    </div>)}
                </div>
            </div>*/}
            {/*<div className={"col-span-5"}>*/}
                <div className={"flex flex-col px-1 py-2"}>
                <div className={"text-base h-48px"}>
                    <div>
                        {props.commitMessage}
                    </div>
                </div>
                <div className={"text-right"}>
                    <div className={"flex justify-end text-base text-gray-middle"}>
                        {props.committerAuthorLogin}
                        <img className={"h-20px pl-2"} src={props.committerAuthorAvatarURL}/>
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
            {/*</div>*/}
        </div>

    )
}