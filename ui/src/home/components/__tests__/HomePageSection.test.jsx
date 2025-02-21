import React from 'react';

import { render } from '@testing-library/react';
import HomePageSection from '../HomePageSection';

describe('HomePageSection', () => {
  it('renders with all props', () => {
    const { getByText } = render(
      <HomePageSection
        className="white-background"
        title="Section"
        description="This is the description of this section"
      >
        <span>Content</span>
      </HomePageSection>
    );
    expect(getByText('Section')).toBeInTheDocument();
    expect(
      getByText('This is the description of this section')
    ).toBeInTheDocument();
    expect(getByText('Content')).toBeInTheDocument();
  });

  it('renders with only required props', () => {
    const { getByText } = render(
      <HomePageSection>
        <span>Content</span>
      </HomePageSection>
    );
    expect(getByText('Content')).toBeInTheDocument();
  });
});
