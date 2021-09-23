import react, {useEffect, useState} from "react"
import { useDispatch, useSelector } from "react-redux";
import {Branches} from "./branches";
import {useBranches} from "../../hooks/branches-hook";
import {branchInfo, commitInfo, mergeInfo} from "../../types/data-types";
import {getRandomColor} from "../other/randomColor";
import {Gitgraph, Orientation, templateExtend, TemplateName} from "@gitgraph/react";
import React from "react";
import {RootReducer} from "../../redux";
import {setCommitsTrue} from "../../redux/branches-state/branches-action-creators";
import {list} from "postcss";


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

    const { getAllBranches, getPullRequest, createNewBranch, getCommitSha, getTreeSha, getTreesCommits, getAllPullRequests} = useBranches();

    const [listBranches, setListBranches] =
        useState<branchInfo[]>(() => new Array(branchInfoInitState))
    const [listCommits, setListCommits] =
        useState<Array<commitInfo>>(() => new Array(commitInfoInitState))
    const [mainBranch, setMainBranch] = useState<number> (0)

    const [listMerge, setListMerge] = useState<Array<mergeInfo>>(() => new Array(mergeInfoInitState))

    useEffect(() => {
        //from redux
        //somefunc()
        getCommitAndBranches('uniquenik', 'uniquenik.github.io',30)
        //createBranch('uniquenik', 'uniquenik.github.io', 'main', 'autosave2')

    },[])

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
                       /* commitsInfo.forEach((item)=>{

                        })*/
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
                //setListBranches(branchesCommits)
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
        //console.log(new)
        //let commitSha = await getCommitSha(treeSha.sha, owner, repo)
        //console.log(commitSha)
        //let newBranch = await createNewBranch(branchTo, owner, repo, commitSha.sha)
        //console.log(newBranch)
    }
    const withoutAuthor = templateExtend(TemplateName.Metro, {
        branch: {
            lineWidth: 5,
            spacing: (200/listBranches.length),
            label: {
                display:false
            },
        },
        tag: {
        },
        commit: {
            dot: {
                size:10
            },
            spacing:40,
            message: {
                display:false
            },
        },
    });
    let options = {
        template: withoutAuthor,
    };

    const gitGraphCommits = (gitgraph) => {
        console.log(gitgraph)
        let branches:any[] = new Array()
        let displayTree:boolean[] = new Array()
        gitgraph._graph.template.colors = new Array(0)
        for (let i = 0; i < branches.length; i++) displayTree.push(false)
        listBranches.forEach(function (item){
            //@ts-ignore
            branches.push(gitgraph.branch({name: item.name}))
            gitgraph._graph.template.colors.push(item.color)
            console.log(item.name, item.color)
        })
        console.log("List:", listMerge)
        for (let q = listCommits.length-1; q >= 0; q-=1){
            let merge = false
            let index1 = -1
            let index2 = -1
            listMerge.forEach(function(item){
                if (item.from === listCommits[q].sha) {
                    console.log(item.from)
                    while (index1 == index2) {
                        do index1++
                        while (!listCommits[q].checkTrees[index1])
                        do index2++
                        while (!listCommits[q - 1].checkTrees[index2])
                    }
                    console.log(index1, index2)
                    console.log(listCommits[q].sha)
                    //branches[index1].commit({hash: listCommits[q].sha})
                    //branches[index2].merge(branches[index1], "")
                    //q -= 1
                    merge = true
                }
            })
            //if (!merge) {
                let check = listCommits[q].checkTrees.slice()
                if (check.every(i => i === true)) {
                    displayTree[mainBranch] = true
                    branches[mainBranch].commit({hash: listCommits[q].sha})
                    /*for(let i=0;i < listBranches.length;i++){
                        if (i != mainBranch) {
                            branches[i].merge(branches[mainBranch])
                        }
                    }*/
                } else {
                    //только один
                    let counter = 0
                    let index = -1
                    for (let i = 0; i < check.length; i++)
                        if (check[i]) {
                            counter += 1
                            index = i
                        }
                    if(index1 !=-1) index = index1
                    if (counter == 1) {
                        if (q + 1 < listCommits.length && listCommits[q + 1].checkTrees[index]) {
                            let br = gitgraph.branch({
                                name: branches[index].name,
                                from: listCommits[q + 1].sha
                            })
                            displayTree[index] = true
                            br.commit({
                                hash: listCommits[q].sha
                            })
                        } else {
                            let find = q + 1
                            while (!listCommits[find].checkTrees[index] && find < listCommits.length - 1) {
                                find++
                            }
                            let br = gitgraph.branch({
                                name: branches[index].name,
                                from: listCommits[find].sha
                            })
                            displayTree[index] = true
                            br.commit({
                                hash: listCommits[q].sha
                            })

                            //
                        }
                    } else if (listCommits[q].checkTrees[mainBranch]) {
                        console.log(listCommits[q].sha)
                        displayTree[mainBranch] = true
                        branches[mainBranch].commit({hash: listCommits[q].sha})
                    } else { //while (counter != 0) {
                        //if (check[index]) {
                        let commitEarlier = false
                        let k = 0
                        let fixI = 0

                        for (let i = q; i < listCommits.length && !commitEarlier; i++) {
                            k = 0
                            while (k < listBranches.length && !commitEarlier) {
                                if (listCommits[i].checkTrees[index]) {
                                    commitEarlier = true
                                    fixI = i
                                }
                                k++
                            }
                        }
                        if (commitEarlier) {
                            let br = gitgraph.branch({
                                name: branches[k].name,
                                from: listCommits[fixI].sha
                            })
                            displayTree[k] = true
                            br.commit({
                                hash: listCommits[q].sha
                            })
                        }
                    }
                    counter--
                }
                //}
                //else index--
                /*if (merge) {
                    if (listCommits[q].checkTrees[mainBranch]) branches[index2].merge(branches[mainBranch], "")
                    else  branches[index2].merge(branches[index1], "")
                    console.log(index1, index2)
                    q -= 1
                }*/
            }
                    //}
            //}
        //}
        /*const master = gitgraph.branch("master");
        master.commit();
        const feat1 = gitgraph.branch("feat1");
        feat1.commit().commit();
        const feat2 = gitgraph.branch({
            name: "feat2",
            from: master
        });
        feat2.commit();*/
        gitgraph._graph.template.branch.spacing = (200/(displayTree.filter(x=>x).length))
        console.log(gitgraph)
    }

    return (
        <>
            {branchesStatus.getCommits &&
                <div className={"w-full flex"}>
                    <div className={"w-250px"}>
                        <Gitgraph options={options}>
                            {(gitgraph) => {
                                gitGraphCommits(gitgraph)
                            }}
                        </Gitgraph>
                    </div>
                    <div className={""}>
                        <div className={"w-full"}>
                            {/*{listCommits.map((branch )=>
                                <div className={"text-xs"} key={branch.sha}>
                                    <InfoList
                                        listBranches={listBranches}
                                        checkTrees={branch.checkTrees}
                                        commitMessage={branch.commitMessage}
                                        sha = {branch.sha}
                                        committerAuthorLogin = {branch.committerAuthorLogin}
                                        committerAuthorAvatarURL= {branch.committerAuthorAvatarURL}
                                        commitAuthorDate = {branch.commitAuthorDate}
                                    />
                                </div>
                            )}*/}
                        </div>
                    </div>
                </div>}
        <Branches listBranches={listBranches}
                  listCommits={listCommits}
                  gitGraphCreate={gitGraphCommits}
        />
        </>
    )
}