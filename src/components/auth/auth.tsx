import step1 from "./images/step1.png"
import step2 from "./images/step2.png"
import step3 from "./images/step3.png"
import step4 from "./images/step4.png"
import gh from "./images/github.svg"


export const Auth = (props: {
    token:string,
    onChangeTokenInput: (event:any) => void,
    checkToken: (event:any) => void
}) => {
    let texts = [{index:1, text: "In the upper-right corner of any page in Github, click your profile photo, then click Settings.",
        photo: step1, width:"25%"},
        {index:2,text: "In the left sidebar, click Developer settings and in new sidebar click Personal Access token",
            photo: step2, width:"40%"},
        {index:3,text: "Click Generate new token and give token some name",
            photo: step3, width:"80%"},
        {index:4,text: "Select repo (thats enough for us) and click Generate token below",
            photo: step4, width:"70%"}
    ]

    const onKeyPress = (event:any) => {
        //@ts-ignore
        if (event.key === 'Enter') props.checkToken()
    }

    return(
        <>
            <section className="text-white">
                <div className="container px-2 py-2 mx-auto flex flex-wrap">
                    <div className="flex flex-wrap w-full">
                        <div className={"lg:w-400px md:w-1/2 py-6 pt-8 mx-auto"}>
                            <img className={"mx-auto"} src={gh} width={100}/>
                            <h3 className={"m-0 text-center text-2xl p-2 pb-10"}>Connect via Github personal access token</h3>
                            <input type={"text"}
                                   className={"w-full rounded-sm border border-gray-middle p-1 m-1 bg-dark"}
                                   onChange={props.onChangeTokenInput}
                                   value={props.token}
                                   placeholder={"Paste your token here"}
                                   onKeyPress={onKeyPress}
                            />
                            <button className={"bg-dark-ultra hover:bg-dark rounded-lg w-full p-2 m-1 my-2"} onClick={props.checkToken}>
                                Authenticate
                            </button>
                            <div className={"text-gray text-sm mt-4 p-1"}>
                                <div>
                                    Your safety is in your hands. We save token only on your browser in encrypted form, because this is serverless application.
                                </div>
                                <div className={"my-4"}>
                                    You can always delete or regenerate your token, if there is a risk of compromising.
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-auto md:w-1/2 md:pl-10 md:py-6">
                            <h3 className={"m-0 text-xl text-center mb-2"}>How to get a personal access token?</h3>
                            { texts.map((item) =>
                            <div key={item.index} className="flex relative pb-6">
                                <div className="h-full w-10 absolute inset-0 flex items-center justify-center">
                                    <div className="h-full w-1 bg-gray pointer-events-none"></div>
                                </div>
                                <div className="flex-grow">
                                    <h2 className="font-medium title-font text-sm text-gray-900 mb-1 tracking-wider">STEP {item.index}</h2>
                                    <p className="leading-relaxed"> {item.text}</p>
                                    <div className={"pt-2"}>
                                        <img alt="text" className={"mx-auto rounded-sm"} src={item.photo} width={item.width}/>
                                    </div>
                                </div>
                            </div> )}

                            <div className="flex relative">
                                <div
                                    className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo inline-flex items-center justify-center text-white relative z-10">
                                    <svg fill="none" className="w-5 h-5"
                                         viewBox="0 0 24 24">
                                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                                        <path d="M22 4L12 14.01l-3-3"></path>
                                    </svg>
                                </div>
                                <div className="flex-grow">
                                    <h2 className="font-medium title-font text-sm text-gray-900 mb-1 tracking-wider">FINISH</h2>
                                    <p className="leading-relaxed">Paste token and enjoy! We save token and you don't need log in again every time.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}