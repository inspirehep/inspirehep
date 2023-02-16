import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Loadable from 'react-loadable';

import { getStore } from '../../fixtures/store';
import Journals from '..';
import SearchPageContainer from '../containers/SearchPageContainer';
import DetailPageContainer from '../containers/DetailPageContainer';

describe('Journals', () => {
  it('renders initial state', () => {
    const component = shallow(<Journals />);
    expect(component).toMatchSnapshot();
  });

  it('navigates to SearchPage when /journals', async () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/journals']} initialIndex={0}>
          <Journals />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(SearchPageContainer)).toExist();
  });

  it('navigates to DetailPageContainer when /journals/:id', async () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/journals/1']} initialIndex={0}>
          <Journals />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(DetailPageContainer)).toExist();
  });
});
