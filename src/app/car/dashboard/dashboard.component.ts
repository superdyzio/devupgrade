import { Component } from '@angular/core';
import { CarService } from '../car.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(public car: CarService) { }
}
