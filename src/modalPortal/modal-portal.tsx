import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import React from "react";


export const ModalPortal = ({ show, closable, children, selector, onClose }) => {

    const [ mounted, setMounted ] = useState(false);
    const ref = useRef();

    useEffect(() => {
        ref.current = document.querySelector(selector);
        setMounted(true);
    }, [ selector ]);

    const handleCloseClick = (e) => {
        e.preventDefault();
        onClose();
    };

    const styleContentContainer = {
        meta: "modal-content-container ",
        layout: "fixed top-2/4 z-30 left-2/4 w-min h-min rounded-4 ",
        transform: "transform -translate-x-1/2 -translate-y-1/2 ",
        get() {
            return this.meta + this.layout + this.transform;
        }
    }

    const styleContent = {
        meta: "modal-content ",
        layout: "relative z-30 w-full h-full rounded-md ",
        color: "bg-dark",
        get() {
            return this.meta + this.layout + this.color;
        }
    }

    const styleFull = {
        meta: "modal-full-container ",
        layout: "fixed w-100vw h-100vh z-20 top-0 left-0 flex items-center justify-center ",
        color: "bg-black bg-opacity-80 ",
        get() {
            return this.meta + this.layout + this.color;
        }
    }

    const modalContent = (
        <>
                {
                    show
                    && <div>
                        <div
                            className={ styleContentContainer.get() }>
                            <div className={ styleContent.get() }>
                                { children }
                            </div>
                        </div>
                        <div
                            className={ styleFull.get() }
                            // @ts-ignore
                            onClick={ closable ? handleCloseClick: null }>
                        </div>
                    </div>
                }
        </>
    );

    // @ts-ignore
    return mounted ? createPortal(modalContent, ref.current) : null;
}