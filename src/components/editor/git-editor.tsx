import {useCommits} from "../../hooks/commits-hook";
import {useBranches} from "../../hooks/branches-hook";
import {CHANGE_REPO_MSG, OVERRIDE_VALUE} from "../../types/data-types";
import {fileInfo} from "../../redux/editor-state/data-types";
import {defaultFileInfoState} from "./data-types";
import {getCommit404, getRepPermission, wrongExtensionLine} from "../../types/errors-const";
import {b64DecodeUnicode} from "../other/decode";

export const useEditorData = () => {
    const {
        getSingleTree, getSingleCommit, createBlob, createTree, createCommit, updateRef, getBlob, getRep, getBlobFromFileSha
    } = useCommits()
    const {getCommitSha, getTreeFromSha, getAllBranches, getTreesCommits} = useBranches()

    async function onStartGH(owner:string, repo:string, commitSha:string, path:string, per_page: number, fileInfo: fileInfo) {
        let currentValueInfo: fileInfo = defaultFileInfoState
        let typeModal = ""
        let value = ""
        let pathNew = path.replaceAll("$", "/")
        if (!(!commitSha && fileInfo.currentValueOwner.toUpperCase() === owner.toUpperCase() &&
            fileInfo.currentValuePath.toUpperCase() === pathNew.toUpperCase() &&
            fileInfo.currentValueRepo.toUpperCase() === repo.toUpperCase())
        ) {
            await checkCorrectDataGH(owner, repo, commitSha)
            if (!commitSha) {
                return {
                    isCheck: true
                }
            }
            else if (!fileInfo.currentValueOwner && !fileInfo.currentValueRepo && !fileInfo.currentValuePath) {
                //if editor is empty
                await getCommitFileAndBranchGH(owner, repo, pathNew, commitSha, per_page)
                    .then((resp) => {
                        console.log(resp)
                        currentValueInfo = {
                            currentValueOwner: owner,
                            currentValuePath: pathNew,
                            currentValueRepo: repo,
                            currentValueParentCommit: commitSha,
                            currentValueBranch: resp.branch
                        }
                        console.log(value)
                        value = resp.value
                    })
            }
            else {
                if (owner.toUpperCase() !== fileInfo.currentValueOwner.toUpperCase() ||
                    repo.toUpperCase() !== fileInfo.currentValueRepo.toUpperCase() ||
                    pathNew.toUpperCase() !== fileInfo.currentValuePath.toUpperCase())
                    typeModal = CHANGE_REPO_MSG
                else typeModal = OVERRIDE_VALUE
            }
        }
        //console.log(typeModal, currentValueInfo, value)
        return {
            isCheck: false,
            typeModal: typeModal,
            currentValueInfo: currentValueInfo,
            value: value
        }
    }

    async function checkCorrectDataGH(owner: string, repo: string, commitSha: string) {
        let repInfo = await getRep(owner, repo)
            .catch((error) => {
                throw error
            })
        if (!repInfo.permissions || !repInfo.permissions.pull || !repInfo.permissions.push) {
            throw getRepPermission
        }
        if (commitSha) {
            await getCommitSha(commitSha, owner, repo)
                .catch((error)=> {
                    throw error
                })
        }
    }

    async function getCommitFileAndBranchGH(owner: string, repo: string, path: string, commitSha: string, per_page: number) {
        //return branch for redux
        let branch = ""
        let value = ""
        if (path.split('.').pop() !== 'html') {
           // setTypeModal(wrongExtensionLine)
            throw wrongExtensionLine
        }
        await getCommitSha(commitSha, owner, repo)
            .then((treeSha) => {
                return getTreeFromSha(treeSha.tree.sha, owner, repo)
            })
            .then((tree) => {
                let fileSha = ""
                for (let i = 0; i < tree.tree.length; i++) {
                    if (tree.tree[i].path === path && tree.tree[i].sha !== undefined)
                        fileSha = tree.tree[i].sha!
                }
                return getBlobFromFileSha(owner, repo, fileSha)
            })
            .then((fileContent) => {
                value = b64DecodeUnicode(fileContent.content)
            })
            .catch((error) => {
                throw error
            })
        //search branch for this commit
        let getBranches = await getAllBranches(owner, repo)
            .catch((error) => {
                throw error
            })
        let i = 0;
        while (branch === "" && getBranches.length > i) {
            let treeCommits = await getTreesCommits(owner, repo, getBranches[i].name, per_page)
                .catch((error) => {
                    throw error;
                })
            for (let j = 0; j < treeCommits.length && branch === ""; j++)
                if (treeCommits[j].sha === commitSha) branch = getBranches[i].name;
            i += 1
        }
        return {
            value: value,
            branch: branch,
        }
    }

    async function saveContentInGitGH(owner:string, repo:string, currentTreeName:string, treeName:string, path:string, msg:string, value:string) {
        if (currentTreeName === "") currentTreeName = treeName
        let newCommitSha = ""
        let pathNew = path.replace("$", "/")
        let lastCommitSha
        await getSingleTree(owner, repo, currentTreeName)
            .then(response => {
                return getSingleCommit(owner, repo, response.sha)
            })
            .then(getCommitFromTree => {
                lastCommitSha = getCommitFromTree.sha
                return createBlob(owner, repo, value)
            })
            .then(newBlob => {
                return createTree(lastCommitSha, owner, repo, newBlob.sha, pathNew)
            })
            .then(newTree => {
                return createCommit(owner, repo, msg, lastCommitSha, newTree.sha)
            })
            .then(newCommit => {
                newCommitSha = newCommit.sha
                updateRef(owner, repo, treeName, newCommit.sha)
                alert("Content successfully saved in Git")
            })
            .catch(error => {
                throw error
            });
        return {
            currentValueOwner: owner,
            currentValuePath: pathNew,
            currentValueRepo: repo,
            currentValueParentCommit: newCommitSha,
            currentValueBranch: treeName
        }
    }

    async function reviveFromGitGH(owner: string, repo: string, path: string, ref: string) {
        let value = ""
        let currentValueInfo:fileInfo = defaultFileInfoState
        await getRep(owner, repo)
            .then(reps => {
                //console.log(reps)
                //check permissions
                if (reps.permissions && reps.permissions.pull && reps.permissions.push) {
                    return reps.owner.login
                } else if (reps.permissions && (!reps.permissions.pull || !reps.permissions.push)) {
                    throw getRepPermission
                }
                throw getCommit404
            })
            .then(owner => {
                return getBlob(owner, repo, path, ref)
            })
            .then(infoFile => {
                // (??) only this place need ts-ignore
                //@ts-ignore
                value = b64DecodeUnicode(infoFile.content)
                currentValueInfo = {
                    currentValueOwner: owner,
                    currentValuePath: path,
                    currentValueRepo: repo,
                    //@ts-ignore
                    currentValueParentCommit: infoFile.sha,
                    currentValueBranch: ref
                }
            })
        return {
            value: value,
            currentValueInfo: currentValueInfo
        }
    }


    return {
        onStartGH:onStartGH,
        getCommitFileAndBranchGH: getCommitFileAndBranchGH,
        saveContentInGitGH: saveContentInGitGH,
        reviveFromGitGH: reviveFromGitGH
    }
}