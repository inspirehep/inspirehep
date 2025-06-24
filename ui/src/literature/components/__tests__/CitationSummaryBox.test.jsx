import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import CitationSummaryBox from '../CitationSummaryBox';
import { LITERATURE_NS } from '../../../search/constants';
import { getStore } from '../../../fixtures/store';

describe('CitationSummaryBox', () => {
  it('renders', () => {
    const store = getStore();
    const { asFragment } = render(
      <Provider store={store}>
        <CitationSummaryBox namespace={LITERATURE_NS} />
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with Citation Summary title', () => {
    const store = getStore();
    const { getByText } = render(
      <Provider store={store}>
        <CitationSummaryBox namespace={LITERATURE_NS} />
      </Provider>
    );
    expect(getByText('Citation Summary')).toBeInTheDocument();
  });
});
