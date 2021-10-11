import {filePath} from "./choose-path-container";
import folder from "./image/folder.svg"
import file from "./image/file.svg"

export const FileInfo = (props: {
    info:filePath,
    setDir: (str:string) => void,
    setFile: (str:string) => void,
}) => {
    return(
        <>
        {(props.info.type === 'tree' &&
            <button className={"w-full h-full"}  onClick={()=>props.setDir(props.info.path)}>
                <div className={"flex"}>
                    <img alt={"folder"} width={"20"} src={folder}/>
                    <div className={"px-2 text-lg"}>
                        {props.info.path}
                    </div>
                </div>
            </button>
        )
        || <button className={"w-full h-full disabled:opacity-50"}
                   disabled={!props.info.path.includes(".html")} onClick={()=>props.setFile(props.info.path)}>
            <div className={"flex pt-1"}>
                <img alt={"file"} width={"20"} src={file}/>
                <div className={"px-2 text-lg"}>
                    {props.info.path}
                </div>
            </div>
        </button>}
        </>
)


}