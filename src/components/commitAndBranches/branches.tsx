import React from 'react'
import {InfoList} from "./infoList";
import {Endpoints} from "@octokit/types";
import {branchInfo, commitInfo} from "../../types/data-types";

export const Branches = (
    props: {
        listBranches:branchInfo[],
        listCommits:Array<commitInfo>
    }
    ) => {
        return (
            <div className={"w-full"}>
                        {props.listCommits.map((branch )=>
                            <div className={"text-xs"} key={branch.sha}>
                                <InfoList
                                    listBranches={props.listBranches}
                                    checkTrees={branch.checkTrees}
                                    commitMessage={branch.commitMessage}
                                    sha = {branch.sha}
                                    committerAuthorLogin = {branch.committerAuthorLogin}
                                    committerAuthorAvatarURL= {branch.committerAuthorAvatarURL}
                                    commitAuthorDate = {branch.commitAuthorDate}
                                />
                            </div>
                        )}
            </div>
        );

}