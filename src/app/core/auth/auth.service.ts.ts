import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, Observable } from 'rxjs';
import { AuthState } from '../../features/store/auth.redcuer';
import { setCredentials } from '../../features/store/auth.actions';
import { RefreshResponse } from './auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceTs {
  private http = inject(HttpClient);
  private readonly store: Store<{ auth: AuthState }> = inject(Store);
  private accessToken: null | string = null;
  private refreshResponse: RefreshResponse | null = null;

  refresh() {
    return this.http.get<RefreshResponse>("http://localhost:5122/api/AdminAuth/Refresh", { withCredentials: true });
      // .pipe(catchError((err: Error) => {
      //   throw err;
      // }))
      // .subscribe(response => {
      //   this.refreshResponse = response;
      //   this.accessToken = response?.data?.accessToken;
      //   this.store.dispatch(setCredentials({ accessToken: response?.data?.accessToken }));
      // });
  }
}
