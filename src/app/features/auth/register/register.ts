import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, minLength, required, submit } from '@angular/forms/signals';
import { catchError } from 'rxjs';

export interface RegisterData {
  adminEmail: string;
  adminPassword: string;
}

@Component({
  selector: 'app-register',
  imports: [FormField],
  standalone: true,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  
  adminRegisterModel = signal<RegisterData>({
    adminEmail: "",
    adminPassword: "",
  });

  private http = inject(HttpClient);

  registerForm = form(this.adminRegisterModel, (schemaPath) => {  // when we call this line Angular gives you a special object called schemaPath. the schema path object This object represents the structure (schema) of your model.
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

  adminRegister(e: Event) {
    e.preventDefault();
    submit(this.registerForm, async () => {
      const registerDetails = this.adminRegisterModel();
      this.http.post('http://localhost:5122/api/AdminAuth/Register', registerDetails)
        .pipe(catchError((error: Error) => {
          console.log("error in admin register", error.message);
          throw error;
        }))
        .subscribe(response => console.log("response data:", response));
    });
  }
}
