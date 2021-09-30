import React, {useEffect} from 'react';
import './App.css';

import {BranchesContainer} from "./components/commitAndBranches/branches-container";
import TinyMCEEditor from "./tinymce-editor"
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

//const { Octokit } = require("@octokit/core");
//const octokit = new Octokit({ auth: `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` });


const App = () => {

    useEffect(() => {
    }, [])

    /*function b64DecodeUnicode(str: any) {
        // Going backwards: from bytestream, to percent-encoding, to original string.
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    function b64EncodeUnicode(str) {
        // first we use encodeURIComponent to get percent-encoded UTF-8,
        // then we convert the percent encodings into raw bytes which
        // can be fed into btoa.
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode(Number('0x' + p1));
            }));
    }*/

    return (
        <Router>
            <div>
                <Switch>
                    <Route path="/branches/:commitSha" component={BranchesContainer}/>
                    {/*    <BranchesContainer/>
                    </Route>*/}
                    <Route path="/">
                        <TinyMCEEditor/>
                    </Route>
                </Switch>
            {/**/}
            </div>
        </Router>
    )
}


export default App;
