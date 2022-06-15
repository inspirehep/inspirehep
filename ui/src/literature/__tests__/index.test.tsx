import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Loadable from 'react-loadable';

import { getStore } from '../../fixtures/store';
import Literature from '..';
import SearchPageContainer from '../containers/SearchPageContainer';
import DetailPageContainer from '../containers/DetailPageContainer';

<<<<<<< Updated upstream

describe('Literature', () => {
  
  it('renders initial state', () => {
    const component = shallow(<Literature />);
    
    expect(component).toMatchSnapshot();
  });

  
=======
describe('Literature', () => {
  it('renders initial state', () => {
    const component = shallow(<Literature />);
    expect(component).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('navigates to SearchPageContainer when /literature', async (done: any) => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/literature']} initialIndex={0}>
          <Literature />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper.find(SearchPageContainer)).toExist();

    done();
  });

<<<<<<< Updated upstream
  
=======
>>>>>>> Stashed changes
  it('navigates to DetailPageContainer when /literature/:id', async (done: any) => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/literature/1']} initialIndex={0}>
          <Literature />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper.find(DetailPageContainer)).toExist();

    done();
  });
});
