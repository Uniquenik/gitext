import {useState} from "react";
import {Octokit} from "@octokit/core";
import {useDispatch, useSelector} from "react-redux";
import {RootReducer} from "../redux";
import {deleteAuthToken, setAuthToken} from "../redux/main-state/main-action-creators";
import {Endpoints} from "@octokit/types";
import {getUserRep304, getUserRep401, getUserRep403, getUserRep422} from "../types/errors-const";

export const useAuth = () => {
    const defaultOctokit = new Octokit({auth:"1"})
    const dispatch = useDispatch();
    const mainStatus: any = useSelector<RootReducer>(state => state.main);
    const [octo, setOcto] = useState<Octokit>(defaultOctokit)

    const isOcto = () => {
        console.log(octo)
        return (octo && true) || false
    }

    const stillValidOcto = () => {
        return new Promise<Boolean>
        ((resolve, reject) => {
            octo.request("/user")
                .then((response:any) => {
                    resolve(true)
                })
                .catch((error:any) => {
                    if (error.response) {
                        switch (error.response.status) {
                            case 401:
                                reject(false)
                                deleteOcto()
                        }
                    } //обработка ошибок есть, просто скрыта
                    reject("Unhandled:\n" + error)
                })
        })
    }

    const setToken = (token:string) => {
        setOcto(new Octokit({auth: token}))
        dispatch(setAuthToken(token))
    }

    const getOcto = () => {
        if (octo === defaultOctokit && mainStatus.isAuth) {
            let tempOcto = new Octokit({auth:mainStatus.authToken})
            setOcto(tempOcto)
            return tempOcto
        }
        else if (!mainStatus.isAuth) return new Octokit()
        else return octo
    }

    const deleteOcto = () => {
        dispatch(deleteAuthToken())
        setOcto(defaultOctokit)
    }

    return {
        isOcto: isOcto,
        setToken: setToken,
        getOcto: getOcto,
        deleteOcto: deleteOcto,
        stillValidOcto: stillValidOcto
    }


}