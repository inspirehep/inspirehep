import React from 'react';
import { render, screen } from '@testing-library/react';
import { fromJS, Map } from 'immutable';

import orcidLogo from '../../../../../common/assets/orcid.svg';
import Links, { Ids, Urls } from '../Links';

describe('Links Component', () => {
  it('should render Ids and Urls components', () => {
    const urls = fromJS([
      {
        schema: 'https',
        value: 'www.example.com',
        description: 'Example URL',
      },
      {
        schema: 'http',
        value: 'www.test.com',
        description: 'Test URL',
      },
    ]);

    const ids = fromJS([
      {
        schema: 'LINKEDIN',
        value: 'linkedin.com/user1',
      },
      {
        schema: 'TWITTER',
        value: 'x.com/user2',
      },
    ]);

    const { container, asFragment } = render(
      <Links urls={urls as Map<string, any>} ids={ids as Map<string, any>} />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render LinkedIn link correctly in Ids', () => {
    const ids = Map([['0', Map({ schema: 'LINKEDIN', value: 'john-doe' })]]);
    const { getByText, getByRole } = render(<Ids ids={ids} />);

    expect(getByText(/linkedin/i)).toBeInTheDocument();
    expect(getByRole('link', { name: /john-doe/i })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/john-doe'
    );
  });

  it('should render Bluesky link correctly in Ids', () => {
    const ids = Map([['0', Map({ schema: 'BLUESKY', value: 'john_doe' })]]);
    const { getAllByText, getByRole } = render(<Ids ids={ids} />);

    expect(getAllByText(/bluesky/i)[0]).toBeInTheDocument();
    expect(getByRole('link', { name: /john_doe/i })).toHaveAttribute(
      'href',
      'https://bsky.app/profile/john_doe'
    );
  });

  it('should render Mastodon link correctly in Ids', () => {
    const ids = Map([
      ['0', Map({ schema: 'MASTODON', value: 'john_doe@example.com' })],
    ]);
    const { getAllByText, getByRole } = render(<Ids ids={ids} />);

    expect(getAllByText(/mastodon/i)[0]).toBeInTheDocument();
    expect(
      getByRole('link', { name: /john_doe@example.com/i })
    ).toHaveAttribute('href', 'https://example.com/@john_doe');
  });

  it('should render Twitter link correctly in Ids', () => {
    const ids = Map([['0', Map({ schema: 'TWITTER', value: 'john_doe' })]]);
    const { getByText, getByRole } = render(<Ids ids={ids} />);

    expect(getByText(/twitter/i)).toBeInTheDocument();
    expect(getByRole('link', { name: /john_doe/i })).toHaveAttribute(
      'href',
      'https://x.com/john_doe'
    );
  });

  it('should render ORCID link with copy button correctly in Ids', () => {
    const ids = Map([
      ['0', Map({ schema: 'ORCID', value: '0000-0002-1825-0097' })],
    ]);
    const { getAllByText, getByRole } = render(<Ids ids={ids} />);

    expect(getAllByText(/orcid/i)[0]).toBeInTheDocument();
    expect(getByRole('link', { name: /0000-0002-1825-0097/i })).toHaveAttribute(
      'href',
      'https://orcid.org/0000-0002-1825-0097'
    );

    const copyIcon = screen.getByLabelText(/copy/i);
    expect(copyIcon).toBeInTheDocument();
  });

  it('should render generic link correctly in Ids', () => {
    const ids = Map([
      ['0', Map({ schema: 'WEBSITE', value: 'https://example.com' })],
    ]);
    const { getByText, getByRole } = render(<Ids ids={ids} />);

    expect(getByText(/website/i)).toBeInTheDocument();
    expect(
      getByRole('link', { name: /https:\/\/example.com/i })
    ).toHaveAttribute('href', 'https://example.com');
  });

  it('should render without an icon in Ids if noIcon is true', () => {
    const ids = Map([['0', Map({ schema: 'LINKEDIN', value: 'john-doe' })]]);
    const { getByText, queryByRole } = render(<Ids ids={ids} noIcon />);

    expect(getByText(/linkedin/i)).toBeInTheDocument();
    expect(queryByRole('img')).toBeNull();
  });

  it('should not render copy button in Ids if not ORCID', () => {
    const ids = Map([['0', Map({ schema: 'LINKEDIN', value: 'john-doe' })]]);
    const { getByText, queryByLabelText } = render(<Ids ids={ids} />);

    expect(getByText(/linkedin/i)).toBeInTheDocument();
    expect(queryByLabelText(/copy/i)).toBeNull();
  });

  it('should render URL with description correctly', () => {
    const urls = Map([
      [
        '0',
        Map({
          schema: 'WEBSITE',
          value: 'https://example.com',
          description: 'Personal Website',
        }),
      ],
    ]);
    const { getByText, getByRole } = render(<Urls urls={urls} />);

    expect(getByText(/personal website/i)).toBeInTheDocument();
    expect(
      getByRole('link', { name: /https:\/\/example.com/i })
    ).toHaveAttribute('href', 'https://example.com');
  });

  it('should render URL without description correctly', () => {
    const urls = Map([
      ['0', Map({ schema: 'WEBSITE', value: 'https://example.com' })],
    ]);
    const { getByRole } = render(<Urls urls={urls} />);

    expect(
      getByRole('link', { name: /https:\/\/example.com/i })
    ).toHaveAttribute('href', 'https://example.com');
  });

  it('should render multiple URLs correctly', () => {
    const urls = Map([
      [
        '0',
        Map({
          schema: 'WEBSITE',
          value: 'https://example.com',
          description: 'Example Site',
        }),
      ],
      [
        '1',
        Map({
          schema: 'BLOG',
          value: 'https://blog.example.com',
          description: 'Example Blog',
        }),
      ],
    ]);
    const { getByText, getAllByRole } = render(<Urls urls={urls} />);

    expect(getByText(/example site/i)).toBeInTheDocument();
    expect(getByText(/example blog/i)).toBeInTheDocument();
    const links = getAllByRole('link');
    expect(links.length).toBe(2);
    expect(links[0]).toHaveAttribute('href', 'https://example.com');
    expect(links[1]).toHaveAttribute('href', 'https://blog.example.com');
  });
});
