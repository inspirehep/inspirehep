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
import JobUpdateSubmissionSuccessPage from '../jobs/components/JobUpdateSubmissionSuccessPage';
import ConferenceSubmissionSuccessPageContainer from '../conferences/containers/ConferenceSubmissionSuccessPageContainer';
import ConferenceSubmissionPageContainer from '../conferences/containers/ConferenceSubmissionPageContainer';

describe('Submissions', () => {
  let element;

  // This is needed for the custom toolbar for the RichTextEditor in the JobSubmission.
  // Mount only renders components to div element and, in this case, we need to attach it to the DOM
  // because the custom toolbar uses DOM manipulation methods such as getElementById, classList.add and so on
  beforeAll(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  it('renders initial state', () => {
    const component = shallow(<Submissions />);
    expect(component).toMatchSnapshot();
  });

  it('navigates to AuthorSubmissionPageContainer when /submissions/authors', async () => {
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
  });

  it('navigates to LiteratureSubmissionPageContainer when /submissions/literature if whatever user', async () => {
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

    expect(wrapper.find(LiteratureSubmissionPageContainer)).toExist();
  });

  it('navigates to AuthorUpdateSubmissionPageContainer when /submissions/authors/:id', async () => {
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
  });

  it('navigates to JobSubmissionPageContainer when /submissions/jobs', async () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/submissions/jobs']} initialIndex={0}>
          <Submissions />
        </MemoryRouter>
      </Provider>,
      { attachTo: element }
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(JobSubmissionPageContainer)).toExist();
    wrapper.detach();
  });

  it('navigates to ConferenceSubmissionPageContainer when /submissions/conferences', async () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/conferences']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>,
      { attachTo: element }
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(ConferenceSubmissionPageContainer)).toExist();
    wrapper.detach();
  });

  it('navigates to JobUpdateSubmissionPageContainer when /submissions/jobs/:id', async () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/submissions/jobs/1']} initialIndex={0}>
          <Submissions />
        </MemoryRouter>
      </Provider>,
      { attachTo: element }
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(JobUpdateSubmissionPageContainer)).toExist();
    wrapper.detach();
  });

  it('navigates to SubmissionSuccessPage when /submissions/success', async () => {
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
  });

  it('navigates to SubmissionSuccessPage when /submissions/literature/new/success', async () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/literature/new/success']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(SubmissionSuccessPage)).toExist();
  });

  it('navigates to ConferenceSubmissionSuccessPageContainer when /submissions/conferences/new/success', async () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/conferences/new/success']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(ConferenceSubmissionSuccessPageContainer)).toExist();
  });

  it('navigates to SubmissionSuccessPage when /submissions/athors/new/success', async () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/authors/new/success']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(SubmissionSuccessPage)).toExist();
  });

  it('navigates to JobUpdateSubmissionSuccessPage when /submissions/jobs/1/success', async () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/jobs/1/success']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(JobUpdateSubmissionSuccessPage)).toExist();
  });

  it('navigates to SubmissionSuccessPage when /submissions/authors/1/success', async () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/authors/1/success']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();
    wrapper.update();

    expect(wrapper.find(SubmissionSuccessPage)).toExist();
  });
});
