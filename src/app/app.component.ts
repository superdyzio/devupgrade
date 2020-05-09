import { Component } from '@angular/core';
import { CarService } from './car/car.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public car: CarService) { }

  public handleGearboxPositionChange(): void {

  }

  public handleGearboxModeChange(): void {

  }

  public handleGearboxAggressionLevelChange(): void {

  }

  public handleThrottle(): void {

  }

  public handleBrake(): void {

  }

  public handleLeftPaddle(): void {
    this.car.pushLeftPaddle();
  }

  public handleRightPaddle(): void {
    this.car.pushRightPaddle();
  }

  public connectTrailer(): void {

  }

  public disconnectTrailer(): void {

  }
}
