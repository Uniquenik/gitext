import {Auth} from "./auth";
import {ChangeEvent, useState} from "react";
import {Octokit} from "@octokit/core";
import {useAuth} from "../../hooks/auth-hook";
import {useHistory} from 'react-router-dom'
import {useDispatch} from "react-redux";
import {setUsername} from "../../redux/main-state/main-action-creators";
import {LoadingContainer} from "../../loading/loading-container";
import {ModalPortal} from "../../modalPortal/modal-portal";
import {ErrorModal} from "../../modalPortal/error-modal";
import {badCredentials} from "../../types/errors-const";
import {LoadingOverlay} from "../../loading/loading-overlay";


export const AuthContainer = () => {
    let history = useHistory()
    const dispatch = useDispatch();

    const [isFetching, setIsFetching] = useState(false)
    const [error, setError] = useState("")

    const [value, setValue] = useState("")
    const {isOcto, setToken} = useAuth()

    const onChangeTokenInput = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
        setValue(value)
    }

    async function checkToken () {
        setIsFetching(true)
        let octokit = new Octokit({auth: value
        });
        console.log(octokit)
        await octokit.request("/user")
             .then((resp)=>{
                 setToken(value)
                 dispatch(setUsername(resp.data.login))
                 setIsFetching(false)
                 history.push('/userrepos')
             })
             .catch((error) => {
                 setIsFetching(false)
                 setError(badCredentials)
                 console.log(error)
             })
    }

    const onBack = () => {
        history.push('/auth')
        setError("")
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
                    <LoadingOverlay show={isFetching}/>)}
                </div>
            </ModalPortal>
                <Auth token={value}
                      onChangeTokenInput={onChangeTokenInput}
                      checkToken={checkToken}
                />
        </>
    )

}