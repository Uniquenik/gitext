import {Endpoints} from "@octokit/types";
import {octokit} from "../api/auth-token";
import {getBlob403, getBlob404, getBlob422, getTree404, getTree422} from "../types/errors-const";

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

    const getAllRepAuth = () => {
        return new Promise<Endpoints['GET /user/repos']["response"]["data"]>
        ((resolve, reject) => {
            octokit.request('GET /user/repos')
                .then((response: any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    reject(error)
                })
        })
    }

    const getBlob = (owner:string, repo:string, path:string, ref:string) => {
        return new Promise<Endpoints['GET /repos/{owner}/{repo}/contents/{path}']["response"]["data"]>
        ((resolve, reject) => {
            octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: owner,
                repo: repo,
                path: path,
                ref: ref
            })
                .then((response: any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    reject(error)
                })
        })
    }

    const getBlobFromFileSha = (owner:string, repo:string, fileSha:string) => {
        return new Promise<Endpoints['GET /repos/{owner}/{repo}/git/blobs/{file_sha}']["response"]["data"]>
        ((resolve, reject) => {
            octokit.request('GET /repos/{owner}/{repo}/git/blobs/{file_sha}', {
                owner: owner,
                repo: repo,
                file_sha: fileSha
            })
                .then((response: any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    if(error.response) {
                        switch (error.response.status) {
                            case 403:
                                reject(getBlob403)
                                break;
                            case 404:
                                reject(getBlob404)
                                break;
                            case 422:
                                reject(getBlob422)
                                break;
                        }
                    }
                    reject("Unhandled:\n" + error.response.data.message)
                })
        })
    }

    return {
        getSingleTree: getSingleTree,
        getSingleCommit: getSingleCommit,
        createBlob: createBlob,
        createTree: createTree,
        createCommit: createCommit,
        updateRef: updateRef,
        getAllRepAuth: getAllRepAuth,
        getBlob: getBlob,
        getBlobFromFileSha: getBlobFromFileSha
    }
}