import parse from "html-react-parser";
import {fileInfo} from "../../redux/editor-state/data-types";

const header = "Override current content?"

export const OverrideSaveMsg = (
    props: {
        from: fileInfo,
        to: fileInfo,
        onReturnOld: (event:any) => void,
        onOverride: (event:any) => void,
        currentContent: string
    }) => {

    return(
        <>
            <div className={"rounded-sm bg-accent-second w-full"}>
                <h2 className={"px-2 text-error border-b-2 border-gray m-0 w-max"}>{header}</h2>
                <div className={"text-center text-error"}>
                    {props.from.currentValueOwner != props.to.currentValueOwner ||
                        props.from.currentValueRepo != props.to.currentValueRepo &&
                        <h3 className={"m-0"}>(Different repository)</h3>
                    }
                    {props.from.currentValuePath != props.to.currentValuePath &&
                        <h3 className={"m-0"}>(Different file)</h3>
                    }
                    {!props.to.currentValueParentCommit && <h3 className={"m-0"}>(no content)</h3>}

                </div>
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
                    <button className={"m-2 px-4 py-2 rounded-sm text-sm font-medium border-0 transition text-white bg-gray-dark hover:bg-gray"} onClick={props.onReturnOld} >No, back</button>
                    <div className={"flex-grow"}></div>
                    <button className={"m-2 px-4 py-2 rounded-sm text-sm font-medium border-0 transition text-white bg-black-second hover:bg-gray"} onClick={props.onOverride} >Yes, override</button>
                </div>

            </div>

        </>
    )
}