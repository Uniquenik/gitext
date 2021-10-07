import { combineReducers } from "redux";
import { createStore, applyMiddleware } from "redux";
import { createLogger } from "redux-logger";
import {branchesReducer} from "./branches-state";
import {branchesState} from "./branches-state/data-types";
import {editorState} from "./editor-state/data-types";
import {editorReducer} from "./editor-state/editor-reducer";

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {composeWithDevTools} from "redux-devtools-extension";

const loggerMiddleware = createLogger();

const persistConfig = {
    key: 'root',
    storage,
}

export interface RootReducer {
    branches:branchesState,
    editor: editorState
}

const rootReducer = combineReducers({
    branches: branchesReducer,
    editor: editorReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = createStore(persistedReducer,
    composeWithDevTools(
        applyMiddleware(loggerMiddleware))
);

export default () => {
    let store = createStore(persistedReducer)
    //@ts-ignore
    let persistor = persistStore(store)
    return { store, persistor }
}

//@ts-ignore
export const persistor = persistStore(store);