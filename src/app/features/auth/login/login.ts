import { HttpClient } from '@angular/common/http';
import { Component, inject, Signal, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { catchError } from 'rxjs';
import { AuthState } from '../../store/auth.redcuer';
import { setCredentials } from '../../store/auth.actions';


export interface LoginResponse {
  data: {
    adminAccessToken: string | null;
  }
}

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly store: Store<{ auth: AuthState }> = inject(Store);
  authState: Signal<AuthState> = this.store.selectSignal((state) => state.auth);

  adminData: FormGroup = new FormGroup({
    adminEmail: new FormControl(""),
    adminPassword: new FormControl("")
  });

  private http = inject(HttpClient);

  adminLogin(e: Event) {
    e.preventDefault();
    console.log("the register form data:", this.adminData.value);

    this.http.post<LoginResponse>("http://localhost:5122/api/AdminAuth/Login", this.adminData.value, {
      withCredentials: true,
    })
      .pipe(catchError((error: Error) => {
        console.log("error in admin register", error.message);
        throw error;
      }))
      .subscribe(response => {
        this.store.dispatch(setCredentials({ accessToken: response?.data?.adminAccessToken }));
        console.log(response?.data?.adminAccessToken);
        console.log("auth state", this.authState());
      });
  }

}
