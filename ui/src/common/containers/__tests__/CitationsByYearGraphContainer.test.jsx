import { fromJS } from 'immutable';

import { getStore } from '../../../fixtures/store';
import CitationsByYearGraphContainer from '../CitationsByYearGraphContainer';
import { renderWithProviders } from '../../../fixtures/render';

describe('CitationsByYearGraphContainer', () => {
  it('pass props from state', () => {
    const store = getStore({
      citations: fromJS({
        loadingCitationsByYear: false,
        errorCitationsByYear: null,
        byYear: {
          1999: 134,
          2002: 125,
        },
      }),
    });

    const { getByText } = renderWithProviders(
      <CitationsByYearGraphContainer />,
      { store }
    );

    expect(getByText(1999)).toBeInTheDocument();
    expect(getByText(2002)).toBeInTheDocument();
    expect(getByText(134)).toBeInTheDocument();
    expect(getByText(125)).toBeInTheDocument();
  });
});
