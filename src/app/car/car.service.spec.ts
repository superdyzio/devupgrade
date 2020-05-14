import { TestBed } from '@angular/core/testing';
import { filter, switchMap, tap } from 'rxjs/operators';

import { CarService } from './car.service';
import { EngineService } from '../engine/engine.service';
import { GearboxService } from '../gearbox/gearbox.service';
import { LeftPaddleService } from '../paddles/left-paddle.service';
import { RightPaddleService } from '../paddles/right-paddle.service';
import { PedalsService } from '../pedals/pedals.service';
import { GearboxAggressionLevel, GearboxMode, GearboxPosition } from '../enums';
import { AGGRESSION_MULTIPLIER_MAP, GEARBOX_CHARACTERISTICS, MAX_RPM, MIN_RPM } from '../constants';

describe('CarService', () => {
  let car: CarService;

  describe('car e2e', () => {
    let engine: EngineService;
    let gearbox: GearboxService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          CarService,
          EngineService,
          GearboxService,
          LeftPaddleService,
          RightPaddleService,
          PedalsService,
        ]
      });
      car = TestBed.inject(CarService);
      engine = TestBed.inject(EngineService);
      gearbox = TestBed.inject(GearboxService);
    });

    it('set Drive -> set Eco -> full speed -> full brake -> turn off', (done) => {
      engine.currentRpm$
        .pipe(
          filter(rpm => rpm === MAX_RPM),
          tap(rpm => expect(rpm).toEqual(MAX_RPM)),
          tap(() => car.handlePedalsChange(-1)),
          switchMap(() => engine.currentRpm$),
          filter(rpm => rpm === MIN_RPM),
          tap(rpm => expect(rpm).toEqual(MIN_RPM)),
          tap(() => car.setPositionToParking()),
          switchMap(() => engine.currentRpm$),
          filter(rpm => rpm === 0),
          tap(rpm => expect(rpm).toEqual(0)),
        )
        .subscribe(() => {
          expect(gearbox.gearboxStatus.position).toEqual(GearboxPosition.Parking);
          done();
        });

      car.setPositionToDrive();
      car.setModeToEco();
      car.handlePedalsChange(1);
    }, 30000);

    // todo: fix broken tests
    xit('set Reverse -> full speed -> engine brake -> turn off', (done) => {
      engine.currentRpm$
        .pipe(
          filter(rpm => rpm === MAX_RPM),
          tap(rpm => expect(rpm).toEqual(MAX_RPM)),
          tap(() => car.handlePedalsChange(0)),
          switchMap(() => engine.currentRpm$),
          filter(rpm => rpm === MIN_RPM),
          tap(rpm => expect(rpm).toEqual(MIN_RPM)),
          switchMap(() => engine.currentRpm$),
          tap(() => car.setPositionToParking()),
          filter(rpm => rpm === 0),
          tap(rpm => expect(rpm).toEqual(0)),
          filter(() => gearbox.gearboxStatus.position === GearboxPosition.Parking)
        )
        .subscribe(() => {
          expect(gearbox.gearboxStatus.position).toEqual(GearboxPosition.Parking);
          done();
        });

      car.setPositionToReverse();
      car.handlePedalsChange(1);
    }, 30000);

    xit('set Neutral -> set Parking', (done) => {
      engine.currentRpm$
        .pipe(
          filter(rpm => rpm === MIN_RPM),
          tap(rpm => expect(rpm).toEqual(MIN_RPM)),
          tap(() => car.setPositionToParking()),
          switchMap(() => engine.currentRpm$),
          filter(rpm => rpm === 0),
          tap(rpm => expect(rpm).toEqual(0)),
          filter(() => gearbox.gearboxStatus.position === GearboxPosition.Parking)
        )
        .subscribe(() => {
          expect(gearbox.gearboxStatus.position).toEqual(GearboxPosition.Parking);
          done();
        });

      car.setPositionToNeutral();
    }, 30000);

    xit('set Drive -> check kickdown', (done) => {
      gearbox.gearboxStatus$
        .pipe(
          filter(gearboxStatus => gearboxStatus.currentGear === 3),
          tap(() => car.handlePedalsChange(1)),
          switchMap(() => gearbox.gearboxStatus$),
          filter(gearboxStatus => gearboxStatus.currentGear === 2),
          tap(gearboxStatus => expect(gearboxStatus.currentGear).toEqual(2)),
        )
        .subscribe(() => {
          expect(gearbox.gearboxStatus.position).toEqual(GearboxPosition.Drive);
          done();
        });

      car.setPositionToDrive();
      car.setModeToComfort();
      car.handlePedalsChange(0.5);
    }, 30000);

    it('set Drive -> set Sport -> check double kickdown', (done) => {
      gearbox.gearboxStatus$
        .pipe(
          filter(gearboxStatus => gearboxStatus.currentGear === 4),
          tap(() => car.handlePedalsChange(1)),
          switchMap(() => gearbox.gearboxStatus$),
          filter(gearboxStatus => gearboxStatus.currentGear === 2),
          tap(gearboxStatus => expect(gearboxStatus.currentGear).toEqual(2)),
        )
        .subscribe(() => {
          expect(gearbox.gearboxStatus.position).toEqual(GearboxPosition.Drive);
          done();
        });

      car.setPositionToDrive();
      car.setModeToSport();
      car.handlePedalsChange(0.5);
    }, 30000);

    it('set Drive -> set Sport -> check second aggression level', (done) => {
      engine.currentRpm$
        .pipe(
          filter(rpm => rpm > GEARBOX_CHARACTERISTICS[GearboxMode.Sport].throttle.increaseGearRpmLevel
            * AGGRESSION_MULTIPLIER_MAP[GearboxMode.Sport][GearboxAggressionLevel.Medium]
          ),
        )
        .subscribe(() => {
          expect(gearbox.gearboxStatus.position).toEqual(GearboxPosition.Drive);
          done();
        });

      car.setPositionToDrive();
      car.setModeToSport();
      car.setAggressionLevelToMedium();
      car.handlePedalsChange(1);
    }, 30000);

    it('set Drive -> set Sport -> check third aggression level', (done) => {
      engine.currentRpm$
        .pipe(
          filter(rpm => rpm > GEARBOX_CHARACTERISTICS[GearboxMode.Sport].throttle.increaseGearRpmLevel
            * AGGRESSION_MULTIPLIER_MAP[GearboxMode.Sport][GearboxAggressionLevel.High]
          ),
        )
        .subscribe(() => {
          expect(gearbox.gearboxStatus.position).toEqual(GearboxPosition.Drive);
          done();
        });

      car.setPositionToDrive();
      car.setModeToSport();
      car.setAggressionLevelToMedium();
      car.handlePedalsChange(1);
    }, 30000);
  });
});
