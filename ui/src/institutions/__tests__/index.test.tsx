import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Loadable from 'react-loadable';

import { getStore } from '../../fixtures/store';
import Institutions from '..';
import SearchPageContainer from '../containers/SearchPageContainer';
import DetailPageContainer from '../containers/DetailPageContainer';

describe('Institutions', () => {
  it('renders initial state', () => {
    const component = shallow(<Institutions />);
    expect(component).toMatchSnapshot();
  });

  it('navigates to SearchPage when /institutions', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/institutions']} initialIndex={0}>
          <Institutions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(SearchPageContainer)).toExist();

    done();
  });

  it('navigates to DetailPageContainer when /institutions/:id', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/institutions/1']} initialIndex={0}>
          <Institutions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(DetailPageContainer)).toExist();

    done();
  });
});
