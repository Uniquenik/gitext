import {changeRepoInfo} from "./data-types";


export const CardsRepo = (props: {
    rep:changeRepoInfo
}) => {
    return (
        <div className={"hover:bg-accent-second text-white border border-gray-dark p-1 rounded-sm"}>
            <h3 className={"m-0"}>{props.rep.name}</h3>
            <div className={"text-xs"}>{props.rep.language || "none"}</div>
            <p className={"text-gray pb-3 text-sm"}>{props.rep.description || "none"}</p>
            <div className={"flex items-end"}>
                <img width={"25"} className={"rounded-sm"} alt="avatar" src={props.rep.owner_avatar}/>
                <span className={"text-white px-1 text-base"}>{props.rep.owner_login}</span>
            </div>
            <div className={"text-xs pt-1 text-white flex flex-wrap"}>
                <div>{props.rep.visibility} repository </div>
                <div className={"flex-grow"}/>
                <div>
                    {props.rep.permissions[0] && "admin "}
                    {props.rep.permissions[1] && "pull "}
                    {props.rep.permissions[2] && "push "}
                </div>
            </div>
            <div className={"text-xs text-gray flex flex-wrap"}>
                <div>id:{props.rep.id_project}</div>
                <div className={"flex-grow"}/>
                <div>{props.rep.created_at} / <span className={"text-white"}>{props.rep.pushed_at}</span></div>
            </div>
        </div>
    )

}