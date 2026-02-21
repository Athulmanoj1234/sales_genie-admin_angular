import { HttpClient } from '@angular/common/http';
import { Component, inject, Signal, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { catchError } from 'rxjs';
import { AuthState } from '../../store/auth.redcuer';
import { setCredentials } from '../../store/auth.actions';
import { email, form, minLength, required, FormField, submit } from '@angular/forms/signals';


export interface LoginResponse {
  data: {
    adminAccessToken: string | null;
  }
}

export interface LoginData {
  adminEmail: string;
  adminPassword: string;
}

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, FormField],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly store: Store<{ auth: AuthState }> = inject(Store);
  authState: Signal<AuthState> = this.store.selectSignal((state) => state.auth);

  // adminData: FormGroup = new FormGroup({
  //   adminEmail: new FormControl(""),
  //   adminPassword: new FormControl("")
  // });

  adminLoginModel = signal<LoginData>({
    adminEmail: "",
    adminPassword: "",
  });

  private http = inject(HttpClient);

  // now we are defining the login form 
  loginForm = form(this.adminLoginModel, (schemaPath) => {  // when we call this line Angular gives you a special object called schemaPath. the schema path object This object represents the structure (schema) of your model.
    // If your model is:
    //    loginModel = {
    //      email: '',
    //      password: ''
    //    };
    // Then:
    //    schemaPath.email
    //    schemaPath.password
    required(schemaPath.adminEmail, { message: "Admin Email is required" });  // the schema functions like required() are called schema validation functions.
    // They are functions that:
    // Attach validation rules
    // Work on schema paths
    // Configure validation at the form-structure level
    email(schemaPath.adminEmail, { message: "please enter a valid email address" });
    required(schemaPath.adminPassword, { message: "Admin Password is required" });
    minLength(schemaPath.adminPassword, 5, { message: "password atleast of 5 characters" });
  });

  adminLogin(e: Event) {
    e.preventDefault();
    submit(this.loginForm, async () => {
      // Because submit() needs to:
      // Validate the form 
      // Mark all fields as touched
      // Stop execution if form is invalid
      // Only run your async function if the form is valid
      const loginDetails = this.adminLoginModel(); //the model signal will be already updated
      this.http.post<LoginResponse>("http://localhost:5122/api/AdminAuth/Login", loginDetails, {
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
    });
  }

}
