import { async, TestBed } from '@angular/core/testing';

import { GearboxService } from './gearbox.service';
import { EngineService } from '../engine/engine.service';
import { PedalsService } from '../pedals/pedals.service';
import { BehaviorSubject } from 'rxjs';
import { GearboxAggressionLevel, GearboxMode, GearboxPosition } from '../enums';

// tslint:disable:no-string-literal
fdescribe('GearboxService', () => {
  const engineCurrentRpmSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  const pedalStateSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  let service: GearboxService;
  let engineMock: jasmine.SpyObj<EngineService>;
  let pedalsMock: jasmine.SpyObj<PedalsService>;

  beforeEach(async(() => {
    engineMock = {
      ...jasmine.createSpyObj(
        'EngineService',
        ['handleGearIncreased', 'handleGearDecreased', 'handleEngineBreak']
      ),
      currentRpm$: engineCurrentRpmSubject.asObservable()
    };
    pedalsMock = {
      ...jasmine.createSpyObj('PedalsService', ['arePedalsReleased']),
      pedalsState$: pedalStateSubject.asObservable()
    };

    TestBed.configureTestingModule({
      providers: [
        GearboxService,
        {provide: EngineService, useValue: engineMock},
        {provide: PedalsService, useValue: pedalsMock},
      ]
    });
    service = TestBed.inject(GearboxService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  describe('handleGearboxPositionChange', () => {
    it('should call gearbox.setGearboxPosition with parameters', () => {
      const spy = spyOn(service['gearbox'], 'setGearboxPosition');

      service.handleGearboxPositionChange(GearboxPosition.Neutral);

      expect(spy).toHaveBeenCalledWith(GearboxPosition.Neutral);
    });
  });

  describe('handleGearboxModeChange', () => {
    it('should call gearbox.setGearboxMode with parameters', () => {
      const spy = spyOn(service['gearbox'], 'setGearboxMode');

      service.handleGearboxModeChange(GearboxMode.Sport);

      expect(spy).toHaveBeenCalledWith(GearboxMode.Sport);
    });
  });

  describe('handleGearboxAggressionLevelChange', () => {
    it('should call gearbox.setGearboxAggressionLevel with parameters', () => {
      const spy = spyOn(service['gearbox'], 'setGearboxAggressionLevel');

      service.handleGearboxAggressionLevelChange(GearboxAggressionLevel.High);

      expect(spy).toHaveBeenCalledWith(GearboxAggressionLevel.High);
    });
  });

  describe('increaseGearManually', () => {

    it('should call engine.handleGearIncreased', () => {
      service['gearbox'].position = GearboxPosition.Drive;
      service['gearbox'].currentGear = 2;

      service.increaseGearManually();

      expect(engineMock.handleGearIncreased).toHaveBeenCalled();
    });

    it('should not call engine.handleGearIncreased if gear is max', () => {
      service['gearbox'].position = GearboxPosition.Drive;
      service['gearbox'].currentGear = service['gearbox'].maxGear;

      service.increaseGearManually();

      expect(engineMock.handleGearIncreased).not.toHaveBeenCalled();
    });

    it('should not call engine.handleGearIncreased if position is not DRIVE', () => {
      service['gearbox'].position = GearboxPosition.Parking;

      service.increaseGearManually();

      expect(engineMock.handleGearIncreased).not.toHaveBeenCalled();
    });
  });

  describe('decreaseGearManually', () => {

    it('should call engine.handleGearDecreased', () => {
      service['gearbox'].position = GearboxPosition.Drive;
      service['gearbox'].currentGear = 2;

      service.decreaseGearManually();

      expect(engineMock.handleGearDecreased).toHaveBeenCalled();
    });

    it('should not call engine.handleGearDecreased if gear is 1', () => {
      service['gearbox'].position = GearboxPosition.Drive;
      service['gearbox'].currentGear = 1;

      service.decreaseGearManually();

      expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
    });

    it('should not call engine.handleGearDecreased if position is not DRIVE', () => {
      service['gearbox'].position = GearboxPosition.Reverse;

      service.decreaseGearManually();

      expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
    });
  });

  describe('setKickdownFlags', () => {

    it('should set isKickdown to false if Eco', () => {
      service['gearbox'].mode = GearboxMode.Eco;

      service['setKickdownFlags'](1);

      expect(service['isKickdown']).toBe(false);
    });

    it('should set isKickdown to false if Comfort and if not kickdown', () => {
      service['gearbox'].mode = GearboxMode.Comfort;

      service['setKickdownFlags'](0.4);

      expect(service['isKickdown']).toBe(false);
    });

    it('should set isKickdown to true if Comfort and if kickdown', () => {
      service['gearbox'].mode = GearboxMode.Comfort;

      service['setKickdownFlags'](0.6);

      expect(service['isKickdown']).toBe(true);
    });

    it('should set isKickdown to false if Sport and if not kickdown', () => {
      service['gearbox'].mode = GearboxMode.Sport;

      service['setKickdownFlags'](0.4);

      expect(service['isKickdown']).toBe(false);
    });

    it('should set isKickdown to true if Sport and if 1st level kickdown', () => {
      service['gearbox'].mode = GearboxMode.Sport;

      service['setKickdownFlags'](0.6);

      expect(service['isKickdown']).toBe(true);
    });


    it('should set isKickdown to true if Sport and if 2nd level kickdown', () => {
      service['gearbox'].mode = GearboxMode.Sport;

      service['setKickdownFlags'](0.9);

      expect(service['isKickdown']).toBe(true);
    });

    it('should set kickdownDecreaseCounter to 1 if Comfort and if kickdown', () => {
      service['gearbox'].mode = GearboxMode.Comfort;

      service['setKickdownFlags'](0.6);

      expect(service['kickdownDecreaseCounter']).toBe(1);
    });

    it('should set kickdownDecreaseCounter to 1 if Sport and if 1st level kickdown', () => {
      service['gearbox'].mode = GearboxMode.Sport;

      service['setKickdownFlags'](0.6);

      expect(service['kickdownDecreaseCounter']).toBe(1);
    });

    it('should set kickdownDecreaseCounter to 2 if Sport and if 2nd level kickdown', () => {
      service['gearbox'].mode = GearboxMode.Sport;

      service['setKickdownFlags'](0.9);

      expect(service['kickdownDecreaseCounter']).toBe(2);
    });

  });

  // describe('eco mode', () => {
  //
  //   it('should', done => {
  //     // arrange
  //     // mocki, definiowanie co ma być zwrócone itp.
  //     pedalsMock.arePedalsReleased.and.returnValue(true);
  //     const isPositionDriveSpy = spyOn(service['gearbox'], 'isPositionDrive');
  //     isPositionDriveSpy.and.returnValue(true);
  //     // @ts-ignore
  //     spyOn(service, 'setKickdownFlags');
  //     service['kickdownDecreaseCounter'] = 2;
  //
  //     // act
  //     // akcje
  //
  //     pedalsMock.pedalState$.pipe(take(1)).subscribe(() => {
  //       console.log('duoa');
  //       expect(service['setKickdownFlags']).toHaveBeenCalledTimes(1);
  //       expect(service['setKickdownFlags']).toHaveBeenCalledWith(0.5);
  //       done();
  //     });
  //     pedalStateSubject.next(0.5);
  //
  //     // assert
  //
  //     // sprawdzenia (zarówno liczba jak i argumenty wywołań)
  //   });
  // });
});
