import {branchInfoInModal} from "../modalPortal/modalContent/data-types";
import {filePath} from "../components/choosePath/data-types";
import {commitInfo} from "../components/commitAndBranches/data-types";

export const compareCommitsByDate = (a: commitInfo, b: commitInfo) => {
    let a1 = Date.parse(a.commitAuthorDate)
    let b1 = Date.parse(b.commitAuthorDate)
    if (a1 < b1) return 1;
    if (a1 > b1) return -1;
    return 0;
}

export const compareLocalBranchesByDate = (a: branchInfoInModal, b: branchInfoInModal) => {
    let a1 = Date.parse(a.date)
    let b1 = Date.parse(b.date)
    if (a1 < b1) return 1;
    if (a1 > b1) return -1;
    return 0;
}

export const compareLocalTreeByType = (a: filePath, b: filePath) => {
    if (a.type < b.type) return 1;
    if (a.type > b.type) return -1;
    return 0;
}

export const compareByPushedAt = (a, b) => {
    if (a.pushed_at! > b.pushed_at!) return -1
    if (a.pushed_at! < b.pushed_at!) return 1
    else return 0;
}