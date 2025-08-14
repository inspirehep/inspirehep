import React from 'react';

import CitationSummaryBox from '../CitationSummaryBox';
import { LITERATURE_NS } from '../../../search/constants';
import { renderWithProviders } from '../../../fixtures/render';

describe('CitationSummaryBox', () => {
  it('renders', () => {
    const { asFragment } = renderWithProviders(
      <CitationSummaryBox namespace={LITERATURE_NS} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with Citation Summary title', () => {
    const { getByText } = renderWithProviders(
      <CitationSummaryBox namespace={LITERATURE_NS} />
    );
    expect(getByText('Citation Summary')).toBeInTheDocument();
  });
});
