import React from 'react';
import { render } from '@testing-library/react';

import JournalSuggestion from '../JournalSuggestion';

describe('JournalSuggestion', () => {
  it('renders with full journal', () => {
    const journal = {
      short_title: 'CJRL',
      journal_title: {
        title: 'Cool Journal of Tests',
      },
    };
    const { asFragment } = render(<JournalSuggestion journal={journal} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with only short_title', () => {
    const journal = {
      short_title: 'CJRL',
    };
    const { asFragment } = render(<JournalSuggestion journal={journal} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
