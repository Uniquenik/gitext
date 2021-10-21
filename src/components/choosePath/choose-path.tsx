import {FileInfo} from "./file-info";
import {Link} from "react-router-dom";
import up from './image/up.svg'
import React from "react";
import {branchChoosePath, filePath} from "./data-types";

export const ChoosePath = (props:{
    owner:string,
    repo:string,
    branchesList:branchChoosePath[],
    currTree: filePath[],
    currDir: string,
    setCurrDir: (str:string) => void,
    setFile: (str:string) => void,
    backDir: (event:any) => void,
    indexBranch:number,
    setIndexBranch: (num:number) => void,
    onReturnToList: (event:any) => void,
    onChangeRadio: (event:any) => void,
    isEditGlobal: boolean
}) => {

    const setIndex = (name:string) => {
        props.setIndexBranch((props.branchesList.map(arr => arr.name)).indexOf(name))
    }

    return (
        <div className={"bg-accent text-white p-2 px-3 w-full h-full"}>
            <div className={""}>
                <div className={"flex flex-wrap"}>
                <button onClick={props.onReturnToList}
                        className={"mr-1 px-4 py-2 my-1 rounded-sm text-sm font-medium border-0 transition text-white bg-gray-dark hover:bg-gray"}
                        type={'button'}>Back</button>
                <div className={"flex-grow"}/>
                    {props.isEditGlobal &&
                    <div className="flex border border-gray rounded-sm overflow-hidden select-none" onChange={props.onChangeRadio}>
                        <div className="title py-3 pt-4 px-3 bg-accent-second text-white text-sm font-semibold mr-1">Open for...
                        </div>
                        <label className="flex radio p-1 cursor-pointer">
                            <input defaultChecked className="my-auto" value="edit" type="radio" name="sfg"/>
                            <div className="title px-2 py-2 pt-3">Edit</div>
                        </label>
                        <label className="flex radio p-1 cursor-pointer">
                            <input className="my-auto" value={"compare"} type="radio" name="sfg"/>
                            <div className="title px-2 py-2 pt-3">Compare</div>
                        </label>
                    </div>
                    }
                </div>
                <h3 className={"m-0 text-gray"}>Choose file from repo:</h3>
                <div className={"flex flex-wrap"}>
                    <h3 className={"m-0"}>{props.owner}/ </h3>
                    <h3 className={"m-0"}>{props.repo}/</h3>
                </div>
                {(props.owner.toLowerCase()+'.github.io' === props.repo &&
                    <div className={"text-sm py-2"}>
                        <div className={"text-error"}>Yay!</div>
                        You see the MAGIC repository and you can share content from /index.html in main branch with people around the world in one step! Just use
                        this <a href={"https://" +props.owner.toLowerCase()+'.github.io'} target="_blank" >link</a>.
                        <div className={"text-xs text-gray"}>
                            Not work? Read <a href={"https://pages.github.com"} target="_blank" >documentation</a> on Github.
                        </div>
                    </div>
                    )}
                <p className={"text-xs text-gray pb-2"}>Commit:
                    {(props.branchesList[props.indexBranch] && props.branchesList[props.indexBranch].lastCommitSha) || ""}</p>
                /{props.currDir}
            </div>
            <div className={"pt-1 text-gray"}>Branches:</div>
            <div className={"flex pb-2 text-gray overflow-x-auto mx-0.5"}>
                {props.branchesList.map((item, index) =>
                    <button key={index} onClick={()=> setIndex(item.name)} className={"flex-grow"}>
                        <div className={`flex-grow hover:bg-accent-second
                        ${item.name === props.branchesList[props.indexBranch].name && 'text-xl text-white'} text-center px-4`} >
                            <div>{item.name}</div>
                            <div className={"text-xs"}>{(item.protected && "true") || "false"}</div>
                        </div>
                    </button>
                )}
            </div>
            {props.branchesList.length === 30 && <div> (Show only first 30 branches) </div>}
            <div className={""}>
                <div className={"flex flex-wrap"}>
                    {(props.currDir !== "" &&
                        <div className={"px-2 hover:bg-accent-second border border-gray m-0.5 w-full h-full"}>
                            <button className={"w-full h-full"} onClick={props.backDir}>
                                <img className={"pt-2"} width={"20"} alt="..." src={up}/>
                            </button>
                        </div>) ||
                    <div className={"px-2 border border-gray m-0.5 w-full h-full"}>
                        <div className={"pt-2 h-35px"}/>
                    </div>
                    }
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