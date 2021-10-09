import {branch, filePath} from "./choose-path-container";
import {FileInfo} from "./file-info";
import {set} from "@octokit/auth-app/dist-types/cache";
import up from './image/up.svg'

export const ChoosePath = (props:{
    branchesList:branch[],
    currTree: filePath[],
    currDir: string,
    setCurrDir: (str:string) => void,
    setFile: (str:string) => void,
    backDir: (event:any) => void,
    indexBranch:number,
    setIndexBranch: (num:number) => void
}) => {

    const setIndex = (name:string) => {
        props.setIndexBranch((props.branchesList.map(arr => arr.name)).indexOf(name))
    }

    return (
        <div className={"bg-accent text-white p-2"}>
            <h3>{props.branchesList[props.indexBranch].name}</h3>
            {props.currDir}
            <div className={"flex flex-wrap py-2 text-gray"}>
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
                    </div>)}
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