import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-auth',
  imports: [],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  private http = inject(HttpClient)
  
  refresh() {
    this.http.get('')
  }
}
