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

export const refreshInterceptorTsInterceptor: HttpInterceptorFn = (req, next) => {

  const authStore: Store<{ auth: AuthState }> = inject(Store);
  const authService = inject(AuthServiceTs);

  const authState: Signal<AuthState> = authStore.selectSignal(state => state.auth);

  const isRefreshing$ = new BehaviorSubject<boolean>(false);

  return next(addTokenHeader(req, authState()?.accessToken)).pipe(catchError((error) => {
    const isError = error instanceof HttpErrorResponse;
    const isError401 = error.status === 401;

    if (isError && isError401) {
      if (!isRefreshing$.getValue()) {  //execute the block only if isRefreshing becomes current subject or state is true
        isRefreshing$.next(true); // then refresh token logic execution starts
        const refreshResponse = authService.refresh().pipe(
          tap((response: RefreshResponse) => {  //pipe and tap the refresh response it does not change the reponse and reponse data and it only reads the data in response.
            isRefreshing$.next(false);
            authStore.dispatch(setCredentials({ accessToken: response?.data?.accessToken }));
          }),
          switchMap((response: RefreshResponse) => {  //re runs the interceptors from the begining if there is any other interceptors or it will run this interceptor for the request and noe request body is modified by access token
            const accessToken = authState()?.accessToken;
            return next(addTokenHeader(req, accessToken))
          }),
          catchError((err: HttpErrorResponse) => {
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


};
