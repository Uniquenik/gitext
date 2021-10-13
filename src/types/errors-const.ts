export const fileExistError = `<h1 style="text-align:center;">Error: File doesn't exist</h1>`
export const openFileMsg = `<h1 style="text-align:center;">Choose commit in the menu below for compare</h1>`

//response from server
export const getUser404 = "404\nThis user does not exist";
export const getAllBranches404 = "404\nThis owner + repo does not exist";

export const getTreesCommits400 = "400\n Incorrect data";
export const getTreesCommits404 = "404\n Incorrect branch";
export const getTreesCommits409 = "409\n Some conflict";
export const getTreesCommits500 = "500\n Problem with server";

export const getAllPullReq304 = "304\n ???";
export const getAllPullReq422 = "422\n Entity (?)";

export const getRep301 = "301\n Moved";
export const getRep403 = "403\n Where new?";
export const getRep404 = "404\n Problem with repo/owner";
export const badCredentials = "<div style=\"text-align:center;\"><h2 style=\"color:red; margin:0\">Bad credentials</h2><p>Incorrect token</p></div>";
export const getRepPermission = "<div style=\"text-align:center;\"><h2 style=\"color:red; margin:0\">Permission error</h2><p>You can't edit this repo</p></div>"

//get commit in branches (output on screen)
export const getCommit404 = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error 404</h2><p>This commit/file not found</p></div>`
export const emptyFileError = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error file</h2><p>This file is empty</p></div>`

export const getTree404 = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error 404</h2><p>Problem with tree</p></div>`
export const getTree422 = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error 422</h2><p>?</p></div>`

export const getBlob403 = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error 403</h2><p>Forbidden</p></div>`
export const getBlob404 = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error 404</h2><p>Blob not found. Maybe wrong directory?</p></div>`
export const getBlob422 = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error 422</h2><p>?</p></div>`

export const wrongExtension = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error with extension</h2><p>We can work only with .html files</p></div>`
export const wrongExtensionLine = `Error with extension\n We can work only with .html files`

export const getUserRep304 = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error 304</h2><p>Not modified (?)</p></div>`
export const getUserRep401 = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error 401</h2><p>Please, authorize</p></div>`
export const getUserRep403 = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error 403</h2><p>Forbidden (?)</p></div>`
export const getUserRep422 = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error 422</h2><p>Unprocessable Entity (?)</p></div>`

export const unhandledError = "Unknown error\n Please, try again"

export const universal401 = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error 401</h2><p>Please, authorize</p></div>`

export const getBranch301 = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error 301</h2><p>Moved permanently branch</p></div>`
export const getBranch404 = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error 404</h2><p>Branch not found</p></div>`
export const getBranch415 = `<div style="text-align:center;"><h2 style="color:red; margin:0">Error 415</h2><p>Header (?)</p></div>`

export const nameNotResolve = "Unknown error\n Check your connection";