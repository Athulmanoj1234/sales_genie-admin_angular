import { createAction, props } from "@ngrx/store";

export const setCredentials = createAction('[Home Component] SetCredential', props<{ accessToken: string | null }>()); //this argument for setCredential is the unique identifier or key for the action
