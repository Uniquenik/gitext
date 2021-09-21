import { combineReducers } from "redux";
import { createStore, applyMiddleware } from "redux";
import {branchesReducer} from "./branches-state/branches-reducer";
import {branchesState} from "./branches-state/data-types";

export interface RootReducer {
    branches:branchesState
}

const rootReducer = combineReducers({
    branches: branchesReducer
});

export const store = createStore(rootReducer);