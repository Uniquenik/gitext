import {Endpoints} from "@octokit/types";
import {octokit} from "../api/auth-token";
import {
    getBlob403,
    getBlob404,
    getBlob422,
    getUserRep304,
    getUserRep401,
    getUserRep403,
    getUserRep422
} from "../types/errors-const";

export const useRepo = () => {

    const getUserRepo = () => {
        return new Promise<Endpoints['GET /user/repos']["response"]["data"]>((resolve, reject) => {
            octokit.request('GET /user/repos')
                .then((response:any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    if(error.response) {
                        switch (error.response.status) {
                            case 304:
                                reject(getUserRep304)
                                break;
                            case 401:
                                reject(getUserRep401)
                                break;
                            case 403:
                                reject(getUserRep403)
                                break;
                            case 422:
                                reject(getUserRep422)
                                break;
                        }
                    }
                    reject("Unhandled:\n" + error)
                })
        })
    }
    return {
        getUserRepo: getUserRepo

    }
}