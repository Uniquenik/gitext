import React, {useEffect, useState} from 'react'
import {InfoList} from "./infoList";
import { useDispatch, useSelector } from "react-redux";
import {branchSimpleInfo, commitInfo, mergeInfo} from "../../types/data-types";
import {Gitgraph, templateExtend, TemplateName} from "@gitgraph/react";
import {RootReducer} from "../../redux";
import {setCommitsTree} from "../../redux/branches-state";
import {ReactComponent as TreeDot} from "./../other/dot.svg";


export const Branches = (
    props: {
        isMounted: boolean,
        listBranches:branchSimpleInfo[],
        listCommits:Array<commitInfo>,
        listMerge:Array<mergeInfo>,
        mainBranch: number,
    }
    ) => {

    const [displayTreeInfo, setDisplayTreeInfo] =
        useState<branchSimpleInfo[]>(() => [])
    const [isDisplay, setIsDisplay] = useState(true)

    const branchesStatus: any = useSelector<RootReducer>(state => state.branches);
    const dispatch = useDispatch();

    useEffect(()=>{
        console.log("here")
        setIsDisplay(false)
        setIsDisplay(true)
    }, [document.documentElement.clientWidth])

    const withoutAuthor = templateExtend(TemplateName.Metro, {
        branch: {
            lineWidth: 5,
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
            spacing: 90,
            message: {
                display:false
            },
        },
    });

    const options = {
        template: withoutAuthor,
    };

    const gitGraphCreate = (gitgraph) => {
        dispatch(setCommitsTree(false))
        console.log(props.listCommits)
        let branches:any[] = []
        let displayTree:string[] = []
        gitgraph._graph.template.colors = new Array(0)
        props.listBranches.forEach(function (item){
            branches.push(gitgraph.branch({name: item.name}))
            gitgraph._graph.template.colors.push(item.color)
        })
        for (let q = props.listCommits.length-1; q >= 0; q-=1){
            //let merge = false
            let index1 = -1
            //let index2 = -1
            props.listMerge.forEach(function(item){
                if (item.from === props.listCommits[q].sha) {
/*                    console.log(item.from)*/
                    /*while (index1 == index2) {
                        console.log(index1, index2)
                        do index1++
                        while (!props.listCommits[q].checkTrees[index1])
                        do index2++
                        while (!props.listCommits[q - 1].checkTrees[index2])
                    }*/
                    //q -= 1
                    //merge = true
                }
            })
            let check = props.listCommits[q].checkTrees.slice()
            if (check.every(i => i)) {
                if (!displayTree.includes(branches[props.mainBranch].name))
                    displayTree.push(branches[props.mainBranch].name)
                branches[props.mainBranch].commit({hash: props.listCommits[q].sha})
            } else {
                //only one
                let counter = 0
                let index = -1
                for (let i = 0; i < check.length; i++)
                    if (check[i]) {
                        counter += 1
                        index = i
                    }
                if (index1 !== -1) index = index1
                if (counter === 1) {
                    if (q + 1 < props.listCommits.length && props.listCommits[q + 1].checkTrees[index]) {
                        let br = gitgraph.branch({
                            name: branches[index].name,
                            from: props.listCommits[q + 1].sha
                        })
                        if (!displayTree.includes(branches[index].name))
                            displayTree.push(branches[index].name)
                        br.commit({
                            hash: props.listCommits[q].sha
                        })
                    } else {
                        let find = q
                        while (!props.listCommits[find].checkTrees[index]
                            && find < props.listCommits.length - 1) {
                            find++
                        }
                        let br = gitgraph.branch({
                            name: branches[index].name,
                            from: props.listCommits[find].sha
                        })
                        if (!displayTree.includes(branches[index].name))
                            displayTree.push(branches[index].name)
                        br.commit({
                            hash: props.listCommits[q].sha
                        })
                    }
                } else if (props.listCommits[q].checkTrees[props.mainBranch]) {
                    if (!displayTree.includes(branches[props.mainBranch].name))
                        displayTree.push(branches[props.mainBranch].name)
                    branches[props.mainBranch].commit({hash: props.listCommits[q].sha})
                } else { //while (counter != 0) {
                    //if (check[index]) {
                    let commitEarlier = false
                    let k = 0
                    let fixI = 0

                    for (let i = q; i < props.listCommits.length && !commitEarlier; i++) {
                        k = 0
                        while (k < props.listBranches.length && !commitEarlier) {
                            if (props.listCommits[i].checkTrees[index]) {
                                commitEarlier = true
                                fixI = i
                            }
                            k++
                        }
                    }
                    if (commitEarlier) {
                        let br = gitgraph.branch({
                            name: branches[k].name,
                            from: props.listCommits[fixI].sha
                        })
                        if (!displayTree.includes(branches[k].name))
                            displayTree.push(branches[k].name)
                        br.commit({
                            hash: props.listCommits[q].sha
                        })
                    }
                }
                counter--
            }
            /*if (merge) {
                if (props.listCommits[q].checkTrees[props.mainBranch])
                    branches[index2].merge(branches[props.mainBranch], "")
                else branches[index2].merge(branches[index1], "")
                if (!displayTree.includes(branches[index2].name))
                    displayTree.push(branches[index2].name)
                /!*console.log(index1, index2)*!/
                q -= 1
            }*/
        }
        let containerGraph = 100
        //if (document.documentElement.clientWidth < 640) containerGraph = 80
        gitgraph._graph.template.branch.spacing = (containerGraph/(displayTree.length))
        let displayTreeGraph:branchSimpleInfo[] = []
        for(let i = 0; i< displayTree.length; i++){
            displayTreeGraph.push({
                name: displayTree[i],
                color: gitgraph._graph.template.colors[i]})
        }
        setDisplayTreeInfo(displayTreeGraph)
       /* console.log(displayTree)
        console.log(branchesStatus.getTrees)*/
        dispatch(setCommitsTree(true))
    }
        return (
            <div className={"w-full"}>
                <div className={"flex"}>
                    <div className={"text-white text-xl px-2"}>
                        Branches:
                    </div>
                    {branchesStatus.getTrees &&
                    <div className={"flex w-full"}>
                        {displayTreeInfo.map((tree, key) =>
                            <div key={key} className={"text-center p-1"}>
                                <TreeDot key={key} fill={tree.color} width={"35"} className={"mx-auto px-2"}/>
                                <span className={"text-xs text-white"}> {tree.name} </span>
                             </div>
                        )}
                    </div>
                }
                </div>
                { branchesStatus.getCommits && props.isMounted && isDisplay &&
                <div className={"flex"}>
                    <div className={"w-80px sm:w-150px pt-8"}>
                        <Gitgraph options={options}>
                            {(gitgraph) => {
                                gitGraphCreate(gitgraph)
                            }}
                        </Gitgraph>
                    </div>
                    <div className={"w-full"}>
                        {props.listCommits.map((branch) =>
                            <div className={"text-xs"} key={branch.sha}>
                                <InfoList
                                    listBranches={props.listBranches}
                                    checkTrees={branch.checkTrees}
                                    commitMessage={branch.commitMessage}
                                    sha={branch.sha}
                                    committerAuthorLogin={branch.committerAuthorLogin}
                                    committerAuthorAvatarURL={branch.committerAuthorAvatarURL}
                                    commitAuthorDate={branch.commitAuthorDate}
                                />
                            </div>
                        )}
                    </div>
                </div>
                }
            </div>
        );

}