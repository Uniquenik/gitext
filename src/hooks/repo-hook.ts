import {Endpoints} from "@octokit/types";
import {
    getUserRep304,
    getUserRep401,
    getUserRep403,
    getUserRep422
} from "../types/errors-const";
import {useAuth} from "./auth-hook";

export const useRepo = () => {
    const {getOcto} = useAuth()
    const octokit = getOcto()!

    const getUserRepos = () => {
            return new Promise<Endpoints['GET /user/repos']["response"]["data"]>
            ((resolve, reject) => {
            octokit.request('GET /user/repos')
                .then((response:any) => {
                    resolve(response.data)
                })
                .catch((error:any) => {
                    if (error.response) {
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
                    } //обработка ошибок есть, просто скрыта
                    reject("Unhandled:\n" + error)
                })
        })
    }
    return {
        getUserRepo: getUserRepos

    }
}