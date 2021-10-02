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

//get commit in branches (output on screen)
export const getCommit404 = `<div style="text-align:center;"><h1 style="color:red">Error 404</h1><h2>This commit not found</h2></div>`
export const emptyFileError = `<div style="text-align:center;"><h1 style="color:red">Error file</h1><h2>This file is empty</h2></div>`

export const getTree404 = `<div style="text-align:center;"><h1 style="color:red">Error 404</h1><h2>Problem with tree</h2></div>`
export const getTree422 = `<div style="text-align:center;"><h1 style="color:red">Error 422</h1><h2>?</h2></div>`

export const getBlob403 = `<div style="text-align:center;"><h1 style="color:red">Error 403</h1><h2>Forbidden</h2></div>`
export const getBlob404 = `<div style="text-align:center;"><h1 style="color:red">Error 404</h1><h2>Blob not found. Maybe wrong directory?</h2></div>`
export const getBlob422 = `<div style="text-align:center;"><h1 style="color:red">Error 422</h1><h2>?</h2></div>`

export const wrongExtension = `<div style="text-align:center;"><h1 style="color:red">Error with extension</h1><h2>We can work only with .html files</h2></div>`

export const unhandledError = "Unknown error\n Please, try again"

export const nameNotResolve = "Unknown error\n Check your connection";