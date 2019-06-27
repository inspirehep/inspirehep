import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import { getStore } from '../../fixtures/store';
import Holdingpen from '..';
import DashboardPageContainer from '../containers/DashboardPageContainer';
import ExceptionsPageContainer from '../containers/ExceptionsPageContainer';
import InspectPageContainer from '../containers/InspectPageContainer';

describe('Holdingpen', () => {
  it('renders initial state', () => {
    const component = shallow(<Holdingpen />);
    expect(component).toMatchSnapshot();
  });

  it('navigates to DashboardPageContainer when /holdingpen/dashboard', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/holdingpen/dashboard']}
          initialIndex={0}
        >
          <Holdingpen />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find(DashboardPageContainer)).toExist();
  });

  it('navigates to DashboardPageContainer when /holdingpen/exceptions', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/holdingpen/exceptions']}
          initialIndex={0}
        >
          <Holdingpen />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(ExceptionsPageContainer)).toExist();
  });

  it('navigates to InspectPageContainer when /holdingpen/inspect/:id', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/holdingpen/inspect/1']}
          initialIndex={0}
        >
          <Holdingpen />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(InspectPageContainer)).toExist();
  });
});
