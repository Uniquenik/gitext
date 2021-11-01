import {Octokit} from "@octokit/core";

export const useAuthLogin = () => {

    async function checkTokenGH (value:string) {
        let octokit = new Octokit({auth: value});
        console.log(octokit)
        return await octokit.request("/user")
    }
    return {
        checkTokenGH: checkTokenGH
    }
}