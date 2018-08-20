import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Loadable from 'react-loadable';

import { getStore } from '../../fixtures/store';
import Submissions from '../';
import AuthorSubmissionPage from '../containers/AuthorSubmissionPage';
import SubmissionSuccessPage from '../components/SubmissionSuccessPage';
import AuthorUpdateSubmissionPage from '../containers/AuthorUpdateSubmissionPage';

// TODO: enable tests after bumping enzyme (eznyme@3.4 was not stable at the time of the TODO)
describe('Submissions', () => {
  it('renders initial state', () => {
    const component = shallow(<Submissions />);
    expect(component).toMatchSnapshot();
  });

  xit('navigates to AuthorSubmissionPage when /submissions/author', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/submissions/author']} initialIndex={0}>
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(AuthorSubmissionPage)).toExist();

    done();
  });

  xit('navigates to AuthorUpdateSubmissionPage when /submissions/author/:id', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/author/1']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(AuthorUpdateSubmissionPage)).toExist();

    done();
  });

  xit('navigates to SubmissionSuccessPage when /submissions/success', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/success']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(SubmissionSuccessPage)).toExist();

    done();
  });
});
