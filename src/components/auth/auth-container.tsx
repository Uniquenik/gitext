import {Auth} from "./auth";
import {ChangeEvent, useState} from "react";
import {Octokit} from "@octokit/core";
import {useAuth} from "../../hooks/auth-hook";
import {useHistory} from 'react-router-dom'
import {useDispatch} from "react-redux";
import {setUsername} from "../../redux/main-state/main-action-creators";


export const AuthContainer = () => {
    let history = useHistory()
    const dispatch = useDispatch();
    const [value, setValue] = useState("")
    const {isOcto, setToken} = useAuth()

    const onChangeTokenInput = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
        setValue(value)
    }

    async function checkToken () {
        let octokit = new Octokit({auth: value
        });
        console.log(octokit)
        await octokit.request("/user")
             .then((resp)=>{
                 setToken(value)
                 dispatch(setUsername(resp.data.login))
                 history.push('/userrepos')
             })
             .catch((error) => {
                 console.log(error)
             })
    }

    return(
        <Auth token={value}
              onChangeTokenInput={onChangeTokenInput}
              checkToken={checkToken}
        />
    )

}