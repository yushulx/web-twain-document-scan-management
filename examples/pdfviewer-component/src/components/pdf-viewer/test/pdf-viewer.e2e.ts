import { newE2EPage } from '@stencil/core/testing';

describe('pdf-viewer', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<pdf-viewer></pdf-viewer>');

    const element = await page.find('pdf-viewer');
    expect(element).toHaveClass('hydrated');
  });
});
