import {useEffect, useState} from "react";
import arrow from "./image/arrow-down.svg"
import {ButtonCallback} from "./buttons-callback-interface";

export const BranchesListButton = ({...props}: ButtonCallback & {selected:boolean}) => {
    const [ clicked, setClicked ] = useState<boolean>(false);

    useEffect(() => {
        setClicked(props.selected)
    }, [])

    const onClick = (event) => {
        setClicked(clicked => !clicked);
        props.callback(event)
    }

    return (
        <button
            className={"bg-white rounded-md"}
            onClick={ onClick } style={{transition: "all 0.3s ease-out",
            transform: clicked ? "" : `rotate(180deg)`}}>
            <img width={30} src={arrow} alt={"arrow"}/>
        </button>
    );
}
