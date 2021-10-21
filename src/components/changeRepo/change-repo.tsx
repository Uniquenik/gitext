import React from "react";
import {CardsRepo} from "./cards-repo";
import {Link} from "react-router-dom"
import {changeRepoInfo} from "./data-types";

export const ChangeRepo = (props: {
    owner: string,
    repos: changeRepoInfo[],
    onLogout: (event:any)=> void
    ownerValue: string,
    repoValue:string,
    onChange: (event:any) => void,
    onViewBranches: (event:any) => void
}) => {

    return(
        <div className={"bg-accent p-2"}>
            <div className={"flex flex-wrap px-1"}>
                <h2 className={"m-0 text-white text-center"}>Hello, {props.owner}!</h2>
                <div className={"flex-grow"}/>
                <button onClick={props.onLogout} className={"px-3 py-1 rounded-sm text-sm font-medium border-0 transition text-white bg-gray-dark hover:bg-gray"}
                        type={'button'}>Sign out</button>
            </div>
            <div className={"flex flex-wrap"}>
                <h3 className={"m-0 py-2 pl-1 text-gray pr-4"}>Choose your repository or view commits on any public repo </h3>
                <div className={"my-2 text-white"}>
                    <input type={"text"}
                           className={"rounded-sm border border-gray-middle m-1 p-0.5 bg-dark"}
                           onChange={props.onChange}
                           name={"owner"}
                           value={props.ownerValue}
                           placeholder={"owner"}
                    />
                    <input type={"text"}
                           className={"rounded-sm border border-gray-middle m-1 p-0.5 bg-dark"}
                           onChange={props.onChange}
                           name={"repo"}
                           value={props.repoValue}
                           placeholder={"repo"}/>
                    <button onClick={props.onViewBranches} className={"py-1 mx-2 px-2 rounded-sm text-sm font-medium border-0 transition text-white bg-gray-dark hover:bg-gray"}
                            type={'button'}>Check</button>
                </div>
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