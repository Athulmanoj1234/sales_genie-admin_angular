import { Component } from '@angular/core';
import { Sidebar } from '../component/sidebar/sidebar';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, RouterLink, Sidebar],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {

}
