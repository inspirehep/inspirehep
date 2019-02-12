import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { getStore } from '../../fixtures/store';
import Errors from '../index';
import Error404 from '../components/Error404';
import Error401 from '../components/Error401';
import Error500 from '../components/Error500';
import ErrorNetwork from '../components/ErrorNetwork';

describe('errors', () => {
  it('navigates to Error404 when /errors/404', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/errors/404']} initialIndex={0}>
          <Errors />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Error404)).toExist();
  });

  it('navigates to Error401 when /errors/401', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/errors/401']} initialIndex={0}>
          <Errors />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Error401)).toExist();
  });

  it('navigates to Error500 when /errors/500', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/errors/500']} initialIndex={0}>
          <Errors />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Error500)).toExist();
  });

  it('navigates to ErrorNetwork when /errors/network', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/errors/network']} initialIndex={0}>
          <Errors />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(ErrorNetwork)).toExist();
  });

  it('navigates to Error404 when /anythingElse', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/anythingElse']} initialIndex={0}>
          <Errors />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Error404)).toExist();
  });
});
