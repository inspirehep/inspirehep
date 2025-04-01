import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import Loadable from 'react-loadable';

import { getStore, getStoreWithState } from '../../fixtures/store';
import Submissions from '..';

describe('Submissions', () => {
  let element;

  // This is needed for the custom toolbar for the RichTextEditor in the JobSubmission.
  // Mount only renders components to div element and, in this case, we need to attach it to the DOM
  // because the custom toolbar uses DOM manipulation methods such as getElementById, classList.add and so on
  beforeAll(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  const store = getStoreWithState({
    user: fromJS({
      loggedIn: true,
      data: {
        roles: ['cataloger'],
      },
    }),
  });

  // GENERIC SUBMISSION SUCCESS PAGE
  it('navigates to SubmissionSuccessPage when /submissions/success', async () => {
    const { asFragment, getByTestId } = render(
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

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('submission-success-page')).toBeInTheDocument();
  });

  // AUTHOR SUBMISSION
  it('navigates to AuthorSubmissionPageContainer when /submissions/authors and renders correctly', async () => {
    const { asFragment, getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/authors']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('author-submission-page')).toBeInTheDocument();
  });

  it('navigates to AuthorUpdateSubmissionPageContainer when /submissions/authors/:id and renders correctly', async () => {
    const { asFragment, getByTestId } = render(
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

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('author-update-submission-page')).toBeInTheDocument();
  });

  it.only('navigates to SubmissionSuccessPage when /submissions/authors/new/success', async () => {
    const { asFragment, getByTestId } = render(
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

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('submission-success-page')).toBeInTheDocument();
  });

  it('navigates to SubmissionSuccessPage when /submissions/authors/1/success', async () => {
    const { asFragment, getByTestId } = render(
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

    expect(asFragment()).toMatchSnapshot();
    expect(
      getByTestId('author-update-submission-success-page')
    ).toBeInTheDocument();
  });

  // LITERATURE SUBMISSION
  it('navigates to LiteratureSubmissionPageContainer when /submissions/literature if whatever user and renders correctly', async () => {
    const { asFragment, getByTestId } = render(
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

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('literature-submission-page')).toBeInTheDocument();
  });

  it('navigates to SubmissionSuccessPage when /submissions/literature/new/success', async () => {
    const { asFragment, getByTestId } = render(
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

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('submission-success-page')).toBeInTheDocument();
  });

  // JOBS SUBMISSION
  it('navigates to JobSubmissionPageContainer when /submissions/jobs', async () => {
    const { asFragment, getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/submissions/jobs']} initialIndex={0}>
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('job-submission-page')).toBeInTheDocument();
  });

  it('navigates to JobUpdateSubmissionPageContainer when /submissions/jobs/:id', async () => {
    const { asFragment, getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/submissions/jobs/1']} initialIndex={0}>
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('job-update-submission-page')).toBeInTheDocument();
  });

  it('navigates to JobUpdateSubmissionSuccessPage when /submissions/jobs/1/success', async () => {
    const { asFragment, getByTestId } = render(
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

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('job-submission-success-page')).toBeInTheDocument();
  });

  // CONFERENCE SUBMISSION
  it('navigates to ConferenceSubmissionPageContainer when /submissions/conferences', async () => {
    const { asFragment, getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/conferences']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('conference-submission-page')).toBeInTheDocument();
  });

  it('navigates to ConferenceSubmissionSuccessPageContainer when /submissions/conferences/new/success', async () => {
    const { asFragment, getByTestId } = render(
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

    expect(asFragment()).toMatchSnapshot();
    expect(
      getByTestId('conference-submission-success-page')
    ).toBeInTheDocument();
  });

  // SEMINAR SUBMISSION
  it('navigates to SeminarSubmissionPageContainer when /submissions/seminars', async () => {
    const { asFragment, getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/seminars']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('seminar-submission-page')).toBeInTheDocument();
  });

  it('navigates to SeminarUpdateSubmissionPageContainer when /submissions/seminars/:id', async () => {
    const { asFragment, getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/seminars/1']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('seminar-update-submission-page')).toBeInTheDocument();
  });

  it('navigates to SeminarSubmissionSuccessPageContainer when /submissions/seminars/new/success', async () => {
    const { asFragment, getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/seminars/new/success']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('seminar-submission-success-page')).toBeInTheDocument();
  });

  it('navigates to SeminarSubmissionSuccessPageContainer when /submissions/seminars/1/success', async () => {
    const { asFragment, getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={['/submissions/seminars/1/success']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('seminar-submission-success-page')).toBeInTheDocument();
  });

  // EXPERIMENT SUBMISSION
  it('navigates to ExperimentSubmissionPageContainer when /submissions/experiments', async () => {
    const { asFragment, getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={['/submissions/experiments']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('experiment-submission-page')).toBeInTheDocument();
  });

  // JOURNAL SUBMISSION
  it('navigates to JournalSubmissionPageContainer when /submissions/journals', async () => {
    const { asFragment, getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={['/submissions/journals']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('journal-submission-page')).toBeInTheDocument();
  });

  // INSTITUTION SUBMISSION
  it('navigates to InstitutuinsSubmissionPageContainer when /submissions/institutions', async () => {
    const { asFragment, getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={['/submissions/institutions']}
          initialIndex={0}
        >
          <Submissions />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('institution-submission-page')).toBeInTheDocument();
  });
});
