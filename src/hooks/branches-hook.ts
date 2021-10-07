import {octokit} from "../api/auth-token";
import {Endpoints} from "@octokit/types";
import {
    getAllBranches404, getAllPullReq304, getAllPullReq422, getCommit404, getTree404, getTree422,
    getTreesCommits400,
    getTreesCommits404,
    getTreesCommits409, getTreesCommits500,
    getUser404
} from "../types/errors-const";

export const useBranches = () => {
    const getAllBranches = (owner:string, repo:string) => {
        return new Promise<Endpoints['GET /repos/{owner}/{repo}/branches']["response"]["data"]>((resolve, reject) => {
                octokit.request('GET /repos/{owner}/{repo}/branches', {
                owner: owner,
                repo: repo
            })
                .then((response: any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    if (error.response && error.response.status === 404) reject(getAllBranches404);
                    else reject("Unhandled:\n" + error)
                })
        })
    }

    const getTreesCommits = (owner:string, repo:string, ref:string, per_page:number) => {
        return new Promise<Endpoints['GET /repos/{owner}/{repo}/commits']["response"]["data"]>
        ((resolve, reject) => {
            octokit.request('GET /repos/{owner}/{repo}/commits?sha={ref}', {
                owner: owner,
                repo: repo,
                ref: ref,
                per_page: per_page
            })
                .then((response: any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    if(error.response) {
                        switch (error.response.status) {
                            case 400:
                                reject(getTreesCommits400)
                                break;
                            case 404:
                                reject(getTreesCommits404)
                                break;
                            case 409:
                                reject(getTreesCommits409)
                                break;
                            case 500:
                                reject(getTreesCommits500)
                                break;
                        }
                    }
                    reject("Unhandled:\n" + error)
                })
        })
    }

    const getAllCommits = (owner:string, repo:string, per_page:number) => {
        return new Promise<Endpoints['GET /repos/{owner}/{repo}/commits']["response"]["data"]>
        ((resolve, reject) => {
            octokit.request('GET /repos/{owner}/{repo}/commits?sha=', {
                owner: owner,
                repo: repo,
                //path: '/',
                per_page: per_page
            })
                .then((response:any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    reject(new Error(error))
                })
        })
    }

    const getTreeFromSha = (refName:string, owner:string, repo:string) => {
        return new Promise<Endpoints['GET /repos/{owner}/{repo}/git/trees/{tree_sha}']["response"]["data"]>((resolve, reject) => {
            octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
                owner: owner,
                repo: repo,
                tree_sha: refName
            })
                .then((response:any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    if(error.response) {
                        switch (error.response.status) {
                            case 404:
                                reject(getTree404)
                                break;
                            case 422:
                                reject(getTree422)
                                break;
                        }
                    }
                    reject("Unhandled:\n" + error)
                })
        })
    }

    const getCommitSha = (sha:string, owner:string, repo:string) => {
        return new Promise<Endpoints['GET /repos/{owner}/{repo}/git/commits/{commit_sha}']["response"]["data"]>((resolve, reject) => {
            octokit.request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', {
                owner: owner,
                repo: repo,
                commit_sha: sha
            })
                .then((response:any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    if(error.response && error.response.status === 404) reject(getCommit404)
                    reject("Unhandled:\n" + error)
                })
        })
    }

    const createNewBranch = (refName:string, owner:string, repo:string, shaCommit:string) => {
        return new Promise<any>((resolve, reject) => {
            octokit.request('POST /repos/{owner}/{repo}/git/refs', {
                owner: owner,
                repo: repo,
                ref: `refs/heads/${refName}`,
                sha: shaCommit,
                force: true
            })
                .then((response:any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    reject(error)
                })

        })
    }

    const getPullRequest = (owner:string, repo:string, pull_number:number) => {
        return new Promise<Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}/commits']["response"]["data"]>((resolve, reject) => {
            octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/commits', {
                owner: owner,
                repo: repo,
                pull_number: pull_number
            })
                .then((response:any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    reject(error)
                })
        })
    }

    const getAllPullRequests = (owner:string, repo:string) => {
        return new Promise<Endpoints['GET /repos/{owner}/{repo}/pulls']["response"]["data"]>((resolve, reject) => {
            octokit.request('GET /repos/{owner}/{repo}/pulls', {
                owner: owner,
                repo: repo,
                state: 'all'
            })
                .then((response:any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    if(error.response) {
                        switch (error.response.status) {
                            case 304:
                                reject(getAllPullReq304)
                                break;
                            case 422:
                                reject(getAllPullReq422)
                                break;
                        }
                    }
                    reject("Unhandled:\n" + error)
                })
        })
    }

    const getUser = (username:string) => {
        return new Promise<Endpoints['GET /users/{username}']["response"]["data"]>((resolve, reject) => {
            octokit.request('GET /users/{username}', {
                username: username
            })
                .then((response:any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    if (error.response && error.response.status === 404) reject(getUser404);
                    else reject(error);
                })
        })
    }



    return {
        getAllBranches: getAllBranches,
        getAllCommits: getAllCommits,
        getTreeFromSha: getTreeFromSha,
        getCommitSha: getCommitSha,
        createNewBranch: createNewBranch,
        getTreesCommits: getTreesCommits,
        getPullRequest: getPullRequest,
        getAllPullRequests: getAllPullRequests,
        getUser: getUser

    }

}