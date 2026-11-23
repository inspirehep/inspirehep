import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DocumentViewer, { MIN_VIEWER_WIDTH } from '../components/DocumentViewer';

const formData = {
  urls: [
    { value: 'https://example.org/landing' },
    { value: 'http://example.org/files/paper.pdf' },
  ],
  arxiv_eprints: [{ value: '2101.00001' }],
  dois: [{ value: '10.1000/xyz' }],
};

const renderViewer = (data: any = formData, onWidthChange = vi.fn()) =>
  render(
    <DocumentViewer formData={data} width={500} onWidthChange={onWidthChange} />
  );

describe('<DocumentViewer />', () => {
  it('displays the pdf source by default, with http rewritten to protocol-relative', () => {
    renderViewer();
    expect(screen.getByTitle('Document: pdf')).toHaveAttribute(
      'src',
      '//example.org/files/paper.pdf#zoom=100'
    );
    expect(
      screen.getByRole('link', { name: 'Open pdf in new tab' })
    ).toHaveAttribute('href', '//example.org/files/paper.pdf#zoom=100');
  });

  it('offers arXiv and DOI tabs and switches between them', async () => {
    const user = userEvent.setup();
    renderViewer();

    await user.click(screen.getByRole('tab', { name: /arXiv/ }));
    expect(screen.getByTitle('Document: arXiv')).toHaveAttribute(
      'src',
      '//arxiv.org/pdf/2101.00001#zoom=100'
    );

    await user.click(screen.getByRole('tab', { name: /doi/ }));
    expect(screen.getByTitle('Document: doi')).toHaveAttribute(
      'src',
      '//doi.org/10.1000/xyz'
    );
  });

  it('skips the pdf tab when no url ends with .pdf', () => {
    renderViewer({
      urls: [{ value: 'https://example.org/landing' }],
      arxiv_eprints: [{ value: '2101.00001' }],
    });
    expect(screen.queryByRole('tab', { name: /pdf/ })).not.toBeInTheDocument();
    expect(screen.getByTitle('Document: arXiv')).toBeVisible();
    expect(screen.queryByRole('tab', { name: /doi/ })).not.toBeInTheDocument();
  });

  it('shows an empty state without sources', () => {
    renderViewer({});
    expect(screen.getByText(/no document, arXiv eprint or DOI/)).toBeVisible();
  });

  it('resizes with the keyboard and the pointer, respecting the minimum', async () => {
    const user = userEvent.setup();
    const onWidthChange = vi.fn();
    renderViewer(formData, onWidthChange);
    const handle = screen.getByRole('separator');

    handle.focus();
    await user.keyboard('{ArrowLeft}');
    expect(onWidthChange).toHaveBeenLastCalledWith(520);

    await user.keyboard('{ArrowRight}');
    expect(onWidthChange).toHaveBeenLastCalledWith(480);

    await user.pointer({ keys: '[MouseLeft>]', target: handle });
    expect(document.body).toHaveClass('document-viewer-resizing');
    await user.pointer({ target: handle, coords: { clientX: 600 } });
    expect(onWidthChange).toHaveBeenLastCalledWith(window.innerWidth - 600);

    await user.pointer({
      target: handle,
      coords: { clientX: window.innerWidth },
    });
    expect(onWidthChange).toHaveBeenLastCalledWith(MIN_VIEWER_WIDTH);
    await user.pointer({ keys: '[/MouseLeft]', target: handle });
    expect(document.body).not.toHaveClass('document-viewer-resizing');
  });
});
