import { async, TestBed } from '@angular/core/testing';

import { GearboxService } from './gearbox.service';
import { EngineService } from '../engine/engine.service';
import { PedalsService } from '../pedals/pedals.service';
import { BehaviorSubject } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { GearboxPosition } from './gearbox';

// tslint:disable:no-string-literal
describe('GearboxService', () => {
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
      pedalState$: pedalStateSubject.asObservable()
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

  xdescribe('eco mode', () => {

    it('should', done => {
      // arrange
      // mocki, definiowanie co ma być zwrócone itp.
      pedalsMock.arePedalsReleased.and.returnValue(true);
      const isPositionDriveSpy = spyOn(service['gearbox'], 'isPositionDrive');
      isPositionDriveSpy.and.returnValue(true);
      // @ts-ignore
      spyOn(service, 'setKickdownFlags');
      service['kickdownDecreaseCounter'] = 2;

      // act
      // akcje

      pedalsMock.pedalState$.pipe(take(1)).subscribe(() => {
        console.log('duoa');
        expect(service['setKickdownFlags']).toHaveBeenCalledTimes(1);
        expect(service['setKickdownFlags']).toHaveBeenCalledWith(0.5);
        done();
      });
      pedalStateSubject.next(0.5);

      // assert
      // sprawdzenia (zarówno liczba jak i argumenty wywołań)
    });
  });
});
