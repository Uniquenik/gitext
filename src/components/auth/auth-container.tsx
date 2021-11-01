import {Auth} from "./auth";
import {ChangeEvent, useState} from "react";
import {Octokit} from "@octokit/core";
import {useAuth} from "../../hooks/auth-hook";
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from "react-redux";
import {setUsername} from "../../redux/main-state/main-action-creators";
import {ModalPortal} from "../../modalPortal/modal-portal";
import {ErrorModal} from "../../modalPortal/error-modal";
import {badCredentials} from "../../types/errors-const";
import {LoadingOverlay} from "../../loading/loading-overlay";
import {RootReducer} from "../../redux";
import {useAuthLogin} from "./git-auth";


export const AuthContainer = () => {
    let history = useHistory()
    const dispatch = useDispatch()
    const {deleteOcto} = useAuth()
    const mainStatus: any = useSelector<RootReducer>(state => state.main);
    const {checkTokenGH} = useAuthLogin()

    const [isFetching, setIsFetching] = useState(false)
    const [error, setError] = useState("")

    const [value, setValue] = useState("")
    const {setToken} = useAuth()

    const onChangeTokenInput = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
        setValue(value)
    }

    const checkToken = () => {
        setIsFetching(true)
        checkTokenGH(value)
            .then((resp) => {
                setToken(value)
                dispatch(setUsername(resp.data.login))
                setIsFetching(false)
                history.push('/userrepos')
            })
            .catch(()=> {
                setIsFetching(false)
                setError(badCredentials)
            })
    }

    const onBack = () => {
        history.push('/auth')
        setError("")
    }

    const onLogout = () => {
        deleteOcto()
    }

    return(
        <>
            <ModalPortal
                show={error!=="" || isFetching}
                closable={false}
                onClose={()=>{}}
                selector={"#modal"}
            >
                <div>
                    {(error!=="" &&
                    <ErrorModal errorMsg={error} onBack={onBack}/> ) ||
                    (isFetching &&
                    <LoadingOverlay/>)}
                </div>
            </ModalPortal>
                <Auth token={value}
                      onChangeTokenInput={onChangeTokenInput}
                      checkToken={checkToken}
                      onLogOut={onLogout}
                      isAuth={mainStatus.isAuth}
                />
        </>
    )

}