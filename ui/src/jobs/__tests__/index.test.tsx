import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Loadable from 'react-loadable';

import { getStore } from '../../fixtures/store';
import Jobs from '..';
import DetailPageContainer from '../containers/DetailPageContainer';
import SearchPageContainer from '../containers/SearchPageContainer';

describe('Jobs', () => {
  it('renders initial state', () => {
    const component = shallow(<Jobs />);
    expect(component).toMatchSnapshot();
  });

  it('navigates to DetailPageContainer when /jobs/:id', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/jobs/123']} initialIndex={0}>
          <Jobs />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(DetailPageContainer)).toExist();

    done();
  });

  it('navigates to SerachPage when /jobs', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/jobs']} initialIndex={0}>
          <Jobs />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(SearchPageContainer)).toExist();

    done();
  });
});
