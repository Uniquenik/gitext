import {ReactComponent as TreeDot} from "../other/dot.svg";
import {Gitgraph} from "@gitgraph/react";
import {InfoList} from "./infoList";
import React from "react";
import {branchSimpleInfo, commitInfo} from "./data-types";

export const Branches = (props:{
    options:any,
    gitGraphCreate:(gitgraph:any) => void,
    isMounted: boolean,
    listCommits: commitInfo[],
    displayTreeInfo: branchSimpleInfo[],
    isGetTrees: boolean,
    isGetCommits: boolean

}) => {

    return (
        <div className={"w-full"}>
            <div className={"flex"}>
                <div className={"text-white text-xl px-2"}>
                    Branches:
                </div>
                {props.isGetTrees &&
                <div className={"flex w-full"}>
                    {props.displayTreeInfo.map((tree, key) =>
                        <div key={key} className={"text-center p-1"}>
                            <TreeDot key={key} fill={tree.color} width={"35"} className={"mx-auto px-2"}/>
                            <span className={"text-xs text-white"}> {tree.name} </span>
                        </div>
                    )}
                </div>
                }
            </div>
            {props.isGetCommits && props.isMounted &&
            <div className={"flex"}>
                <div className={"w-150px pt-8"}>
                    <Gitgraph options={props.options}>
                        {(gitgraph) => {
                            props.gitGraphCreate(gitgraph)
                        }}
                    </Gitgraph>
                </div>
                <div className={"w-full"}>
                    {props.listCommits.map((branch) =>
                        <div className={"text-xs"} key={branch.sha}>
                            <InfoList
                                commitMessage={branch.commitMessage}
                                sha={branch.sha}
                                committerAuthorLogin={branch.committerAuthorLogin}
                                committerAuthorAvatarURL={branch.committerAuthorAvatarURL}
                                commitAuthorDate={branch.commitAuthorDate}
                            />
                        </div>
                    )}
                </div>
            </div>
            }
        </div>
    );
}