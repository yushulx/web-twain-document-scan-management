import { newSpecPage } from '@stencil/core/testing';
import { PDFViewer } from '../pdf-viewer';

describe('pdf-viewer', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [PDFViewer],
      html: `<pdf-viewer></pdf-viewer>`,
    });
    expect(page.root).toEqualHtml(`
      <pdf-viewer>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </pdf-viewer>
    `);
  });
});
