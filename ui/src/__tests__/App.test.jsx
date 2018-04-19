import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';

import { getStore } from '../fixtures/store';
import App from '../App';
import Holdingpen from '../holdingpen';

describe('App', () => {
  it('renders initial state', () => {
    const component = shallow(<App />);
    expect(component).toMatchSnapshot();
  });

  it('navigates to Holdingpen when /holdingpen', () => {
    const wrapper = mount((
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/holdingpen']} initialIndex={0}>
          <App />
        </MemoryRouter>
      </Provider>
    ));
    expect(wrapper.find(Holdingpen)).toExist();
  });
});
