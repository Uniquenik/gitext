import {Octokit} from "@octokit/core";
import {useAuth} from "../hooks/auth-hook";
import {useState} from "react";

export const GetOctokit = () => {
    const {getOcto} = useAuth()
    const [oct, setOct] = useState<Octokit>()
    if (!oct) {
        setOct(getOcto()!)
        return getOcto()!
    }
    else return oct

}

//export const octokit = new Octokit({auth: `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`});