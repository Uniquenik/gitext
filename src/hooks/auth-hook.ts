import {useEffect, useState} from "react";
import {Octokit} from "@octokit/core";
import {auth} from "@octokit/auth-app/dist-types/auth";
import {useDispatch, useSelector} from "react-redux";
import {RootReducer} from "../redux";
import {deleteAuthToken, setAuthToken} from "../redux/main-state/main-action-creators";

export const useAuth = () => {
    const defaultOctokit = new Octokit({auth:"1"})
    const dispatch = useDispatch();
    const mainStatus: any = useSelector<RootReducer>(state => state.main);
    const [octo, setOcto] = useState<Octokit>(defaultOctokit)

    const isOcto = () => {
        console.log(octo)
        return octo && true || false
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
        deleteOcto: deleteOcto
    }


}