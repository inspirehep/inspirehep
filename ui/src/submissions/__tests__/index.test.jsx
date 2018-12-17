import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Loadable from 'react-loadable';

import { getStore } from '../../fixtures/store';
import Submissions from '..';
import AuthorSubmissionPage from '../authors/containers/AuthorSubmissionPage';
import SubmissionSuccessPage from '../common/components/SubmissionSuccessPage';
import AuthorUpdateSubmissionPage from '../authors/containers/AuthorUpdateSubmissionPage';
import LiteratureSubmissionPage from '../literature/containers/LiteratureSubmissionPage';

describe('Submissions', () => {
  it('renders initial state', () => {
    const component = shallow(<Submissions />);
    expect(component).toMatchSnapshot();
  });

  it('navigates to AuthorSubmissionPage when /submissions/authors', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/authors']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(AuthorSubmissionPage)).toExist();

    done();
  });

  it('navigates to LiteratureSubmissionPage when /submissions/authors', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/literature']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(LiteratureSubmissionPage)).toExist();

    done();
  });

  it('navigates to AuthorUpdateSubmissionPage when /submissions/authors/:id', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/authors/1']}
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

  it('navigates to SubmissionSuccessPage when /submissions/success', async done => {
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
