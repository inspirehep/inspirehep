import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import { getStore } from '../../../../fixtures/store';
import BannerContainer from '../BannerContainer';

const REQUIRED_BANNER_PROPS = {
  id: 'test',
  message: 'Test',
};

describe('BannerContainer', () => {
  it('passes props from state when submissions page', () => {
    const closedBannersById = fromJS({ foo: true });
    const store = getStore({
      router: {
        location: {
          pathname: `/test`,
        },
      },
      ui: fromJS({
        closedBannersById,
      }),
    });
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <BannerContainer {...REQUIRED_BANNER_PROPS} />
        </MemoryRouter>
      </Provider>
    );

    expect(getByText('Test')).toBeInTheDocument();
  });
});
