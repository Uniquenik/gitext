import React from "react";
import {Link} from "react-router-dom"
import spinner from "./images/spinner.svg"
import error from './images/error.svg'
import { CSSTransition } from 'react-transition-group'
import styles from './loading-styles.module.css'

export const LoadingContainer = ({show, children, errorMsg}) => {
    const nodeRef = React.useRef(null);
    const TRANSITION_DELAY = 10;
    return (
        <>
            <div className={ "w-full h-full relative" }>
                <CSSTransition in={ show }
                               nodeRef={ nodeRef }
                               classNames={{
                                   enter: styles.enter,
                                   enterActive: styles.enterActive,
                                   exit: styles.exit,
                                   exitActive: styles.exitActive
                               }}
                               timeout={ 1000 }
                               unmountOnExit>
                    <div ref={ nodeRef }
                         style={{ transitionDelay: `${ TRANSITION_DELAY }ms`}}
                         className={ "absolute w-full h-full bg-black bg-opacity-90 z-30" }>
                        {!errorMsg &&
                        <div className={"absolute bottom-2/4 left-2/4 z-30"}>
                            <img alt={"spinner"}
                                 className={"animate-spin"}
                                 width={"30"}
                                 height={"30"}
                                 src={spinner}/>
                        </div>
                            ||
                        <div className={"mx-m125px my-m90px absolute text-white bottom-2/4 left-2/4 z-30"}>
                            <div className={"bg-accent h-max w-250px rounded-t-lg"}>
                                <img alt={"error"}
                                     className={"mx-auto py-2"}
                                     width={"50"}
                                     height={"50"}
                                     src={error}/>
                                <div className={"text-xl text-center text-error"}>Error!</div>
                                <div className={"pb-4 whitespace-pre overflow-ellipsis overflow-hidden text-center text-gray-middle text-sm"}>
                                    {errorMsg}
                                </div>
                                <Link to={"/"}>
                                    <button className={"w-full p-2 bg-error hover:bg-gray"}>Go back</button>
                                </Link>
                            </div>
                        </div>
                        }
                    </div>
                </CSSTransition>
                {children}
            </div>
        </>
    );

}