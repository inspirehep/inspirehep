import MockAdapter from 'axios-mock-adapter';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CiteAllAction from '../CiteAllAction';
import { MAX_CITEABLE_RECORDS } from '../../constants';
import http from '../../../common/http';
import { downloadTextAsFile } from '../../../common/utils';

vi.mock('../../../common/utils');

const mockHttp = new MockAdapter(http.httpClient);

describe('CiteAllAction', () => {
  beforeEach(() => {
    downloadTextAsFile.mockClear();
    mockHttp.reset();
  });

  it('renders with less than max citeable records results', () => {
    render(<CiteAllAction numberOfResults={12} query={{ q: 'ac>2000' }} />);

    expect(
      screen.getByRole('button', { name: /cite all/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cite all/i })
    ).not.toBeDisabled();
  });

  it('renders with disabled when exceeding max citeable records', () => {
    render(
      <CiteAllAction
        numberOfResults={MAX_CITEABLE_RECORDS + 1}
        query={{ q: 'ac>2000' }}
      />
    );

    expect(screen.getByRole('button', { name: /cite all/i })).toBeDisabled();
  });

  it('shows loading state during citation process', async () => {
    const user = userEvent.setup();
    mockHttp
      .onGet(
        `/literature?sort=mostcited&q=query&page=1&size=${MAX_CITEABLE_RECORDS}`
      )
      .reply(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve([200, 'Test']), 100);
          })
      );

    const { container } = render(
      <CiteAllAction
        numberOfResults={12}
        query={{ sort: 'mostcited', q: 'query' }}
      />
    );

    const dropdownTrigger = container.querySelector('.ant-dropdown-trigger');
    await user.hover(dropdownTrigger);

    const bibTexOption = await screen.findByText('BibTeX');
    await user.click(bibTexOption);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cite all/i })).toHaveClass(
        'ant-btn-loading'
      );
    });
  });

  it('calls downloadTextAsFile with correct data when LaTeX EU option is clicked', async () => {
    const user = userEvent.setup();
    mockHttp
      .onGet(
        `/literature?sort=mostcited&q=query&page=1&size=${MAX_CITEABLE_RECORDS}`
      )
      .replyOnce(200, 'Test');

    const { container } = render(
      <CiteAllAction
        numberOfResults={12}
        query={{ sort: 'mostcited', q: 'query' }}
      />
    );

    const dropdownTrigger = container.querySelector('.ant-dropdown-trigger');
    await user.hover(dropdownTrigger);

    const latexEuOption = await screen.findByText('LaTeX (EU)');
    await user.click(latexEuOption);

    await waitFor(() => {
      expect(downloadTextAsFile).toHaveBeenCalledWith(
        'Test',
        'INSPIRE-CiteAll.tex',
        'application/x-latex'
      );
    });
  });

  it('calls downloadTextAsFile with correct data omitting page and size when option is clicked', async () => {
    const user = userEvent.setup();
    mockHttp
      .onGet(
        `/literature?sort=mostrecent&q=query&page=1&size=${MAX_CITEABLE_RECORDS}`
      )
      .replyOnce(200, 'Test');

    const { container } = render(
      <CiteAllAction
        numberOfResults={12}
        query={{ sort: 'mostrecent', q: 'query', page: 10, size: 100 }}
      />
    );

    const dropdownTrigger = container.querySelector('.ant-dropdown-trigger');
    await user.hover(dropdownTrigger);

    const latexEuOption = await screen.findByText('LaTeX (EU)');
    await user.click(latexEuOption);

    await waitFor(() => {
      expect(downloadTextAsFile).toHaveBeenCalledWith(
        'Test',
        'INSPIRE-CiteAll.tex',
        'application/x-latex'
      );
    });
  });

  it('shows tooltip when disabled due to too many results', async () => {
    const user = userEvent.setup();
    render(
      <CiteAllAction
        numberOfResults={MAX_CITEABLE_RECORDS + 1}
        query={{ q: 'ac>2000' }}
      />
    );

    const citeButton = screen.getByRole('button', { name: /cite all/i });

    expect(citeButton).toBeDisabled();
    await user.hover(citeButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          `Only up to ${MAX_CITEABLE_RECORDS} results can be exported.`
        )
      ).toBeInTheDocument();
    });
  });
});
