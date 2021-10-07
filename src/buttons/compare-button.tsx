import {useEffect, useState} from "react";
import compare from "./image/compare.svg"
import {ButtonCallback} from "./buttons-callback-interface";

export const CompareButton = ({...props}: ButtonCallback & {selected:boolean}) => {
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
            className={"py-2 px-8 rounded-tr-lg bg-gray bg-opacity-80"}
            onClick={ onClick } >
            <img width={25} src={compare} alt={"arrow"} style={{transition: "all 0.3s ease-out",
                transform: clicked ? `rotate(0deg)` : `rotate(360deg)`}}/>
        </button>
    );
}