import {branch, filePath} from "./choose-path-container";
import {FileInfo} from "./file-info";
import {set} from "@octokit/auth-app/dist-types/cache";
import up from './image/up.svg'
import React from "react";

export const ChoosePath = (props:{
    owner:string,
    repo:string,
    branchesList:branch[],
    currTree: filePath[],
    currDir: string,
    setCurrDir: (str:string) => void,
    setFile: (str:string) => void,
    backDir: (event:any) => void,
    indexBranch:number,
    setIndexBranch: (num:number) => void,
    onReturnToList: (event:any) => void,
}) => {

    const setIndex = (name:string) => {
        props.setIndexBranch((props.branchesList.map(arr => arr.name)).indexOf(name))
    }

    console.log(props.currTree)

    return (
        <div className={"bg-accent text-white p-2 px-3 w-full h-full"}>
            <div className={""}>
                <button onClick={props.onReturnToList} className={"mr-2 px-4 py-2 rounded-sm text-sm font-medium border-0 transition text-white bg-gray-dark hover:bg-gray"}
                         type={'button'}>Back</button>
                <h3 className={"m-0 text-gray"}>Choose file from repo:</h3>
                <div className={"flex flex-wrap"}>
                    <h3 className={"m-0"}>{props.owner}/ </h3>
                    <h3 className={"m-0"}>{props.repo}/</h3>
                </div>
                <p className={"text-xs text-gray pb-2"}>Commit: {props.branchesList[props.indexBranch].lastCommitSha}</p>
                /{props.currDir}
            </div>
            <div className={"flex flex-wrap py-2 text-gray"}>
                <div className={"py-0.5"}>Branches:</div>
                {props.branchesList.map((item, index) =>
                    <button key={index} onClick={()=> setIndex(item.name)}>
                        <div className={`flex-grow hover:bg-accent-second 
                        ${item.name === props.branchesList[props.indexBranch].name && 'text-xl text-white'} text-center px-4`} >
                            <div>{item.name}</div>
                            <div className={"text-xs"}>{(item.protected && "true") || "false"}</div>
                        </div>
                    </button>
                )}
            </div>
            <div className={""}>
                {(props.currDir!="" &&
                    <div className={"px-2 hover:bg-accent-second border border-gray m-0.5"}>
                        <button className={"w-full h-full"} onClick={props.backDir}>
                            <img className={"pt-2"} width={"20"} alt="..." src={up}/>
                        </button>
                    </div>) ||
                    <div className={"px-2 py-1.5"}>
                        <div className={"pt-2 h-28px"}/>
                    </div>
                }
                <div className={"flex flex-wrap"}>
                {props.currTree.map((item, index) =>
                    <div key={index} className={"flex-grow border border-gray px-2 m-0.5 hover:bg-accent-second"}>
                        <FileInfo setDir={props.setCurrDir} setFile={props.setFile}
                                  info={item}/>
                    </div>
                )}
                </div>
            </div>
        </div>
    )
}