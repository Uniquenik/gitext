import React from 'react';
import './App.css';
import {BranchesContainer} from "./components/commitAndBranches/branches-container";
import EditorContainer from "./components/editor/editor-container"
import {
    BrowserRouter as Router,
    Route,
    Redirect
} from "react-router-dom";
import {ChangeRepoContainer} from "./components/chooseRepo/change-repo-container";
import {ChoosePathContainer} from "./components/choosePath/choose-path-container";
import {useSelector} from "react-redux";
import {RootReducer} from "./redux";
import {AuthContainer} from "./components/auth/auth-container";
import MainPage from "./components/mainPage/mainPage";


const App = () => {

    const mainStatus: any = useSelector<RootReducer>(state => state.main);

    function PrivateRoute({ children, ...rest }) {
        return (
            <Route
                {...rest}
                render={({ location }) =>
                    mainStatus.isAuth ? (
                        children
                    ) : (
                        <Redirect
                            to={{
                                pathname: "/auth",
                                state: { from: location }
                            }}
                        />
                    )}
            />
        );}


    return (
        <Router>
            <div>
                <PrivateRoute exact path="/:owner/:repo/:path/branches/:commitSha" children={<BranchesContainer/>}/>
                <PrivateRoute exact path="/:owner/:repo/:path/branches/" children={<BranchesContainer/>}/>
                <PrivateRoute exact path="/:owner/:repo/:path/editor/:commitSha" children={<EditorContainer/>}/>
                <PrivateRoute exact path="/:owner/:repo/:path/editor/" children={<EditorContainer/>}/>
                <PrivateRoute exact path= "/:owner/:repo/:option/" children={<ChoosePathContainer/>}/>
                <PrivateRoute exact path= "/:owner/:repo/" children={<ChoosePathContainer/>}/>
                <PrivateRoute exact path= "/userrepos" children={<ChangeRepoContainer/>}/>
                <Route exact path="/auth" children={<AuthContainer/>}/>
                <Route exact path="/" children={<MainPage/>}/>
            </div>
        </Router>
    )
}


export default App;
