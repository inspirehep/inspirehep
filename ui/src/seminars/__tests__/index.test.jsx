import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Loadable from 'react-loadable';

import { getStore } from '../../fixtures/store';
import Seminars from '..';
import DetailPageContainer from '../containers/DetailPageContainer';
import SearchPage from '../components/SearchPage';

describe('Seminars', () => {
  it('renders initial state', () => {
    const component = shallow(<Seminars />);
    expect(component).toMatchSnapshot();
  });

  it('navigates to SerachPage when /seminars', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/seminars']} initialIndex={0}>
          <Seminars />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(SearchPage)).toExist();

    done();
  });

  it('navigates to DetailPageContainer when /seminars/:id', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/seminars/123']} initialIndex={0}>
          <Seminars />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(DetailPageContainer)).toExist();

    done();
  });
});
