import { AfterContentInit, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import * as go from 'gojs';
import { Subscription } from 'rxjs';

import { CarService } from '../car.service';
import { GEARBOX_GEAR_SYMBOL_MAP } from '../../constants';
import { filter } from 'rxjs/operators';
import { GearboxAggressionLevel } from '../../enums';
import { GearboxStatus } from '../../interfaces';

let diagram: go.Diagram;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnDestroy, AfterContentInit {
  public nodes = [{key: 'RPM', value: 0}];
  public rpm: number;
  public gear: number | string;
  public isCarStopped: boolean;
  public allowManualGearChange: boolean;
  public allowAggressionLevelChange: boolean;
  public showFire: boolean;
  public options = {
    floor: -1,
    ceil: 1,
    step: 0.1,
    translate: value => value === -1 ? 'Brake' : (value === 1 ? 'Throttle' : `${value}`),
  };
  public value = 0;

  private dashboardDataSubscription: Subscription;
  private previousGear: number;

  constructor(public car: CarService) {
  }

  public ngAfterContentInit() {
    this.dashboardDataSubscription = this.car.dashboardData$
      .pipe(filter(() => !!diagram))
      .subscribe(([gearboxStatus, rpm]: [GearboxStatus, number]) => {
        this.setVariables(rpm, gearboxStatus);
        this.handleFire(gearboxStatus);
        this.handleDiagramChange(rpm);
      });
  }

  public ngOnDestroy() {
    this.dashboardDataSubscription.unsubscribe();
  }

  public initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;
    const convertValueToAngle = (v, shape) => {
      const scale = shape.part.findObject('SCALE');
      const p = scale.graduatedPointForValue(v);
      const part = shape.part.findObject('SHAPE');
      const c = part.actualBounds.center;
      return c.directionPoint(p);
    };

    diagram = $(
      go.Diagram,
      {model: $(go.GraphLinksModel, {linkKeyProperty: 'key'})}
    );

    diagram.nodeTemplate = $(
      go.Node,
      'Auto',
      $(
        go.Shape,
        'Circle',
        {stroke: 'orange', strokeWidth: 5, spot1: go.Spot.TopLeft, spot2: go.Spot.BottomRight},
        new go.Binding('stroke', 'color')
      ),
      $(
        go.Panel,
        'Spot',
        $(
          go.Panel,
          'Graduated',
          {
            name: 'SCALE',
            margin: 14,
            graduatedTickUnit: 500,
            graduatedMax: 8000,
            stretch: go.GraphObject.None
          },
          new go.Binding('graduatedMax', 'max'),
          $(
            go.Shape,
            {
              name: 'SHAPE',
              geometryString: 'M-70.7 70.7 B135 270 0 0 100 100 M0 100',
              stroke: 'white',
              strokeWidth: 4
            }
          ),
          $(go.Shape, {geometryString: 'M0 0 V10', stroke: 'white', strokeWidth: 1.5}),
          $(go.Shape, {geometryString: 'M0 0 V12', stroke: 'white', strokeWidth: 2.5, interval: 2}),
          $(go.Shape, {geometryString: 'M0 0 V15', stroke: 'white', strokeWidth: 3.5, interval: 4}),
          $(go.TextBlock,
            {
              interval: 4,
              alignmentFocus: go.Spot.Center,
              font: 'bold italic 14pt sans-serif',
              stroke: 'white',
              segmentOffset: new go.Point(0, 30)
            })
        ),
        $(
          go.TextBlock,
          {alignment: new go.Spot(0.5, 0.9), stroke: 'orange', font: 'bold italic 14pt sans-serif'},
          new go.Binding('text', 'key'),
          new go.Binding('stroke', 'color')
        ),
        $(
          go.Shape,
          {fill: 'red', strokeWidth: 0, geometryString: 'F1 M-6 0 L0 -6 100 0 0 6z x M-100 0'},
          new go.Binding('angle', 'value', convertValueToAngle)
        ),
        $(go.Shape, 'Circle', {width: 2, height: 2, fill: '#444'})
      )
    );

    return diagram;
  }

  private setVariables(rpm: number, gearboxStatus: GearboxStatus) {
    this.rpm = rpm;
    this.gear = GEARBOX_GEAR_SYMBOL_MAP[gearboxStatus.position] || gearboxStatus.currentGear;
    this.allowManualGearChange = gearboxStatus.allowManualGearChange;
    this.allowAggressionLevelChange = gearboxStatus.allowAggressionLevelChange;
    this.isCarStopped = this.car.isCarStopped();
  }

  private handleFire(gearboxStatus: GearboxStatus) {
    if (this.shouldShootFire(gearboxStatus)) {
      this.shootFire();
    }
    this.previousGear = gearboxStatus.currentGear;
  }

  private handleDiagramChange(rpm: number) {
    diagram.startTransaction();
    diagram.nodes.each(node => {
      const scale: any = node.findObject('SCALE');
      if (scale === null || scale.type !== go.Panel.Graduated) {
        return;
      }
      diagram.model.setDataProperty(node.data, 'value', rpm);
    });
    diagram.commitTransaction();
  }

  private shouldShootFire(gearboxStatus: GearboxStatus) {
    return gearboxStatus.aggressionLevel === GearboxAggressionLevel.High
      && this.previousGear && this.previousGear + 1 === gearboxStatus.currentGear;
  }

  private shootFire(): void {
    this.showFire = true;
    setTimeout(() => {
      this.showFire = false;
    }, 750);
  }
}
