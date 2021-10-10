import {repoInfo} from "./change-repo-container";
import React, {useEffect} from "react";
import {CardsRepo} from "./cards-repo";
import {Link} from "react-router-dom"

export const ChangeRepo = (props: {
    owner:string,
    repos: repoInfo[],
    onLogout: (event:any)=> void
}) => {

    useEffect(() => {console.log(props.repos)},[])

    return(
        <div className={"bg-accent p-2"}>
            <div className={"flex flex-wrap"}>
                <h2 className={"m-0 text-white text-center"}>Hello, {props.owner}!</h2>
                <div className={"flex-grow"}/>
                <button onClick={props.onLogout} className={"mr-2 px-4 rounded-sm text-sm font-medium border-0 transition text-white bg-gray-dark hover:bg-gray"}
                        type={'button'}>Back</button>
            </div>
            <div className={"flex flex-row flex-wrap gap-1"}>
                {props.repos.map((rep)=>
                    <div className={"flex-grow"} key={rep.id_project}>
                        <Link to={`/${rep.owner_login}/${rep.name}/`} className={"no-underline"}>
                            <CardsRepo rep={rep}/>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}