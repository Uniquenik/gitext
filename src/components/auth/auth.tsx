export const Auth = (props: {
    token:string,
    onChangeTokenInput: (event:any) => void,
    checkToken: (event:any) => void
}) => {
    return(
        <>
            <input type={"text"}
                   onChange={props.onChangeTokenInput}
                   value={props.token}
                   placeholder={"paste your token here"}
            />
            <button onClick={props.checkToken}>
                Auth
            </button>
        </>
    )
}