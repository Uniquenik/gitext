import {Octokit} from "@octokit/core";

async function getClient() {
    /*const appOctokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: 141166,
            privateKey: "SHA256:6Bu1H2kWO1l386bu4ic8B3ruoKX0yu+bkd5YlaNvytI=",
        },
    });
    console.log(appOctokit)
    const { data } = await appOctokit.request("/app");
    console.log(data)*/
}

export default getClient
export const octokit = new Octokit({auth: `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`});