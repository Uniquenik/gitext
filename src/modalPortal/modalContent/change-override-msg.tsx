import {fileInfo} from "../../redux/editor-state/data-types";
import parser from "../../components/other/validateHTML";

const headerChangeRepo = "Change file in editor?"
const headerOverride = "Override current content?"
export const ChangeOverrideMsg = (
    props: {
        isChange: boolean,
        from: fileInfo,
        to: fileInfo,
        saveGit: boolean,
        onBack: (event: any) => void,
        onReturn: (event: any) => void,
        onEdit: (event: any) => void,
        currentContent: string,
    }) => {

    return (
        <>
            <div className={"rounded-sm bg-accent-second w-full max-w-80vw"}>
                <h2 className={"px-2 text-error border-b-2 border-gray m-0"}>
                    {(props.isChange && headerChangeRepo) || headerOverride}</h2>
                <div className={"text-center text-error"}>
                    {(((props.from.currentValueOwner !== props.to.currentValueOwner) ||
                        (props.from.currentValueRepo !== props.to.currentValueRepo)) &&
                        <h3 className={"m-0"}>(Different repository)</h3>)
                    }
                    {(props.to.currentValueBranch && props.from.currentValueBranch !== props.to.currentValueBranch) &&
                    <h3 className={"m-0"}>(Another branch)</h3>
                    }
                    {props.from.currentValuePath !== props.to.currentValuePath &&
                    <h3 className={"m-0"}>(Different file)</h3>
                    }
                    {!props.to.currentValueParentCommit &&
                    <h3 className={"m-0"}>(No content from new file)</h3>}
                </div>
                {!props.saveGit && <h3 className={"m-0 text-error text-center"}>(Current content not save in Git!)</h3>}
                <div className={"font-sans h-40vh bg-white w-full overflow-auto"}>
                    {props.currentContent && parser(props.currentContent)}
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
                <div className={"flex flex-wrap"}>
                    <button
                        className={"m-2 px-4 py-2 rounded-sm text-sm font-medium border-0 transition text-white bg-gray-dark hover:bg-gray"}
                        onClick={props.onBack}>No, back
                    </button>
                    <button
                        className={"m-2 px-4 py-2 rounded-sm text-sm font-medium border-0 transition text-white bg-gray-dark hover:bg-gray"}
                        onClick={props.onReturn}>Edit current content
                    </button>
                    <div className={"flex-grow"}/>
                    <button
                        className={"m-2 px-4 py-2 rounded-sm text-sm font-medium border-0 transition text-white bg-black-second hover:bg-gray"}
                        onClick={props.onEdit}>Yes, override
                    </button>
                </div>

            </div>
        </>
    )
}