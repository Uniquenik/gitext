import {getCommit404, wrongExtension} from "../../types/errors-const";
import {branchesCompareCommitInfo, defaultBranchesCompareCommitInfo} from "../../types/data-types";
import {b64DecodeUnicode} from "../other/decode";
import {useCommits} from "../../hooks/commits-hook";
import {useBranches} from "../../hooks/branches-hook";
import {branchSimpleInfo, commitInfo} from "./data-types";
import {getRandomColor} from "../other/randomColor";
import {compareCommitsByDate} from "../../types/comparators";

export const useCommitBranches = () => {
    const {getBlobFromFileSha, getRep} = useCommits();
    const {
        getAllBranches, getCommitSha,
        getTreeFromSha, getTreesCommits
    } = useBranches();

    async function getCommitFromTreeShaGH(commitSha: string, owner: string, repo: string, path: string, setInfoCompareCommit:(branchesCompareCommitInfo)=>void) {
        if (path.split('.').pop() !== 'html') {
            //setCompareContent(wrongExtension)
            throw wrongExtension
        }
        let currentCommitInfo: branchesCompareCommitInfo = defaultBranchesCompareCommitInfo
        let file
        await getCommitSha(commitSha, owner, repo)
            .then((treeSha) => {
                currentCommitInfo = {
                    sha: treeSha.sha,
                    commitAuthorDate: treeSha.author.date,
                    commitMessage: treeSha.message,
                    committerAuthorLogin: treeSha.author.name
                }
                return getTreeFromSha(treeSha.tree.sha, owner, repo)
            })
            .then((tree) => {
                //console.log(path)
                let fileSha = ""
                for (let i = 0; i < tree.tree.length; i++) {
                    if (tree.tree[i].path === path && tree.tree[i].sha !== undefined)
                        fileSha = tree.tree[i].sha!
                }
                return getBlobFromFileSha(owner, repo, fileSha)
            })
            .then((fileContent) => {
                file = b64DecodeUnicode(fileContent.content)
            })
            .catch((error) => {
                file = error
                //setCompareContent(error)
                throw error
            })
        //console.log(file)
        setInfoCompareCommit(currentCommitInfo)
        return file
    }

    async function getCommitAndBranchesGH(owner: string, repo: string, per_page: number, path:string,
                                          setIsEdit:(boolean)=> void, setStatusLoading:(string)=>void) {
        let getBranches = await getAllBranches(owner, repo)
            // .catch((error) => {
            //     console.log(error)
            //     setTypeError(error)
            //     throw new Error(error)
            // })
        getRep(owner, repo)
            .then(reps => {
                //check permissions
                if (reps.permissions && reps.permissions.pull && reps.permissions.push) setIsEdit(true)
                else if (reps.permissions && (!reps.permissions.pull || !reps.permissions.push)) setIsEdit(false)
                else {
                    //setTypeError(getCommit404)
                    throw getCommit404
                }
            })
        //get some data and create new array for commits on every branch
        let commitsInfo = new Array<commitInfo>()
        let mainBranch = 0
        if (getBranches) {
            let branchesInfo = new Array<branchSimpleInfo>()
            //create first branch
            branchesInfo.push({
                name: getBranches[0].name,
                color: getRandomColor()
            })
            //get commits for first branch
            let branchCommits = await getTreesCommits(owner, repo, getBranches[0].name, per_page)
                // .catch((error) => {
                //     //setTypeError(error)
                //     throw new Error(error)
                // })
            let checkTrees: boolean[] = [];
            for (let k = 0; k < getBranches.length; ++k) checkTrees.push(false);
            checkTrees[0] = true
            if (branchCommits)
                for (let i = 0; i<branchCommits.length; i+=1){
                    await getTreeFromSha(branchCommits[i].sha, owner, repo)
                        .then((resp) => {
                            if (resp.tree.findIndex((i) => i.path === path.replaceAll("$", "/")) !== -1) {
                                commitsInfo.push({
                                    checkTrees: checkTrees,
                                    sha: branchCommits[i].sha,
                                    commitAuthorDate: branchCommits[i].commit.committer!.date!,
                                    commitMessage: branchCommits[i].commit.message,
                                    committerAuthorLogin: branchCommits[i].committer!.login,
                                    committerAuthorAvatarURL: branchCommits[i].committer!.avatar_url
                                })
                            }
                        })
                }
            setStatusLoading("Get data...")
            //console.log("Get data...")
            for (let i = 1; i < getBranches.length; i++) {
                if (getBranches[i].name === 'main' || getBranches[i].name === 'master') {
                    //if main - set main branch
                    mainBranch = i
                }
                //create array with name and color every branch
                branchesInfo.push({
                    name: getBranches[i].name,
                    color: getRandomColor()
                })
                //get commits...
                let branchCommits = await getTreesCommits(owner, repo, getBranches[i].name, per_page)
                    // .catch((error) => {
                    //     setTypeError(error);
                    //     throw new Error(error);
                    // })
                setStatusLoading(i+1+"/"+getBranches.length)
                //console.log(i+1,"/",getBranches.length)
                if (branchCommits) {
                    //new list commits checks
                    for (let j = 0; j < branchCommits.length; j++) {
                        //if commit already exist - flag in checkTree
                        //or add commit
                        let ind = commitsInfo.findIndex(i => i.sha === branchCommits[j].sha)
                        if (ind !== -1) {
                            let checkTrees: boolean[] = commitsInfo[ind].checkTrees.slice();
                            commitsInfo[ind].checkTrees = []
                            checkTrees[i] = true
                            commitsInfo[ind].checkTrees = checkTrees
                        } else if (getBranches) {
                            let checkTrees: boolean[] = []
                            for (let w = 0; w < getBranches.length; ++w) checkTrees.push(false)
                            checkTrees[i] = true
                            getTreeFromSha(branchCommits[j].sha, owner, repo)
                                .then((resp) => {
                                    if (resp.tree.findIndex((i) => i.path === path.replaceAll("$", "/")) !== -1) {
                                        commitsInfo.push({
                                            checkTrees: checkTrees,
                                            sha: branchCommits[j].sha,
                                            commitAuthorDate: branchCommits[j].commit.committer!.date!,
                                            commitMessage: branchCommits[j].commit.message,
                                            committerAuthorLogin:
                                                (branchCommits[j].committer && branchCommits[j].committer!.login
                                                    && branchCommits[j].committer!.login) || "",
                                            committerAuthorAvatarURL:
                                                (branchCommits[j].committer && branchCommits[j].committer!.avatar_url!) || ""
                                        })
                                    }
                                })
                                // .catch((error)=> {
                                //     setTypeError(error)
                                // })
                        }
                    }
                }
            }
            setStatusLoading("")
            commitsInfo.sort(compareCommitsByDate)
            console.log("Final", commitsInfo.length, "commits...")
            return {
                listBranches: branchesInfo.slice(0,70),
                listCommits: commitsInfo.slice(0,70),
                mainBranch: mainBranch}
            //get pull requests(not work)
            // let result = await getAllPullRequests(owner, repo)
            //     .catch((error) => {
            //         setTypeError(error);
            //         throw new Error(error);
            //     })
            // let newListMerge: mergeInfo[] = []
            // result.forEach(function (item) {
            //     if (item.state === 'closed') {
            //         newListMerge.push({
            //             from: item.head.sha,
            //             to: item.merge_commit_sha!
            //         })
            //     }
            // })
            // if (!isMounted)
            //     setListMerge(newListMerge)

        }
    }

    return {
        getCommitFromTreeShaGH: getCommitFromTreeShaGH,
        getCommitAndBranchesGH: getCommitAndBranchesGH
    }
}