import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  adminData: FormGroup = new FormGroup({
    adminEmail: new FormControl(""),
    adminPassword: new FormControl("")
  });

  private http = inject(HttpClient);

  adminRegister(e: Event) {
    e.preventDefault();
    console.log("the register form data:", this.adminData.value);
   
    this.http.post('http://localhost:5122/api/AdminAuth/Register', this.adminData.value)
      .pipe(catchError((error: Error) => {
        console.log("error in admin register", error.message);
        throw error;
    }))
      .subscribe(response => console.log("response data:", response));
  }

}
