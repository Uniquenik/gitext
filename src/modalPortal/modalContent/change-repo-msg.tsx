import {fileInfo} from "../../redux/editor-state/data-types";
import parse from "html-react-parser";

const header = "Change file in editor?"
export const ChangeRepoMsg = (
    props: {
        from: fileInfo,
        to: fileInfo,
        saveGit: boolean,
        onReturn: (event:any) => void,
        onEdit: (event:any) => void,
        currentContent: string
    }) => {

    return (
        <>
            <div className={"rounded-sm bg-accent-second w-full"}>
                <h2 className={"px-2 text-error border-b-2 border-gray m-0 w-max"}>{header}</h2>
                {props.from.currentValueOwner != props.to.currentValueOwner ||
                props.from.currentValueRepo != props.to.currentValueRepo &&
                <h2>(Different repository)</h2>
                }
                {!props.saveGit && <h3 className={"m-0 text-error text-center"}>(Content not save in Git!)</h3>}
                <div className={"font-sans h-40vh bg-white w-full overflow-auto"}>
                    {parse(props.currentContent)}
                </div>
                <div className={"text-base text-white"}>
                    From: {props.from.currentValueOwner} / {props.from.currentValueRepo}
                    <div>:{props.from.currentValuePath}
                    </div>
                </div>
                <div className={"text-base text-white"}>
                    To: {props.to.currentValueOwner} / {props.to.currentValueRepo}
                    <div>:{props.to.currentValuePath}
                    </div>
                </div>
                <div className={"flex"}>
                    <button className={"m-2 px-4 py-2 rounded-sm text-sm font-medium border-0 transition text-white bg-gray-dark hover:bg-gray"}
                            onClick={props.onReturn} >No, back</button>
                    <div className={"flex-grow"}></div>
                    <button className={"m-2 px-4 py-2 rounded-sm text-sm font-medium border-0 transition text-white bg-black-second hover:bg-gray"}
                            onClick={props.onEdit} >Yes, override</button>
                </div>

            </div>
        </>
    )
}