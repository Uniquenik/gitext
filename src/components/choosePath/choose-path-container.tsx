import {ChoosePath} from "./choose-path";
import {useEffect} from "react";
import {useBranches} from "../../hooks/branches-hook";

export const ChoosePathContainer = (props:{
    owner:string,
    repo:string
}) => {
    const { getTreeFromSha } = useBranches()

    useEffect(()=>{



    },[])

    async function getTree(owner, repo) {
        //await getTreeFromSha(owner, repo)


    }

    return(
        <ChoosePath/>
    )
}