import React from 'react';
import { fromJS } from 'immutable';
import { DownloadOutlined, FileOutlined } from '@ant-design/icons';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import UrlsAction from '../UrlsAction';

describe('UrlsAction', () => {
  it('renders multiple, with and without description and target blank', async () => {
    const links = fromJS([
      {
        description: 'Whatever',
        value: 'https://www.whatever.com/pdfs/fulltext.pdf',
      },
      { value: 'www.descriptionless.com/fulltext.pdf' },
    ]);
    render(
      <UrlsAction
        urls={links}
        icon={<DownloadOutlined />}
        text="download"
        trackerEventId="PdfDownload"
        page="Home"
      />
    );

    await userEvent.hover(screen.getByText('download'));
    await waitFor(() => {
      expect(screen.getByText('Whatever')).toBeInTheDocument();
      expect(
        screen.getByText('descriptionless.com/fulltext.pdf')
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Whatever' })).toHaveAttribute(
        'href',
        'https://www.whatever.com/pdfs/fulltext.pdf'
      );
      expect(screen.getByRole('link', { name: 'Whatever' })).toHaveAttribute(
        'target',
        '_blank'
      );
      expect(
        screen.getByRole('link', { name: 'descriptionless.com/fulltext.pdf' })
      ).toHaveAttribute('href', 'www.descriptionless.com/fulltext.pdf');
      expect(
        screen.getByRole('link', { name: 'descriptionless.com/fulltext.pdf' })
      ).toHaveAttribute('target', '_blank');
    });
  });

  it('renders multiple, with and without description without target blank', async () => {
    const links = fromJS([
      {
        description: '1234',
        value: '/literature/1234',
      },
      {
        description: '5678',
        value: '/literature/5678',
      },
    ]);
    render(
      <MemoryRouter>
        <UrlsAction
          urls={links}
          icon={<FileOutlined />}
          text="literature"
          trackerEventId="Literature links"
          page="Literature detail"
          isTargetBlank={false}
        />
      </MemoryRouter>
    );

    await userEvent.hover(screen.getByText('literature'));
    await waitFor(() => {
      expect(screen.getByText('1234')).toBeInTheDocument();
      expect(screen.getByText('5678')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '1234' })).toHaveAttribute(
        'href',
        '/literature/1234'
      );
      expect(screen.getByRole('link', { name: '1234' })).not.toHaveAttribute(
        'target',
        '_blank'
      );
      expect(screen.getByRole('link', { name: '5678' })).toHaveAttribute(
        'href',
        '/literature/5678'
      );
      expect(screen.getByRole('link', { name: '5678' })).not.toHaveAttribute(
        'target',
        '_blank'
      );
    });
  });

  it('renders single with target blank', () => {
    const links = fromJS([
      {
        description: 'Whatever',
        value: 'https://www.whatever.com/pdfs/fulltext.pdf',
      },
    ]);
    render(
      <UrlsAction
        urls={links}
        text="pdf"
        icon={<DownloadOutlined />}
        trackerEventId="PdfDownload"
        page="Home"
      />
    );
    expect(screen.getByText('pdf')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://www.whatever.com/pdfs/fulltext.pdf'
    );
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
  });

  it('renders single without target blank', () => {
    const links = fromJS([
      {
        description: 'literature',
        value: '/literature/1234',
      },
    ]);
    render(
      <MemoryRouter>
        <UrlsAction
          urls={links}
          icon={<FileOutlined />}
          text="literature"
          trackerEventId="Literature links"
          page="Literature detail"
          isTargetBlank={false}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('literature')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/literature/1234'
    );
    expect(screen.getByRole('link')).not.toHaveAttribute('target', '_blank');
  });

  it('renders single when hepdata', () => {
    const links = fromJS([
      {
        description: 'test',
        value: 'https://www.hepdata.net/record/ins2878694',
      },
    ]);
    render(
      <UrlsAction
        urls={links}
        text="datasets"
        icon={<DownloadOutlined />}
        trackerEventId="PdfDownload"
        page="Home"
      />
    );
    expect(screen.getByText('datasets')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/data/?q=literature.record.$ref:2878694'
    );
  });

  it('renders multiple hepdata links', async () => {
    const links = fromJS([
      {
        description: '1234',
        value: 'https://www.hepdata.net/record/ins2878694',
      },
      {
        description: '5678',
        value: 'https://www.hepdata.net/record/ins2878691',
      },
    ]);
    render(
      <MemoryRouter>
        <UrlsAction
          urls={links}
          icon={<FileOutlined />}
          text="datasets"
          trackerEventId="Literature links"
          page="Literature detail"
          isTargetBlank={false}
        />
      </MemoryRouter>
    );

    await userEvent.hover(screen.getByText('datasets'));
    await waitFor(() => {
      expect(screen.getByText('1234')).toBeInTheDocument();
      expect(screen.getByText('5678')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '1234' })).toHaveAttribute(
        'href',
        '/data/?q=literature.record.$ref:2878694'
      );
      expect(screen.getByRole('link', { name: '5678' })).toHaveAttribute(
        'href',
        '/data/?q=literature.record.$ref:2878691'
      );
    });
  });
});
