import { createReducer, on } from "@ngrx/store";
import { setCredentials } from "./auth.actions";


export interface AuthState {
    accessToken: string | null;
}

//create an initail state 
export const initialState: AuthState = {
    accessToken: null,
};

export const authReducer = createReducer(initialState,
    on(setCredentials, (state, { accessToken }) => ({ ...state, accessToken: accessToken }))
);