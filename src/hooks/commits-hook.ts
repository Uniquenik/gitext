import {Endpoints} from "@octokit/types";
import {octokit} from "../api/auth-token";

export const useCommits = () => {
    const getSingleTree = (owner:string, repo:string, tree_sha:string) => {
        return new Promise<Endpoints['GET /repos/{owner}/{repo}/git/trees/{tree_sha}']["response"]["data"]>
        ((resolve, reject) => {
            octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
                owner: owner,
                repo: repo,
                tree_sha: tree_sha
            })
                .then((response: any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    reject(error)
                })
        })
    }

    const getSingleCommit = (owner:string, repo:string, commit_sha:string) => {
        return new Promise<Endpoints['GET /repos/{owner}/{repo}/git/commits/{commit_sha}']["response"]["data"]>
        ((resolve, reject) => {
            octokit.request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', {
                owner: owner,
                repo: repo,
                commit_sha: commit_sha
            })
                .then((response: any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    reject(error)
                })
        })
    }

    const createBlob = (owner:string, repo:string, file:any) => {
        return new Promise<Endpoints['POST /repos/{owner}/{repo}/git/blobs']["response"]["data"]>
        ((resolve, reject) => {
            octokit.request('POST /repos/{owner}/{repo}/git/blobs', {
                owner: owner,
                repo: repo,
                content: file,
                encoding: "utf-8"
            })
                .then((response: any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    reject(error)
                })
        })
    }

    const createTree = (lastCommit: string, owner:string, repo:string, blobSha: string, path:string) => {
        return new Promise<Endpoints['POST /repos/{owner}/{repo}/git/trees']["response"]["data"]>
        ((resolve, reject) => {
            octokit.request('POST /repos/{owner}/{repo}/git/trees', {
                base_tree: lastCommit,
                owner: owner,
                repo: repo,
                tree: [
                    {
                        path: path,
                        mode: '100644',
                        type: 'blob',
                        sha: blobSha,
                    }
                ]
            })
                .then((response: any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    reject(error)
                })
        })
    }


    const createCommit = (owner:string, repo:string, messageCommit: string, parentCommitSha: string, tree: string) => {
        return new Promise<Endpoints['POST /repos/{owner}/{repo}/git/commits']["response"]["data"]>
        ((resolve, reject) => {
            octokit.request('POST /repos/{owner}/{repo}/git/commits', {
                owner: owner,
                repo: repo,
                message: messageCommit,
                parents: [parentCommitSha],
                tree: tree
            })
                .then((response: any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    reject(error)
                })
        })
    }

    const updateRef = (owner:string, repo:string, branchRef: string, commitSha: string) => {
        return new Promise<Endpoints['PATCH /repos/{owner}/{repo}/git/refs/{ref}']["response"]["data"]>
        ((resolve, reject) => {
            octokit.request('PATCH /repos/{owner}/{repo}/git/refs/{ref}', {
                owner: owner,
                repo: repo,
                ref: 'heads/'+branchRef,
                sha: commitSha,
                force: true
            })
                .then((response: any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    reject(error)
                })
        })
    }

    return {
        getSingleTree: getSingleTree,
        getSingleCommit: getSingleCommit,
        createBlob: createBlob,
        createTree: createTree,
        createCommit: createCommit,
        updateRef: updateRef
    }
}