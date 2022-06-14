import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Loadable from 'react-loadable';

import { getStore } from '../../fixtures/store';
import Conferences from '..';
import DetailPageContainer from '../containers/DetailPageContainer';
import SearchPageContainer from '../containers/SearchPageContainer';

describe('Conferences', () => {
  it('renders initial state', () => {
    const component = shallow(<Conferences />);
    expect(component).toMatchSnapshot();
  });

  it('navigates to DetailPageContainer when /conferences/:id', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/conferences/123']} initialIndex={0}>
          <Conferences />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(DetailPageContainer)).toExist();

    done();
  });

  it('navigates to SerachPage when /conferences', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/conferences']} initialIndex={0}>
          <Conferences />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(SearchPageContainer)).toExist();

    done();
  });
});
