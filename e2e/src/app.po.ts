import { browser, by, WebElementPromise, promise } from 'protractor';
import { GearboxAggressionLevel, GearboxMode, GearboxPosition } from '../../src/app/enums';

export class AppPage {
  navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl) as Promise<unknown>;
  }

  getPositionRadioButton(gearboxPosition: GearboxPosition): WebElementPromise {
    return browser.driver.findElement(by.css(`input[value="${gearboxPosition}"]`));
  }

  getModeRadioButton(gearboxMode: GearboxMode): WebElementPromise {
    return browser.driver.findElement(by.css(`input[value="${gearboxMode}"]`));
  }

  getAggressionLevelRadioButton(gearboxAggressionLevel: GearboxAggressionLevel): WebElementPromise {
    return browser.driver.findElement(by.css(`input[value="${gearboxAggressionLevel}"]`));
  }

  getRpmGaugeTag(): promise.Promise<string> {
    return browser.driver.findElement(by.css('gojs-diagram')).getTagName();
  }

  getSliderTag(): promise.Promise<string> {
    return browser.driver.findElement(by.css('ng5-slider')).getTagName();
  }
}
