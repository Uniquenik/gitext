import { combineReducers } from "redux";
import { createStore } from "redux";
import {branchesReducer} from "./branches-state";
import {branchesState} from "./branches-state/data-types";
import {editorState} from "./editor-state/data-types";
import {editorReducer} from "./editor-state/editor-reducer";

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {mainState} from "./main-state/data-types";
import {mainReducer} from "./main-state/main-reducer";
import {encryptTransform} from "redux-persist-transform-encrypt";

function makeKey(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

//DO NOT READ THIS!!!
const getKey = () => {
    if (!localStorage.getItem("SORRY_FOR_MY_PROTECTION"))
        localStorage.setItem("SORRY_FOR_MY_PROTECTION",makeKey(Math.random()*10)+5)
    return localStorage.getItem("SORRY_FOR_MY_PROTECTION")
}

const persistConfig = {
    key: 'root',
    storage,
    transforms: [
        encryptTransform({
            secretKey: getKey()!,
            onError: function (error) {
                console.log(error)
                throw new Error(error.message)
            },
        }),
    ],
}

export interface RootReducer {
    branches:branchesState,
    editor: editorState,
    main: mainState
}

const rootReducer = combineReducers({
    branches: branchesReducer,
    editor: editorReducer,
    main: mainReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = createStore(persistedReducer);

const st = () => {
    let store = createStore(persistedReducer)
    //@ts-ignore
    let persistor = persistStore(store)
    return { store, persistor }
}

export default st;

//@ts-ignore
export const persistor = persistStore(store);