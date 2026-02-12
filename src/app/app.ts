import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Sidebar } from "./shared/component/sidebar/sidebar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sales_genie_admin');
}
