import {octokit} from "../api/auth-token";
import {Endpoints, OctokitResponse} from "@octokit/types";

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
                    reject(error)
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
                    reject(error)
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
                //per_page: per_page
            })
                .then((response:any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    reject(new Error(error))
                })
        })
    }

    const getTreeSha = (refName:string, owner:string, repo:string) => {
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
                    reject(error)
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
                    reject(error)
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

    return {
        getAllBranches: getAllBranches,
        getAllCommits: getAllCommits,
        getTreeSha: getTreeSha,
        getCommitSha: getCommitSha,
        createNewBranch: createNewBranch,
        getTreesCommits: getTreesCommits

    }

}