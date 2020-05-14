import { browser, by } from 'protractor';
import { GearboxPosition } from '../../src/app/gearbox/gearbox';

export class AppPage {
  navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl) as Promise<unknown>;
  }

  getPositionRadioButton(gearboxPosition: GearboxPosition): any {
    return browser.driver.findElement(by.css(`input[value="${gearboxPosition}"]`));
  }
}
