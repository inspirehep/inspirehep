import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

import { getStore } from '../../../fixtures/store';
import CitationsByYearGraphContainer from '../CitationsByYearGraphContainer';

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

    const { getByText } = render(
      <Provider store={store}>
        <CitationsByYearGraphContainer />
      </Provider>
    );

    expect(getByText(1999)).toBeInTheDocument();
    expect(getByText(2002)).toBeInTheDocument();
    expect(getByText(134)).toBeInTheDocument();
    expect(getByText(125)).toBeInTheDocument();
  });
});
