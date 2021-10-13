import {branchInf} from "./change-branch";

export const ChangeBranchCard = (props: {
    branch: branchInf
}) => {

    return (
        <div>
            <h3 className={"m-0"}>{props.branch.name}</h3>

        </div>
    )
}