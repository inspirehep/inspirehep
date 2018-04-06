import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import App from './App';
import Holdingpen from './holdingpen';

describe('App', () => {
  it('renders without crashing', () => {
    shallow(<App />);
  });

  it('navigates to Holdingpen when /holdingpen', () => {
    const wrapper = mount((
      <MemoryRouter initialEntries={['/holdingpen']} initialIndex={0}>
        <App />
      </MemoryRouter>
    ));
    expect(wrapper.find(Holdingpen).length).toBe(1);
  });
});
