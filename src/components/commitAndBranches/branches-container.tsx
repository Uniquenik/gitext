import react, {useEffect, useState} from "react"
import { useDispatch, useSelector } from "react-redux";
import {Branches} from "./branches";
import {useBranches} from "../../hooks/branches-hook";
import {branchInfo, commitInfo, mergeInfo} from "../../types/data-types";
import {getRandomColor} from "../other/randomColor";
import React from "react";
import {RootReducer} from "../../redux";
import {setCommitsTrue} from "../../redux/branches-state/branches-action-creators";


export const BranchesContainer = () => {
    const branchesStatus: any = useSelector<RootReducer>(state => state.branches);
    const dispatch = useDispatch();

    const commitInfoInitState = {
        checkTrees:new Array(),
        sha:"",
        committerAuthorLogin:"",
        commitAuthorDate:"",
        committerAuthorAvatarURL:"",
        commitMessage:""
    }
    const branchInfoInitState = {
        name:"",
        color:""
    }
    const mergeInfoInitState = {
        from: "",
        to: ""
    }

    const { getAllBranches, getPullRequest, createNewBranch, getCommitSha,
        getTreeSha, getTreesCommits, getAllPullRequests} = useBranches();

    const [listBranches, setListBranches] =
        useState<branchInfo[]>(() => new Array(branchInfoInitState))
    const [listCommits, setListCommits] =
        useState<Array<commitInfo>>(() => new Array(commitInfoInitState))
    const [mainBranch, setMainBranch] = useState<number> (0)

    const [listMerge, setListMerge] = useState<Array<mergeInfo>>(() => new Array(mergeInfoInitState))

    useEffect(() => {
        getCommitAndBranches('uniquenik', 'uniquenik.github.io',30)

    },[])

    async function getCommitAndBranches(owner:string, repo:string, per_page:number) {
        let getBranches = await getAllBranches(owner, repo)
            .catch((error) => {
                    console.log(error)
                }
            )
        //get some data and create new array for commits on every branch
        let commitsInfo = new Array<commitInfo>()
        let getOnePullRequest = await getPullRequest(owner,repo,1)
            .catch((error) => {
                    console.log(error)
                }
            )
        console.log(getOnePullRequest)
        let thismainBranch = 0
        if (getBranches) {
            console.log(getBranches)
            let branchesInfo = new Array<branchInfo>()
            //получение первой ветки
            branchesInfo.push({
                name: getBranches[0].name,
                color: getRandomColor()
            })
            let treeCommits = await getTreesCommits(owner, repo, getBranches[0].name, per_page)
                .catch((error) => {
                        console.log(error)
                    }
                )
            console.log(treeCommits)
            let checkTrees:boolean[] = new Array();
            for (let k = 0; k < getBranches.length; ++k) checkTrees.push(false);
            checkTrees[0] = true
            if (treeCommits) treeCommits.forEach(function (item) {
                commitsInfo.push({
                    checkTrees: checkTrees,
                    sha: item.sha,
                    //@ts-ignore
                    commitAuthorDate: item.commit.committer.date,
                    commitMessage: item.commit.message,
                    //@ts-ignore
                    committerAuthorLogin: item.committer.login,
                    //@ts-ignore
                    committerAuthorAvatarURL: item.committer.avatar_url
                })
            })

            for (let i = 1; i < getBranches.length; i++) {
                if (getBranches[i].name === 'main') {
                    console.log(getBranches[i].name)
                    thismainBranch = i
                }
                //create array with name and color every branch
                branchesInfo.push({
                    name: getBranches[i].name,
                    color: getRandomColor()
                })
                //send response for commits on tree
                let treeCommits = await getTreesCommits(owner, repo, getBranches[i].name, per_page)
                    .catch((error) => {
                            console.log(error)
                        }
                    )
                console.log(getBranches[i].name, treeCommits)
                if (treeCommits) {
                    for (let j = 0; j < treeCommits.length; j++) {
                        //console.log(treeCommits[j].sha)
                        let check = false
                        for (let k = 0; k < commitsInfo.length; k++){
                            if (commitsInfo[k].sha === treeCommits[j].sha && !check) {
                                //console.log(commitsInfo[k].sha, treeCommits[j].sha)
                                let checkTrees:boolean[] = commitsInfo[k].checkTrees.slice();
                                commitsInfo[k].checkTrees = []
                                checkTrees[i] = true
                                console.log(i)
                                check = true
                                commitsInfo[k].checkTrees = checkTrees
                                //console.log(item.checkTrees[i])
                            }
                        }
                            if (!check && getBranches) {
                                console.log("new:", i)
                                let checkTrees:boolean[] = new Array()
                                for (let w = 0; w < getBranches.length; ++w) checkTrees.push(false)
                                checkTrees[i] = true
                                let k = 0
                                //@ts-ignore
                                while (Date.parse(commitsInfo[k].commitAuthorDate) > Date.parse(treeCommits[j].commit.committer.date) &&
                                    k < commitsInfo.length-1) {
                                    k+=1
                                }
                                //@ts-ignore
                                commitsInfo.splice(k ,0,{
                                    checkTrees: checkTrees,
                                    sha: treeCommits[j].sha,
                                    //@ts-ignore
                                    commitAuthorDate: treeCommits[j].commit.committer.date,
                                    commitMessage: treeCommits[j].commit.message,
                                    //@ts-ignore
                                    committerAuthorLogin: treeCommits[j].committer.login,
                                    //@ts-ignore
                                    committerAuthorAvatarURL: treeCommits[j].committer.avatar_url
                                })
                                checkTrees = []
                            }
                    }
                }
            }
            console.log("Final", commitsInfo)
            console.log(branchesInfo)
            setListBranches(branchesInfo.slice(0,per_page))
            setListCommits(commitsInfo.slice(0,per_page))
            setMainBranch(thismainBranch)
            let result = await getAllPullRequests(owner, repo)
            let newListMerge:mergeInfo[] = new Array()
            result.forEach(function (item) {
                if(item.state === 'closed'){
                    newListMerge.push({
                        from: item.head.sha,
                        //@ts-ignore
                        to: item.merge_commit_sha
                    })

                }
            })
            setListMerge(newListMerge)
            dispatch(setCommitsTrue())
        }
    }

    async function createBranch(owner:string, repo:string, branchFrom:string, branchTo:string){
        let treeSha = await getTreeSha(branchFrom, owner, repo)
            .then(response => {
                let commitSha = getCommitSha(response.sha, owner, repo)
                return commitSha
            })
            .then(commit => {
                let newBranch = createNewBranch(branchTo, owner, repo, commit.sha)
                return newBranch
            })
            .catch(error => {
                console.log(error);
            });
    }

    return (
        <>
            {branchesStatus.getCommits &&
            <div>
                <Branches listBranches={listBranches}
                          listCommits={listCommits}
                          listMerge={listMerge}
                          mainBranch={mainBranch}
                />
            </div>}
        </>
    )
}