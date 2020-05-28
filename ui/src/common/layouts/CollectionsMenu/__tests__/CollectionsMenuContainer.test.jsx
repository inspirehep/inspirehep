import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { getStoreWithState } from '../../../../fixtures/store';
import CollectionsMenuContainer from '../CollectionsMenuContainer';
import { SUBMISSIONS_AUTHOR } from '../../../routes';
import CollectionsMenu from '../CollectionsMenu';

describe('CollectionsMenuContainer', () => {
  it('passes props from state', () => {
    const store = getStoreWithState({
      router: {
        location: {
          pathname: SUBMISSIONS_AUTHOR,
          hash: '#whatever',
        },
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <CollectionsMenuContainer onHeightChange={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(CollectionsMenu)).toHaveProp({
      currentPathname: SUBMISSIONS_AUTHOR,
      currentHash: '#whatever',
    });
  });
});
