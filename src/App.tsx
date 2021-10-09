import React, {useEffect} from 'react';
import './App.css';

import {BranchesContainer} from "./components/commitAndBranches/branches-container";
import TinyMCEEditor from "./components/tinyMCEeditor/tinymce-editor"
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";
import {ChangeRepoContainer} from "./components/chooseRepo/change-repo-container";
import {ChoosePathContainer} from "./components/choosePath/choose-path-container";
import {useSelector} from "react-redux";
import {RootReducer} from "./redux";
import {AuthContainer} from "./components/auth/auth-container";

//const { Octokit } = require("@octokit/core");
//const octokit = new Octokit({ auth: `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` });


const App = () => {

    const mainStatus: any = useSelector<RootReducer>(state => state.main);

    useEffect(() => {

    }, [])

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
        );
    }


    return (
        <Router>
            <div>
                <Switch>
                    <PrivateRoute path="/:owner/:repo/:path/branches/:commitSha" children={<BranchesContainer/>}/>
                    <PrivateRoute path="/:owner/:repo/:path/branches/" children={<BranchesContainer/>}/>
                    <PrivateRoute path="/:owner/:repo/:path/editor/:commitSha" children={<TinyMCEEditor/>}/>
                    <PrivateRoute path="/:owner/:repo/:path/editor/" children={<TinyMCEEditor/>}/>
                    <PrivateRoute path= "/:owner/:repo" children={<ChoosePathContainer/>}/>
                    <PrivateRoute path= "/userrepos" children={<ChangeRepoContainer/>}/>
                    <Route path="/auth" children={<AuthContainer/>}/>
                </Switch>
            </div>
        </Router>
    )
}


export default App;
