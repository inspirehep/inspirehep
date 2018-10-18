import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import { getStore } from '../../fixtures/store';
import Holdingpen from '../';
import DashboardPage from '../containers/DashboardPage';
import ExceptionsPage from '../containers/ExceptionsPage';
import InspectPage from '../containers/InspectPage';

describe('Holdingpen', () => {
  it('renders initial state', () => {
    const component = shallow(<Holdingpen />);
    expect(component).toMatchSnapshot();
  });

  it('navigates to DashboardPage when /holdingpen/dashboard', () => {
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

    expect(wrapper.find(DashboardPage)).toExist();
  });

  it('navigates to DashboardPage when /holdingpen/exceptions', () => {
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
    expect(wrapper.find(ExceptionsPage)).toExist();
  });

  it('navigates to InspectPage when /holdingpen/inspect/:id', () => {
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
    expect(wrapper.find(InspectPage)).toExist();
  });
});
