import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Loadable from 'react-loadable';

import { getStore } from '../../fixtures/store';
import Experiments from '..';
import DetailPageContainer from '../containers/DetailPageContainer';
import SearchPageContainer from '../containers/SearchPageContainer';

describe('Experiments', () => {
  it('renders initial state', () => {
    const component = shallow(<Experiments />);
    expect(component).toMatchSnapshot();
  });

  it('navigates to DetailPageContainer when /experiments/:id', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/experiments/123']} initialIndex={0}>
          <Experiments />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(DetailPageContainer)).toExist();

    done();
  });

  it('navigates to SerachPage when /experiments', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/experiments']} initialIndex={0}>
          <Experiments />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(SearchPageContainer)).toExist();

    done();
  });
});
