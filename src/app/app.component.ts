import { Component } from '@angular/core';
import { CarService } from './car/car.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public car: CarService) { }
}
