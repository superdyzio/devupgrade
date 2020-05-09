import { Injectable } from '@angular/core';
import { LeftPaddleService } from '../paddles/left-paddle.service';
import { RightPaddleService } from '../paddles/right-paddle.service';

@Injectable({
  providedIn: 'root'
})
export class CarService {

  constructor(
    private leftPaddle: LeftPaddleService,
    private rightPaddle: RightPaddleService
  ) { }

  public pushLeftPaddle(): void {
    this.leftPaddle.push();
  }

  public pushRightPaddle(): void {
    this.rightPaddle.push();
  }
}
