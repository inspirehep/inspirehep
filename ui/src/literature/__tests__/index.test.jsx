import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Loadable from 'react-loadable';

import { getStore } from '../../fixtures/store';
import Literature from '../';
import SearchPage from '../containers/SearchPage';
import DetailPage from '../containers/DetailPage';

describe('Literature', () => {
  it('renders initial state', () => {
    const component = shallow(<Literature />);
    expect(component).toMatchSnapshot();
  });

  it('navigates to SearchPage when /literature', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/literature']} initialIndex={0}>
          <Literature />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(SearchPage)).toExist();

    done();
  });

  it('navigates to DetailPage when /literature/:id', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/literature/1']} initialIndex={0}>
          <Literature />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(DetailPage)).toExist();

    done();
  });
});
