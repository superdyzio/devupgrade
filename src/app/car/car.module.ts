import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineModule } from '../engine/engine.module';
import { GearboxModule } from '../gearbox/gearbox.module';
import { LightsModule } from '../lights/lights.module';
import { PaddlesModule } from '../paddles/paddles.module';
import { PedalsModule } from '../pedals/pedals.module';
import { TrailerModule } from '../trailer/trailer.module';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
    declarations: [DashboardComponent],
    exports: [
        DashboardComponent
    ],
    imports: [
        CommonModule,
        EngineModule,
        GearboxModule,
        LightsModule,
        PaddlesModule,
        PedalsModule,
        TrailerModule
    ]
})
export class CarModule { }
