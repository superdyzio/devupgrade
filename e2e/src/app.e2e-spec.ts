import { browser, by, element, logging } from 'protractor';

import { AppPage } from './app.po';
import { GearboxPosition } from '../../src/app/gearbox/gearbox';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
    page.navigateTo();
  });

  afterEach(async () => {
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });

  describe('Eco mode', () => {
    fit('should be able to achieve full speed and then fully brake', () => {
      browser.sleep(250);
      page.getPositionRadioButton(GearboxPosition.Reverse).click();

      browser.sleep(250);

      expect(page.getPositionRadioButton(GearboxPosition.Reverse).getAttribute('checked')).toEqual('true');
    });

    it('should be able to manually change gears', () => {
    });
  });

  describe('Comfort mode', () => {
    it('should start on Parking position and Comfort mode with lowest aggression level and no trailer', () => {
    });

    it('should reduce gear during kickdown on Comfort mode', () => {
    });
  });

  describe('Sport mode', () => {
    it('should reduce gear twice during kickdown on Sport mode', () => {
    });

    it('should have higher gear change threshold on medium aggression level', () => {
    });

    it('should shoot fire from exhaust on gear increase while on highest aggression level', () => {
    });
  });
});
