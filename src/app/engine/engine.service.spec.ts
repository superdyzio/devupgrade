import { TestBed } from '@angular/core/testing';

import { EngineService } from './engine.service';
import { PedalsService } from '../pedals/pedals.service';
import { BehaviorSubject } from 'rxjs';
import { MIN_RPM } from '../constants';

// tslint:disable:no-string-literal
describe('EngineService', () => {
  const pedalStateSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  let setCurrentRpmSpy;
  let service: EngineService;
  let pedalsMock: jasmine.SpyObj<PedalsService>;

  beforeEach(() => {
    pedalsMock = {
      ...jasmine.createSpyObj('PedalsService', ['arePedalsReleased']),
      pedalsState$: pedalStateSubject.asObservable()
    };

    TestBed.configureTestingModule({
      providers: [
        EngineService,
        {provide: PedalsService, useValue: pedalsMock},
      ]
    });
    TestBed.configureTestingModule({});
    service = TestBed.inject(EngineService);

    // @ts-ignore
    setCurrentRpmSpy = spyOn(service, 'setCurrentRpm');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('turnOn', () => {
    it('should call setCurrentRpm with params', () => {
      service.turnOn();

      expect(setCurrentRpmSpy).toHaveBeenCalledWith(MIN_RPM);
    });

    it('should set isWorking to true', () => {
      service.turnOn();

      expect(service['isWorking']).toBe(true);
    });
  });

  describe('turnOff', () => {
    it('should call setCurrentRpm with params', () => {
      service.turnOff();

      expect(setCurrentRpmSpy).toHaveBeenCalledWith(0);
    });

    it('should set isWorking to false', () => {
      service.turnOff();

      expect(service['isWorking']).toBe(false);
    });
  });

  describe('engineBrake', () => {
    it('should call setCurrentRpm with params', () => {
      service['setCurrentRpm'](700);

      service.engineBrake();

      expect(setCurrentRpmSpy).toHaveBeenCalledWith(500);
    });

    it('should call setCurrentRpm with params', () => {
      service['setCurrentRpm'](500);

      service.engineBrake();

      expect(setCurrentRpmSpy).toHaveBeenCalledWith(500);
    });
  });

  describe('handleGearIncreased', () => {
    it('should call setCurrentRpm with params', () => {
      service['currentRpmSubject'].next(700);

      service.handleGearIncreased();

      expect(setCurrentRpmSpy).toHaveBeenCalledWith(350);
    });
  });

  describe('handleGearDecreased', () => {
    it('should call setCurrentRpm with params', () => {
      service['currentRpmSubject'].next(700);

      service.handleGearDecreased();

      expect(setCurrentRpmSpy).toHaveBeenCalledWith(910);
    });
  });
});
