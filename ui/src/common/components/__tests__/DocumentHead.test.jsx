import React from 'react';

import { render } from '@testing-library/react';
import { Helmet } from 'react-helmet';
import DocumentHead from '../DocumentHead';

describe('DocumentHead', () => {
  it('renders with only title', () => {
    render(<DocumentHead title="Jessica Jones" />);
    const helmet = Helmet.peek();
    const title = helmet.title.join('');
    expect(title).toBe('Jessica Jones - INSPIRE');
  });

  it('renders with title, description and children', () => {
    render(
      <DocumentHead title="Page Title" description="This is a test page">
        <meta name="citation_title" content="Page Title" />
      </DocumentHead>
    );
    const helmet = Helmet.peek();
    const title = helmet.title.join('');
    expect(title).toBe('Page Title - INSPIRE');
    const metaDescription = helmet.metaTags.find(
      (tag) => tag.name === 'description'
    );
    expect(metaDescription).toEqual({
      name: 'description',
      content: 'This is a test page',
    });
    const metaRobots = helmet.metaTags.find((tag) => tag.name === 'robots');
    expect(metaRobots).toEqual({ name: 'robots', content: 'noarchive' });
    const metaCitationTitle = helmet.metaTags.find(
      (tag) => tag.name === 'citation_title'
    );
    expect(metaCitationTitle).toEqual({
      name: 'citation_title',
      content: 'Page Title',
    });
  });
});
