import { browser, logging } from 'protractor';

import { AppPage } from './app.po';
import { GearboxAggressionLevel, GearboxMode, GearboxPosition } from '../../src/app/enums';

describe('workspace-project App', () => {
  const rpmGaugeTag = 'gojs-diagram';
  const sliderTag = 'ng5-slider';
  let page: AppPage;

  beforeEach(async () => {
    page = new AppPage();
    await page.navigateTo();
  });

  afterEach(async () => {
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });

  it('should contain all important elements', () => {
    expect(page.getPositionRadioButton(GearboxPosition.Drive).getAttribute('checked')).toBeNull();
    expect(page.getPositionRadioButton(GearboxPosition.Parking).getAttribute('checked')).toEqual('true');
    expect(page.getPositionRadioButton(GearboxPosition.Neutral).getAttribute('checked')).toBeNull();
    expect(page.getPositionRadioButton(GearboxPosition.Reverse).getAttribute('checked')).toBeNull();

    expect(page.getModeRadioButton(GearboxMode.Eco).getAttribute('checked')).toBeNull();
    expect(page.getModeRadioButton(GearboxMode.Comfort).getAttribute('checked')).toEqual('true');
    expect(page.getModeRadioButton(GearboxMode.Sport).getAttribute('checked')).toBeNull();

    expect(page.getAggressionLevelRadioButton(GearboxAggressionLevel.Low).getAttribute('checked')).toEqual('true');
    expect(page.getAggressionLevelRadioButton(GearboxAggressionLevel.Medium).getAttribute('checked')).toBeNull();
    expect(page.getAggressionLevelRadioButton(GearboxAggressionLevel.High).getAttribute('checked')).toBeNull();

    expect(page.getRpmGaugeTag()).toEqual(rpmGaugeTag);
    expect(page.getSliderTag()).toEqual(sliderTag);
  });
});
