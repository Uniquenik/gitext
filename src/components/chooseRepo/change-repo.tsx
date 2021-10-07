import {repoInfo} from "./change-repo-container";
import {useEffect} from "react";
import {CardsRepo} from "./cards-repo";
import {Link} from "react-router-dom"

export const ChangeRepo = (props: {
    owner:string,
    repos: repoInfo[]
}) => {

    useEffect(() => {console.log(props.repos)},[])

    return(
        <div className={"bg-accent p-2"}>
            <h2 className={"m-0 text-white text-center"}>Hello, {props.owner}!</h2>
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