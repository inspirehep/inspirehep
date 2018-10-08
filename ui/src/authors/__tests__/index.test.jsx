import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Loadable from 'react-loadable';

import { getStore } from '../../fixtures/store';
import Authors from '../';
import SearchPage from '../containers/SearchPage';
import DetailPage from '../containers/DetailPage';

describe('Authors', () => {
  it('renders initial state', () => {
    const component = shallow(<Authors />);
    expect(component).toMatchSnapshot();
  });

  it('navigates to SearchPage when /authors', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/authors']} initialIndex={0}>
          <Authors />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(SearchPage)).toExist();

    done();
  });

  it('navigates to DetailPage when /authors/:id', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/authors/1']} initialIndex={0}>
          <Authors />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(DetailPage)).toExist();

    done();
  });
});
