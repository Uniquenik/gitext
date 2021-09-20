import react, {useEffect, useState} from "react"
import {Branches} from "./branches";
import {useBranches} from "../../hooks/branches-hook";
import {Endpoints} from "@octokit/types";
import {branchInfo, commitInfo} from "../../types/data-types";
import {getRandomColor} from "../other/randomColor";
import {checkServerIdentity} from "tls";

export const BranchesContainer = () => {

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
    const { getAllBranches, getAllCommits, createNewBranch, getCommitSha, getTreeSha, getTreesCommits  } = useBranches();

    const [listBranches, setListBranches] =
        useState<branchInfo[]>(() => new Array(branchInfoInitState))
    const [listCommits, setListCommits] =
        useState<Array<commitInfo>>(() => new Array(commitInfoInitState))

    useEffect(() => {
        //from redux
        //somefunc()
        getCommitAndBranches('uniquenik', 'uniquenik.github.io',30)
        //createBranch('uniquenik', 'uniquenik.github.io', 'main', 'autosave2')

    },[])

    async function somefunc(){
        //let treeCommits = await getTreesCommits('uniquenik','uniquenik.github.io' )
        //console.log(treeCommits)
        /*for (let i=0; i<treeCommits.length ;i++)
            console.log(treeCommits[i])*/

    }
    async function getCommitAndBranches(owner:string, repo:string, per_page:number) {
        let getBranches = await getAllBranches(owner, repo)
            .catch((error) => {
                    console.log(error)
                }
            )
        /*let getCommits = await getAllCommits(owner, repo, per_page)
            .catch((error) => {
                    console.log(error)
                }
            )*/
        //get some data and create new array for commits on every branch
        let commitsInfo = new Array<commitInfo>()
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
            let checkTrees:boolean[] = new Array();
            for (let i = 0; i < getBranches.length; ++i) checkTrees.push(false);
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
                        let check = false
                        commitsInfo.forEach(function (item){
                            if (item.sha === treeCommits[j].sha) {
                                check = true
                                item.checkTrees[i] = true
                            }
                        })
                            if (!check && getBranches) {
                                let checkTrees:boolean[] = new Array(getBranches.length).fill(false);
                                //for (let k = 0; k < ; ++k) checkTrees[k] = false;
                                checkTrees[i] = true
                                let k = 0
                                //@ts-ignore
                                while (Date.parse(commitsInfo[k].commitAuthorDate) > Date.parse(treeCommits[j].commit.committer.date) &&
                                    k < commitsInfo.length-1) {
                                    k+=1
                                }
                                //@ts-ignore
                                commitsInfo.splice(k    ,0,{
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
                //setListBranches(branchesCommits)
            }
            console.log("Final", commitsInfo)
            console.log(branchesInfo)
            setListBranches(branchesInfo)
            setListCommits(commitsInfo)
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
        //console.log(new)
        //let commitSha = await getCommitSha(treeSha.sha, owner, repo)
        //console.log(commitSha)
        //let newBranch = await createNewBranch(branchTo, owner, repo, commitSha.sha)
        //console.log(newBranch)
    }

    return (
        <Branches listBranches={listBranches}
                  listCommits={listCommits}
        />
    )
}