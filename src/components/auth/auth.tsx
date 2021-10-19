import step1 from "./images/step1.png"
import step2 from "./images/step2.png"
import step3 from "./images/step3.png"
import step4 from "./images/step4.png"
import step5 from "./images/step5.png"
import gh from "./images/github.svg"


export const Auth = (props: {
    token:string,
    onChangeTokenInput: (event:any) => void,
    checkToken: (event:any) => void
}) => {
    let texts = [{index:1, text: "In the upper-right corner of any page in Github, click your profile photo and then click Settings",
        photo: step1, width:"25%"},
        {index:2,text: "In the left sidebar scroll down and click Developer settings",
            photo: step2, width:"35%"},
        {index:3,text: "In new sidebar click Personal Access token",
            photo: step3, width:"35%"},
        {index:4,text: "Click Generate new token and give token some name",
            photo: step4, width:"90%"},
        {index:5,text: "Select scope repo (that's enough for work) and click Generate token below",
            photo: step5, width:"90%"}
    ]
    let warning1 = "Your safety is in your hands. We save token only on your browser in encrypted form, because this is serverless application."
    let warning2 = "You can always delete or regenerate your token, if there is a risk of compromising."
    let finish = "Paste token and enjoy! We save token in browser and you don't need sign in again every time."

    const onKeyPress = (event:any) => {
        //@ts-ignore
        if (event.key === 'Enter') props.checkToken()
    }

    return(
        <>
            <section className="text-white">
                <div className="container px-2 py-2 mx-auto flex flex-wrap">
                    <div className="flex flex-wrap w-full">
                        <div className={"lg:w-400px md:w-1/2 py-4 pt-8 mx-auto"}>
                            <img className={"mx-auto"} src={gh} width={100} alt={"github"}/>
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
                                    {warning1}
                                </div>
                                <div className={"my-4"}>
                                    {warning2}
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-auto md:w-1/2 md:pl-10 md:py-6">
                            <h3 className={"m-0 text-xl text-center mb-2"}>How to get a personal access token?</h3>
                            { texts.map((item) =>
                            <div key={item.index} className="flex relative pb-6">
                                <div className="h-full w-10 absolute inset-0 flex items-center justify-center">
                                    <div className="h-full w-1 bg-gray pointer-events-none"/>
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
                                <div className="flex-grow">
                                    <h2 className="font-medium title-font text-sm text-gray-900 mb-1 tracking-wider">FINISH</h2>
                                    <p className="leading-relaxed">{finish}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}