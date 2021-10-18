import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootReducer} from "../../redux";

export const Header = () => {
    const mainStatus: any = useSelector<RootReducer>(state => state.main);

    return (
        <header className={"z-30 fixed top-0 1024:bottom-auto w-full bg-gray-dark bg-opacity-50 p-1 px-2"}>
            <div className={"flex"}>
                <div className={"text-lg text-white"}>
                    Gitext
                </div>
                <div className={"flex-grow"}/>
                <div className={"text-white"}>
                    {mainStatus.isAuth &&
                    <Link to={`/userrepos`} className={"no-underline"}>
                        <div>{mainStatus.username}</div>
                    </Link>
                    ||
                    <Link to={`/auth`} className={"no-underline"}>
                        <div>Log in</div>
                    </Link>
                    }
                </div>
            </div>
        </header>

    )
}