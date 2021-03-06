import React from "react";
import {Link} from "react-router-dom"

export const InfoList = (
    props: {
        commitMessage: string,
        sha: string,
        committerAuthorLogin: string,
        committerAuthorAvatarURL: string,
        commitAuthorDate: string
    }
) => {
    return (
        <div className={"w-full text-white"}>
            <Link to={`../branches/${props.sha}`} className={"no-underline"}>
                <div className={"flex flex-col px-1 py-1"}>
                    <div className={"text-tiny text-white hover:text-gray"}>
                        <div className={"overflow-ellipsis overflow-hidden h-40px w-full"}>
                            {props.commitMessage}
                        </div>
                    </div>
                    <div className={"text-right"}>
                        <div className={"flex justify-end text-base text-gray-middle"}>
                            {props.committerAuthorLogin}
                            <img alt={"icon"} className={"h-20px pl-2"} src={props.committerAuthorAvatarURL}/>
                        </div>
                        <div className={"flex flex-wrap text-xs text-gray"}>
                            <span className={"hidden sm:block"}>
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
        </div>

    )
}