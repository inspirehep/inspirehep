import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Loadable from 'react-loadable';

import { getStore } from '../../fixtures/store';
import Data from '..';
import DetailPageContainer from '../containers/DetailPageContainer';
import SearchPageContainer from '../containers/SearchPageContainer';

describe('Data', () => {
  it('renders initial state', () => {
    const component = shallow(<Data />);
    expect(component).toMatchSnapshot();
  });

  it('navigates to DetailPageContainer when /data/:id', async () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/data/123']} initialIndex={0}>
          <Data />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(DetailPageContainer)).toExist();
  });

  it('navigates to SerachPage when /data', async () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/data']} initialIndex={0}>
          <Data />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(SearchPageContainer)).toExist();
  });
});
