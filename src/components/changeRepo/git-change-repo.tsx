import {changeRepoInfo} from "./data-types";
import {compareByPushedAt} from "../../types/comparators";
import {useRepo} from "../../hooks/repo-hook";
import {useAuthLogin} from "../auth/git-auth";
import {useAuth} from "../../hooks/auth-hook";

export const useChangeRepo = () => {

    const {getUserRepo} = useRepo()
    //const {stillValidOcto} = useAuth()

    async function getReposGH() {
        // await stillValidOcto()
        //     .catch((err) => {
        //         throw ("You are not authorized")
        //         }
        //     )
        // debugger;
        let repoArr: changeRepoInfo[] = []
        let response = await getUserRepo()
        response.forEach((item) => {
                repoArr.push({
                    created_at: item.created_at!,
                    pushed_at: item.pushed_at!,
                    id_project: item.id!,
                    language: item.language!,
                    name: item.name!,
                    description: item.description!,
                    owner_login: item.owner.login!,
                    owner_avatar: item.owner.avatar_url,
                    visibility: item.visibility!,
                    permissions:
                        [item.permissions!.admin,
                            item.permissions!.pull, item.permissions!.push]
                })
            }
        )
        repoArr.sort(compareByPushedAt)
        return repoArr
    }
    return{
        getReposGH:getReposGH
    }
}