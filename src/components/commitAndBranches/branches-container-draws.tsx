import React, {useState} from 'react'
import {templateExtend, TemplateName} from "@gitgraph/react";
import {branchSimpleInfo, commitInfo, mergeInfo} from "./data-types";
import {Branches} from "./branches";


export const BranchesContainerDraws = (
    props: {
        isMounted: boolean,
        listBranches: branchSimpleInfo[],
        listCommits: Array<commitInfo>,
        listMerge: Array<mergeInfo>,
        mainBranch: number,
        isSetCommits: boolean
    }
) => {

    const [displayTreeInfo, setDisplayTreeInfo] =
        useState<branchSimpleInfo[]>(() => [])
    const [isSetCommitsTree, setCommitsTree] = useState(false)

    const withoutAuthor = templateExtend(TemplateName.Metro, {
        branch: {
            lineWidth: 5,
            label: {
                display: false
            },
        },
        tag: {},
        commit: {
            dot: {
                size: 10
            },
            spacing: 90,
            message: {
                display: false
            },
        },
    });

    const options = {
        template: withoutAuthor,
    };

    const gitGraphCreate = (gitgraph) => {
        //draw lines, strange algorithm
        setCommitsTree(false)
        //array with different branches for create them in future
        let branches: any[] = []
        let displayTree: string[] = []
        gitgraph._graph.template.colors = new Array(0)
        props.listBranches.forEach(function (item) {
            branches.push(gitgraph.branch({name: item.name}))
            gitgraph._graph.template.colors.push(item.color)
        })
        //for all commits
        for (let q = props.listCommits.length - 1; q >= 0; q -= 1) {
            let index1 = -1
            //for draw merge in branches(some errors, not working)
            /*let merge = false
            let index2 = -1
            props.listMerge.forEach(function(item){
                if (item.from === props.listCommits[q].sha) {
                    console.log(item.from)
                    while (index1 == index2) {
                        console.log(index1, index2)
                        do index1++
                        while (!props.listCommits[q].checkTrees[index1])
                        do index2++
                        while (!props.listCommits[q - 1].checkTrees[index2])
                    }
                    q -= 1
                    merge = true
                }
            })*/
            //check commits identity by branch
            let check = props.listCommits[q].checkTrees.slice()
            //if main - simple draw in main
            if (check.every(i => i)) {
                if (!displayTree.includes(branches[props.mainBranch].name))
                    displayTree.push(branches[props.mainBranch].name)
                branches[props.mainBranch].commit({hash: props.listCommits[q].sha})
            } else {
                let counter = 0
                let index = -1
                //check commit identify in one or many branches
                for (let i = 0; i < check.length; i++)
                    if (check[i]) {
                        counter += 1
                        index = i
                    }
                if (index1 !== -1) index = index1
                //if in only one branch - just draw here
                if (counter === 1) {
                    //if last commit in the same branch - create new branch with beauty transition (ex from main) - doesn't work
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
                        //beauty transition if this branch be earlier
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
                    //just new commit on some branch
                }
                else if (props.listCommits[q].checkTrees[props.mainBranch]) {
                    if (!displayTree.includes(branches[props.mainBranch].name))
                        displayTree.push(branches[props.mainBranch].name)
                    branches[props.mainBranch].commit({hash: props.listCommits[q].sha})
                }
                else { //while (counter != 0) {
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
            //for merge
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
        //fixed height for container
        let containerGraph = 100
        gitgraph._graph.template.branch.spacing = (containerGraph / (displayTree.length))
        let displayTreeGraph: branchSimpleInfo[] = []
        //colors for points
        for (let i = 0; i < displayTree.length; i++) {
            displayTreeGraph.push({
                name: displayTree[i],
                color: gitgraph._graph.template.colors[i]
            })
        }
        setDisplayTreeInfo(displayTreeGraph)
        setCommitsTree(true)
    }
    return (
        <Branches options={options}
                  gitGraphCreate={gitGraphCreate}
                  isMounted={props.isMounted}
                  listCommits={props.listCommits}
                  displayTreeInfo={displayTreeInfo}
                  isGetTrees={isSetCommitsTree}
                  isGetCommits={props.isSetCommits}
        />
    );

}