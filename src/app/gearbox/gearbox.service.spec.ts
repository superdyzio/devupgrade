import { async, TestBed } from '@angular/core/testing';

import { GearboxService } from './gearbox.service';
import { EngineService } from '../engine/engine.service';
import { PedalsService } from '../pedals/pedals.service';
import { BehaviorSubject } from 'rxjs';
import { GearboxAggressionLevel, GearboxMode, GearboxPosition } from '../enums';
import { GEARBOX_CHARACTERISTICS } from '../constants';

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
        ['handleGearIncreased', 'handleGearDecreased', 'handleEngineBrake', 'engineBrake', 'handleBrake']
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

  describe('gearboxStatus', () => {

    it('should return gearbox status', () => {
      const gearboxStatus = service['getCurrentGearboxStatus']();
      service['setCurrentGearboxStatus']();

      expect(service['gearboxStatus']).toEqual(gearboxStatus);
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

  describe('Eco mode', () => {
    const gearMode = GearboxMode.Eco;
    const throttleCharacteristic = GEARBOX_CHARACTERISTICS[gearMode].throttle;
    const brakeDecreaseGearRpmLevel = GEARBOX_CHARACTERISTICS[gearMode].brake.decreaseGearRpmLevel;
    const throttleDecreaseGearRpmLevel = throttleCharacteristic.decreaseGearRpmLevel;
    const throttleIncreaseGearRpmLevel = throttleCharacteristic.increaseGearRpmLevel;

    beforeEach(() => {
      service['gearbox'].mode = gearMode;
      service['gearbox'].position = GearboxPosition.Drive;
    });

    describe('handleEngineBraking', () => {
      it('should call engine.handleGearDecreased if rpm less than brake decrease level and gear is greater than 1', () => {
        service['gearbox'].currentGear = 3;
        service['handleEngineBraking'](brakeDecreaseGearRpmLevel - 1);

        expect(engineMock.handleGearDecreased).toHaveBeenCalled();
      });

      it('should call engine.engineBrake if rpm less than brake decrease level and gear is 1', () => {
        service['gearbox'].currentGear = 1;
        service['handleEngineBraking'](brakeDecreaseGearRpmLevel - 1);

        expect(engineMock.engineBrake).toHaveBeenCalled();
      });

      it('should not call engine.handleGearDecreased if rpm greater or equal then brake decrease level', () => {
        service['gearbox'].currentGear = 3;
        service['handleEngineBraking'](brakeDecreaseGearRpmLevel);

        expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
      });
    });

    describe('handleThrottle', () => {
      it('should call engine.handleGearIncreased if rpm greater or equal than throttle increase level and gear is less than max', () => {
        service['gearbox'].currentGear = 3;
        service['handleThrottle'](throttleIncreaseGearRpmLevel);

        expect(engineMock.handleGearIncreased).toHaveBeenCalled();
      });

      it('should call engine.handleGearDecreased if rpm less than throttle decrease level and gear is greater than 1', () => {
        service['gearbox'].currentGear = 3;
        service['handleThrottle'](throttleDecreaseGearRpmLevel - 1);

        expect(engineMock.handleGearDecreased).toHaveBeenCalled();
      });

      it('should not call engine.handleGearIncreased if rpm greater or equal throttle increase level and gear is max', () => {
        service['gearbox'].currentGear = service['gearbox'].maxGear;
        service['handleThrottle'](throttleIncreaseGearRpmLevel);

        expect(engineMock.handleGearIncreased).not.toHaveBeenCalled();
      });

      it('should not call engine.handleGearDecreased if rpm less than throttle decrease level and gear is 1', () => {
        service['gearbox'].currentGear = 1;
        service['handleThrottle'](throttleDecreaseGearRpmLevel);

        expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
      });
    });

    describe('handleBrake', () => {
      it('should call engine.handleGearDecreased if rpm less than brake decrease level and gear is greater than 1', () => {
        service['gearbox'].currentGear = 3;
        service['handleBrake'](brakeDecreaseGearRpmLevel - 1);

        expect(engineMock.handleGearDecreased).toHaveBeenCalled();
      });

      it('should not call engine.handleGearDecreased if rpm greater than brake decrease level and gear is greater than 1', () => {
        service['gearbox'].currentGear = 3;
        service['handleBrake'](brakeDecreaseGearRpmLevel + 1);

        expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
      });

      it('should not call engine.handleGearDecreased if rpm less than brake decrease level and gear is 1', () => {
        service['gearbox'].currentGear = 1;
        service['handleBrake'](brakeDecreaseGearRpmLevel);

        expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
      });
    });
  });

  describe('Comfort mode', () => {
    const gearMode = GearboxMode.Comfort;
    const throttleCharacteristic = GEARBOX_CHARACTERISTICS[gearMode].throttle;
    const brakeDecreaseGearRpmLevel = GEARBOX_CHARACTERISTICS[gearMode].brake.decreaseGearRpmLevel;
    const throttleDecreaseGearRpmLevel = throttleCharacteristic.decreaseGearRpmLevel;
    const throttleIncreaseGearRpmLevel = throttleCharacteristic.increaseGearRpmLevel;
    const kickdownDecreaseGearMaxRpmLevel = throttleCharacteristic.nextLevelKickdown.decreaseGearMaxRpmLevel;
    const kickdownMaxThrottleLevel = throttleCharacteristic.nextLevelKickdown.maxThrottleLevel;

    beforeEach(() => {
      service['gearbox'].mode = gearMode;
      service['gearbox'].position = GearboxPosition.Drive;
    });

    describe('handleEngineBraking', () => {
      it('should call engine.handleGearDecreased if rpm less than brake decrease level and gear is greater than 1', () => {
        service['gearbox'].currentGear = 3;
        service['handleEngineBraking'](brakeDecreaseGearRpmLevel - 1);

        expect(engineMock.handleGearDecreased).toHaveBeenCalled();
      });

      it('should call engine.engineBrake if rpm less than brake decrease level and gear is 1', () => {
        service['gearbox'].currentGear = 1;
        service['handleEngineBraking'](brakeDecreaseGearRpmLevel - 1);

        expect(engineMock.engineBrake).toHaveBeenCalled();
      });

      it('should not call engine.handleGearDecreased if rpm greater or equal then brake decrease level', () => {
        service['gearbox'].currentGear = 3;
        service['handleEngineBraking'](brakeDecreaseGearRpmLevel);

        expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
      });
    });

    describe('handleThrottle', () => {
      it('should call engine.handleGearIncreased if rpm greater or equal than throttle increase level and gear is less than max', () => {
        service['gearbox'].currentGear = 3;
        service['handleThrottle'](throttleIncreaseGearRpmLevel);

        expect(engineMock.handleGearIncreased).toHaveBeenCalled();
      });

      it('should call engine.handleGearDecreased if rpm less than throttle decrease level and gear is greater than 1', () => {
        service['gearbox'].currentGear = 3;
        service['handleThrottle'](throttleDecreaseGearRpmLevel - 1);

        expect(engineMock.handleGearDecreased).toHaveBeenCalled();
      });

      it('should not call engine.handleGearIncreased if rpm greater or equal than throttle increase level and gear is max', () => {
        service['gearbox'].currentGear = service['gearbox'].maxGear;
        service['handleThrottle'](throttleIncreaseGearRpmLevel);

        expect(engineMock.handleGearIncreased).not.toHaveBeenCalled();
      });

      it('should not call engine.handleGearDecreased if rpm less than throttle decrease level and gear is 1', () => {
        service['gearbox'].currentGear = 1;
        service['handleThrottle'](throttleDecreaseGearRpmLevel);

        expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
      });
    });

    describe('handleKickdown', () => {

      it('should call engine.handleGearDecreased if kickdownDecreaseCounter greater than 0 and rpm less or equal than kickdown decrease level and gear is greater than 1', () => {
        service['kickdownDecreaseCounter'] = 1;
        service['gearbox'].currentGear = 3;
        service['handleKickdown'](kickdownDecreaseGearMaxRpmLevel, kickdownMaxThrottleLevel);

        expect(engineMock.handleGearDecreased).toHaveBeenCalled();
      });

      it('should not call engine.handleGearDecreased if kickdownDecreaseCounter greater than 0 and rpm less or equal than kickdown decrease level and gear is 1', () => {
        service['kickdownDecreaseCounter'] = 1;
        service['gearbox'].currentGear = 1;
        service['handleKickdown'](kickdownDecreaseGearMaxRpmLevel, kickdownMaxThrottleLevel);

        expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
      });

      it('should call engine.handleGearDecreased if kickdownDecreaseCounter greater than 0 and rpm greater than kickdown decrease level and gear is greater than 1', () => {
        service['kickdownDecreaseCounter'] = 1;
        service['gearbox'].currentGear = 3;
        service['handleKickdown'](kickdownDecreaseGearMaxRpmLevel + 1, kickdownMaxThrottleLevel);

        expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
        expect(engineMock.handleGearIncreased).toHaveBeenCalled();
      });

      it('should call engine.handleGearIncreased if kickdownDecreaseCounter is 0 and rpm greater than kickdown decrease level and gear is less than max', () => {
        service['kickdownDecreaseCounter'] = 0;
        service['gearbox'].currentGear = 3;
        service['handleKickdown'](kickdownDecreaseGearMaxRpmLevel + 1, kickdownMaxThrottleLevel);

        expect(engineMock.handleGearIncreased).toHaveBeenCalled();
      });

      it('should not call engine.handleGearIncreased if kickdownDecreaseCounter is 0 and rpm greater than kickdown decrease level and gear is max', () => {
        service['kickdownDecreaseCounter'] = 0;
        service['gearbox'].currentGear = service['gearbox'].maxGear;
        service['handleKickdown'](kickdownDecreaseGearMaxRpmLevel, kickdownMaxThrottleLevel);

        expect(engineMock.handleGearIncreased).not.toHaveBeenCalled();
      });

    });

    describe('handleBrake', () => {
      it('should call engine.handleGearDecreased if rpm less than brake decrease level and gear is greater than 1', () => {
        service['gearbox'].currentGear = 3;
        service['handleBrake'](brakeDecreaseGearRpmLevel - 1);

        expect(engineMock.handleGearDecreased).toHaveBeenCalled();
      });

      it('should not call engine.handleGearDecreased if rpm greater than brake decrease level and gear is greater than 1', () => {
        service['gearbox'].currentGear = 3;
        service['handleBrake'](brakeDecreaseGearRpmLevel + 1);

        expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
      });

      it('should not call engine.handleGearDecreased if rpm less than brake decrease level and gear is 1', () => {
        service['gearbox'].currentGear = 1;
        service['handleBrake'](brakeDecreaseGearRpmLevel);

        expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
      });
    });


  });

  describe('Sport mode', () => {
    const gearMode = GearboxMode.Sport;
    const throttleCharacteristic = GEARBOX_CHARACTERISTICS[gearMode].throttle;
    const brakeDecreaseGearRpmLevel = GEARBOX_CHARACTERISTICS[gearMode].brake.decreaseGearRpmLevel;
    const throttleDecreaseGearRpmLevel = throttleCharacteristic.decreaseGearRpmLevel;
    const throttleIncreaseGearRpmLevel = throttleCharacteristic.increaseGearRpmLevel;
    const kickdownDecreaseGearMaxRpmLevel = throttleCharacteristic.nextLevelKickdown.decreaseGearMaxRpmLevel;
    const kickdownMaxThrottleLevel = throttleCharacteristic.nextLevelKickdown.maxThrottleLevel;
    const nextLevelKickdownDecreaseGearMaxRpmLevel = throttleCharacteristic.nextLevelKickdown.nextLevelKickdown.decreaseGearMaxRpmLevel;
    const nextLevelKickdownMaxThrottleLevel = throttleCharacteristic.nextLevelKickdown.nextLevelKickdown.maxThrottleLevel;

    beforeEach(() => {
      service['gearbox'].mode = gearMode;
      service['gearbox'].position = GearboxPosition.Drive;
    });

    describe('handleEngineBraking', () => {
      it('should call engine.handleGearDecreased if rpm less than brake decrease level and gear is greater than 1', () => {
        service['gearbox'].currentGear = 3;
        service['handleEngineBraking'](brakeDecreaseGearRpmLevel - 1);

        expect(engineMock.handleGearDecreased).toHaveBeenCalled();
      });

      it('should call engine.engineBrake if rpm less than brake decrease level and gear is 1', () => {
        service['gearbox'].currentGear = 1;
        service['handleEngineBraking'](brakeDecreaseGearRpmLevel - 1);

        expect(engineMock.engineBrake).toHaveBeenCalled();
      });

      it('should not call engine.handleGearDecreased if rpm greater or equal than brake decrease level', () => {
        service['gearbox'].currentGear = 3;
        service['handleEngineBraking'](brakeDecreaseGearRpmLevel);

        expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
      });
    });

    describe('handleThrottle', () => {
      it('should call engine.handleGearIncreased if rpm greater or equal than throttle increase level and gear is less than max', () => {
        service['gearbox'].currentGear = 3;
        service['handleThrottle'](throttleIncreaseGearRpmLevel);

        expect(engineMock.handleGearIncreased).toHaveBeenCalled();
      });

      it('should call engine.handleGearDecreased if rpm less than throttle decrease level and gear is greater than 1', () => {
        service['gearbox'].currentGear = 3;
        service['handleThrottle'](throttleDecreaseGearRpmLevel - 1);

        expect(engineMock.handleGearDecreased).toHaveBeenCalled();
      });

      it('should not call engine.handleGearIncreased if rpm greater or equal than throttle increase level and gear is max', () => {
        service['gearbox'].currentGear = service['gearbox'].maxGear;
        service['handleThrottle'](throttleIncreaseGearRpmLevel);

        expect(engineMock.handleGearIncreased).not.toHaveBeenCalled();
      });

      it('should not call engine.handleGearDecreased if rpm less than throttle decrease level and gear is 1', () => {
        service['gearbox'].currentGear = 1;
        service['handleThrottle'](throttleDecreaseGearRpmLevel);

        expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
      });
    });

    describe('handleKickdown', () => {

      describe('first level kickdown', () => {
        it('should call engine.handleGearDecreased if kickdownDecreaseCounter greater than 0 and rpm less or equal than kickdown decrease level and gear is greater than 1', () => {
          service['kickdownDecreaseCounter'] = 1;
          service['gearbox'].currentGear = 3;
          service['handleKickdown'](kickdownDecreaseGearMaxRpmLevel, kickdownMaxThrottleLevel);

          expect(engineMock.handleGearDecreased).toHaveBeenCalled();
        });

        it('should not call engine.handleGearDecreased if kickdownDecreaseCounter greater than 0 and rpm less or equal than kickdown decrease level and gear is 1', () => {
          service['kickdownDecreaseCounter'] = 1;
          service['gearbox'].currentGear = 1;
          service['handleKickdown'](kickdownDecreaseGearMaxRpmLevel, kickdownMaxThrottleLevel);

          expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
        });

        it('should call engine.handleGearDecreased if kickdownDecreaseCounter greater than 0 and rpm greater than kickdown decrease level and gear is greater than 1', () => {
          service['kickdownDecreaseCounter'] = 1;
          service['gearbox'].currentGear = 3;
          service['handleKickdown'](kickdownDecreaseGearMaxRpmLevel + 1, kickdownMaxThrottleLevel);

          expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
          expect(engineMock.handleGearIncreased).toHaveBeenCalled();
        });

        it('should call engine.handleGearIncreased if kickdownDecreaseCounter is 0 and rpm greater than kickdown decrease level and gear is less than max', () => {
          service['kickdownDecreaseCounter'] = 0;
          service['gearbox'].currentGear = 3;
          service['handleKickdown'](kickdownDecreaseGearMaxRpmLevel + 1, kickdownMaxThrottleLevel);

          expect(engineMock.handleGearIncreased).toHaveBeenCalled();
        });

        it('should not call engine.handleGearIncreased if kickdownDecreaseCounter is 0 and rpm greater than kickdown decrease level and gear is max', () => {
          service['kickdownDecreaseCounter'] = 0;
          service['gearbox'].currentGear = service['gearbox'].maxGear;
          service['handleKickdown'](kickdownDecreaseGearMaxRpmLevel, kickdownMaxThrottleLevel);

          expect(engineMock.handleGearIncreased).not.toHaveBeenCalled();
        });
      });

      describe('second level kickdown', () => {
        it('should call engine.handleGearDecreased if kickdownDecreaseCounter greater than 0 and rpm less or equal than kickdown decrease level and gear is greater than 1', () => {
          service['kickdownDecreaseCounter'] = 1;
          service['gearbox'].currentGear = 3;
          service['handleKickdown'](nextLevelKickdownDecreaseGearMaxRpmLevel, nextLevelKickdownMaxThrottleLevel);

          expect(engineMock.handleGearDecreased).toHaveBeenCalled();
        });

        it('should not call engine.handleGearDecreased if kickdownDecreaseCounter greater than 0 and rpm less or equal than kickdown decrease level and gear is 1', () => {
          service['kickdownDecreaseCounter'] = 1;
          service['gearbox'].currentGear = 1;
          service['handleKickdown'](nextLevelKickdownDecreaseGearMaxRpmLevel, nextLevelKickdownMaxThrottleLevel);

          expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
        });

        it('should call engine.handleGearDecreased if kickdownDecreaseCounter greater than 0 and rpm greater than kickdown decrease level and gear is greater than 1', () => {
          service['kickdownDecreaseCounter'] = 1;
          service['gearbox'].currentGear = 3;
          service['handleKickdown'](nextLevelKickdownDecreaseGearMaxRpmLevel + 1, nextLevelKickdownMaxThrottleLevel);

          expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
          expect(engineMock.handleGearIncreased).toHaveBeenCalled();
        });

        it('should call engine.handleGearIncreased if kickdownDecreaseCounter is 0 and rpm greater than kickdown decrease level and gear is less than max', () => {
          service['kickdownDecreaseCounter'] = 0;
          service['gearbox'].currentGear = 3;
          service['handleKickdown'](nextLevelKickdownDecreaseGearMaxRpmLevel + 1, nextLevelKickdownMaxThrottleLevel);

          expect(engineMock.handleGearIncreased).toHaveBeenCalled();
        });

        it('should not call engine.handleGearIncreased if kickdownDecreaseCounter is 0 and rpm greater than kickdown decrease level and gear is max', () => {
          service['kickdownDecreaseCounter'] = 0;
          service['gearbox'].currentGear = service['gearbox'].maxGear;
          service['handleKickdown'](nextLevelKickdownDecreaseGearMaxRpmLevel, nextLevelKickdownMaxThrottleLevel);

          expect(engineMock.handleGearIncreased).not.toHaveBeenCalled();
        });
      });
    });

    describe('handleBrake', () => {
      it('should call engine.handleGearDecreased if rpm less than brake decrease level and gear is greater than 1', () => {
        service['gearbox'].currentGear = 3;
        service['handleBrake'](brakeDecreaseGearRpmLevel - 1);

        expect(engineMock.handleGearDecreased).toHaveBeenCalled();
      });

      it('should not call engine.handleGearDecreased if rpm greater than brake decrease level and gear is greater than 1', () => {
        service['gearbox'].currentGear = 3;
        service['handleBrake'](brakeDecreaseGearRpmLevel + 1);

        expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
      });

      it('should not call engine.handleGearDecreased if rpm less than brake decrease level and gear is 1', () => {
        service['gearbox'].currentGear = 1;
        service['handleBrake'](brakeDecreaseGearRpmLevel);

        expect(engineMock.handleGearDecreased).not.toHaveBeenCalled();
      });
    });
  });
});
