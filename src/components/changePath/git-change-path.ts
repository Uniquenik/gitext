import {branchChoosePath} from "./data-types";
import {useBranches} from "../../hooks/branches-hook";

export const useChangePath = () => {
    const {getTreeFromSha, getAllBranches, getCommitSha} = useBranches()

    async function getBranchesGH (owner: string, repo: string, setStatusLoading: (string) => void)
    {
        let branchesList: branchChoosePath[] = []
        let allBranches = await getAllBranches(owner, repo)
        for (let i = 0; i < allBranches.length; i += 1) {
            setStatusLoading(i + 1 + "/" + allBranches.length)
            let lastCommit = await getCommitSha(allBranches[i].commit.sha, owner, repo)
            let trees = await getTreeFromSha(lastCommit.tree.sha, owner, repo)
            let paths = trees.tree.map(arr => ({path: arr.path!, type: arr.type!}))
            branchesList.push({
                name: allBranches[i].name,
                lastCommitSha: allBranches[i].commit.sha,
                lastCommitShaTree: lastCommit.tree.sha,
                protected: allBranches[i].protected,
                resp: paths
            })
        }
        setStatusLoading("")
        return branchesList
    }
    return {
        getBranchesGH:getBranchesGH
    }
}