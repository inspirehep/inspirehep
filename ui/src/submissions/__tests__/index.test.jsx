import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import { fromJS } from 'immutable';
import Loadable from 'react-loadable';

import { getStore, getStoreWithState } from '../../fixtures/store';
import Submissions from '..';
import AuthorSubmissionPageContainer from '../authors/containers/AuthorSubmissionPageContainer';
import SubmissionSuccessPage from '../common/components/SubmissionSuccessPage';
import AuthorUpdateSubmissionPageContainer from '../authors/containers/AuthorUpdateSubmissionPageContainer';
import LiteratureSubmissionPageContainer from '../literature/containers/LiteratureSubmissionPageContainer';
import JobUpdateSubmissionPageContainer from '../jobs/containers/JobUpdateSubmissionPageContainer';
import JobSubmissionPageContainer from '../jobs/containers/JobSubmissionPageContainer';

describe('Submissions', () => {
  it('renders initial state', () => {
    const component = shallow(<Submissions />);
    expect(component).toMatchSnapshot();
  });

  it('navigates to AuthorSubmissionPageContainer when /submissions/authors', async done => {
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

    expect(wrapper.find(AuthorSubmissionPageContainer)).toExist();

    done();
  });

  it('navigates to LiteratureSubmissionPageContainer when /submissions/literature if superuser', async done => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['superuser'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
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

    expect(wrapper.find(LiteratureSubmissionPageContainer)).toExist();

    done();
  });

  it('does not navigate to LiteratureSubmissionPageContainer when /submissions/literature if whatever user', async done => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['whatever'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
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

    expect(wrapper.find(LiteratureSubmissionPageContainer)).not.toExist();

    done();
  });

  it('navigates to AuthorUpdateSubmissionPageContainer when /submissions/authors/:id', async done => {
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

    expect(wrapper.find(AuthorUpdateSubmissionPageContainer)).toExist();

    done();
  });

  it('navigates to JobSubmissionPageContainer when /submissions/jobs', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/submissions/jobs']} initialIndex={0}>
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(JobSubmissionPageContainer)).toExist();

    done();
  });

  it('navigates to JobUpdateSubmissionPageContainer when /submissions/jobs/:id', async done => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/submissions/jobs/1']} initialIndex={0}>
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(JobUpdateSubmissionPageContainer)).toExist();

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
