import React from 'react';

import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import useAxios from 'axios-hooks';
import NewsAndUpdates from '../NewsAndUpdates';

jest.mock('axios-hooks');

const mockData = [
  {
    id: '1',
    link: 'https://blog.inspirehep.net/post1',
    title: { rendered: 'Post 1 Title' },
    excerpt: { rendered: 'Post 1 Excerpt' },
    date: '2023-01-01',
  },
  {
    id: '2',
    link: 'https://blog.inspirehep.net/post2',
    title: { rendered: 'Post 2 Title' },
    excerpt: { rendered: 'Post 2 Excerpt' },
    date: '2023-01-02',
  },
  {
    id: '3',
    link: 'https://blog.inspirehep.net/post3',
    title: { rendered: 'Post 3 Title' },
    excerpt: { rendered: 'Post 3 Excerpt' },
    date: '2023-01-03',
  },
];

describe('NewsAndUpdates', () => {
  beforeEach(() => {
    useAxios.mockReturnValue([{ data: mockData, loading: false }]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the component with correct content and links', async () => {
    const { getByText, getByRole, getAllByRole } = render(
      <MemoryRouter>
        <NewsAndUpdates />
      </MemoryRouter>
    );

    mockData.forEach((post) => {
      expect(getByText(post.title.rendered)).toBeInTheDocument();
      expect(getByText(post.excerpt.rendered)).toBeInTheDocument();
    });

    const viewAllLink = getByRole('link', { name: 'View all' });
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink).toHaveAttribute('href', 'https://blog.inspirehep.net/');

    const links = getAllByRole('link');
    const blueskyLink = links.find(
      (link) =>
        link.getAttribute('href') === 'https://bsky.app/profile/inspirehep.net'
    );
    const xLink = links.find(
      (link) => link.getAttribute('href') === 'https://x.com/inspirehep'
    );

    expect(blueskyLink).toBeInTheDocument();
    expect(xLink).toBeInTheDocument();
  });
});
