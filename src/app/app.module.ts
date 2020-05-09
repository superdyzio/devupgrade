import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CarModule } from './car/car.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CarModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
