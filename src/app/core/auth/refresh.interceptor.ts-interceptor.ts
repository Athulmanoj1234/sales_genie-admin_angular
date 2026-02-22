import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AuthState } from '../../features/store/auth.redcuer';
import { inject, Signal } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, tap } from 'rxjs';
import { AuthServiceTs } from './auth.service.ts';
import { RefreshResponse } from './auth.model';
import { setCredentials } from '../../features/store/auth.actions';

function addTokenHeader(request: HttpRequest<any>, token: string | null) {
  return request.clone({
    headers: request.headers.set('Authorization', 'Bearer ' + token),
  });
}

const isRefreshing$ = new BehaviorSubject<boolean>(false);

const urlsToInclude = ["AdminAuth/Register", "AdminAuth/Login", "AdminAuth/Refresh", "AdminAuth/logout"];

const canInterceptorUsedWithUrl = (requestUrl: string): boolean => {
  //first we need to take the url part after the api/ 
   // for that we need to get the position
  const urlAfterPart: string = 'api/';
  const position: number = requestUrl.indexOf(urlAfterPart);
  //if the postion greater than  0 then we can assume that api/ sttring is not at the first position and api/ is not present at the url 
  if (position > 0) {
    //then take the url part after the api/ string
    const partAfterApiAndurl: string = requestUrl.substring(position + urlAfterPart.length);
    //now we are chekcing the request url part aftter api with each to be discluded endpoints
    for (let url of urlsToInclude) {
      if (new RegExp(url).test(partAfterApiAndurl)) {
        return false;
      }
    }
  }
  return true;
}

export const refreshInterceptorTsInterceptor: HttpInterceptorFn = (req, next) => {

  const authStore: Store<{ auth: AuthState }> = inject(Store);
  const authService = inject(AuthServiceTs);

  const authState: Signal<AuthState> = authStore.selectSignal(state => state.auth);

  if (canInterceptorUsedWithUrl(req.url)) {
    return next(addTokenHeader(req, authState()?.accessToken)).pipe(catchError((error) => { //we are returning next with modified request
    const isError = error instanceof HttpErrorResponse;
    const isError401 = error.status === 401;

    if (isError && isError401) {
      if (!isRefreshing$.getValue()) {  //execute the block only if isRefreshing becomes current subject or state is true
        isRefreshing$.next(true); // then refresh token logic execution starts
        return authService.refresh().pipe(
          tap((response: any) => {  //pipe and tap the refresh response it does not change the reponse and reponse data and it only reads the data in response.
            isRefreshing$.next(false);
            authStore.dispatch(setCredentials({ accessToken: response?.accessToken }));
          }),
          switchMap((response: RefreshResponse) => {  //re runs the interceptors from the begining if there is any other interceptors or it will run this interceptor for the request and noe request body is modified by access token
            const accessToken = authState()?.accessToken;
            return next(addTokenHeader(req, accessToken))
          }),
          catchError((err: HttpErrorResponse) => {
            console.log(err.message);
            throw err;
          })
        )
      }
      return isRefreshing$.pipe(
        filter((is) => !is),  //behaiviour subject waits until the subject satisfies the condition in here it is subject is to be false
        take(1), //takes 1 value of the subject ie in here it will take first false
        switchMap(() => {  // again modifies the request and execute interceptor from the begining
          const accessToken = authState()?.accessToken;
          return next(addTokenHeader(req, accessToken))
        })
      )
    }
    throw error;
  }))
  }
  return next(req);

};

// if there are five requests

// Time 0:
// A B C D E → 401

// Time 1:
// A → starts refresh
// B C D E → waiting

// Time 2:
// Refresh success
// isRefreshing$ = false

// Time 3:
// B C D E → switchMap() runs
// All retry original request

// A → calls refresh API
// Backend → generates new accessToken
// A → saves token in store
// B,C,D,E → read from store



// What Happens Internally
// 🥇 First Request (A)

// It enters this block:

// if (!isRefreshing$.getValue())

// Since isRefreshing$ = false initially,

// 👉 It becomes the refresh leader

// It does:

// isRefreshing$.next(true)

// Then:

// authService.refresh()

// Now refresh API is running.

// 🥈 Other 4 Requests (B, C, D, E)

// When they reach:

// if (!isRefreshing$.getValue())

// Now isRefreshing$ = true

// So they DO NOT call refresh.

// Instead they go here:

// return isRefreshing$.pipe(
//   filter((is) => !is),
//   take(1),
//   switchMap(() => {

// They are now:

// 🧍🧍🧍🧍 Standing in a queue waiting for refresh to finish

// 🔄 Now Refresh Finishes

// Inside the first request:

// tap(() => {
//   isRefreshing$.next(false)
// })

// Boom 💥

// isRefreshing$ becomes false

// 🚀 What Happens Next?

// All waiting requests were doing:

// filter((is) => !is)

// Now isRefreshing$ emits false.

// So:

// B wakes up

// C wakes up

// D wakes up

// E wakes up

// All of them pass the filter.

// Then because of:

// take(1)

// They each take that one false value and stop listening.

// 🔁 Then Their switchMap() Runs

// Each waiting request runs:

// switchMap(() => {
//   const accessToken = authState()?.accessToken;
//   return next(addTokenHeader(req, accessToken))
// })

// This means:

// ✅ They retry their own original request
// ✅ With the new token
// ✅ Using updated store value

// ⚡ Important Clarification

// You asked:

// After the first interceptor finishes, do the other 4 switchMap requests execute?

// 👉 YES. Exactly.

// When refresh finishes and isRefreshing$ becomes false:

// All 4 waiting observables resume,
// and their switchMap() executes,
// retrying their original HTTP calls.
