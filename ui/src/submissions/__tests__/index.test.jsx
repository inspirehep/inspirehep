import { fromJS } from 'immutable';
import { Route, Routes } from 'react-router-dom';

import { renderWithProviders } from '../../fixtures/render';
import { getStore } from '../../fixtures/store';
import { SUBMISSIONS } from '../../common/routes';
import Submissions from '..';

const renderSubmissions = (route, store) =>
  renderWithProviders(
    <Routes>
      <Route path={`${SUBMISSIONS}/*`} element={<Submissions />} />
    </Routes>,
    { store, route }
  );

describe('Submissions', () => {
  let element;

  // This is needed for the custom toolbar for the RichTextEditor in the JobSubmission.
  // Mount only renders components to div element and, in this case, we need to attach it to the DOM
  // because the custom toolbar uses DOM manipulation methods such as getElementById, classList.add and so on
  beforeAll(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  const store = getStore({
    user: fromJS({
      loggedIn: true,
      data: {
        roles: ['cataloger'],
      },
    }),
  });

  // GENERIC SUBMISSION SUCCESS PAGE
  it('navigates to SubmissionSuccessPage when /submissions/success', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/success'
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('submission-success-page')).toBeInTheDocument();
  });

  // AUTHOR SUBMISSION
  it('navigates to AuthorSubmissionPageContainer when /submissions/authors and renders correctly', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/authors'
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('author-submission-page')).toBeInTheDocument();
  });

  it('navigates to AuthorUpdateSubmissionPageContainer when /submissions/authors/:id and renders correctly', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/authors/1'
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('author-update-submission-page')).toBeInTheDocument();
  });

  it('navigates to SubmissionSuccessPage when /submissions/authors/new/success', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/authors/new/success'
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('submission-success-page')).toBeInTheDocument();
  });

  it('navigates to SubmissionSuccessPage when /submissions/authors/1/success', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/authors/1/success'
    );

    expect(asFragment()).toMatchSnapshot();
    expect(
      getByTestId('author-update-submission-success-page')
    ).toBeInTheDocument();
  });

  // LITERATURE SUBMISSION
  it('navigates to LiteratureSubmissionPageContainer when /submissions/literature if whatever user and renders correctly', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/literature',
      store
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('literature-submission-page')).toBeInTheDocument();
  });

  it('navigates to SubmissionSuccessPage when /submissions/literature/new/success', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/literature/new/success'
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('submission-success-page')).toBeInTheDocument();
  });

  // JOBS SUBMISSION
  it('navigates to JobSubmissionPageContainer when /submissions/jobs', () => {
    const { asFragment, getByTestId } = renderSubmissions('/submissions/jobs');

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('job-submission-page')).toBeInTheDocument();
  });

  it('navigates to JobUpdateSubmissionPageContainer when /submissions/jobs/:id', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/jobs/1'
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('job-update-submission-page')).toBeInTheDocument();
  });

  it('navigates to JobUpdateSubmissionSuccessPage when /submissions/jobs/1/success', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/jobs/1/success'
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('job-submission-success-page')).toBeInTheDocument();
  });

  // CONFERENCE SUBMISSION
  it('navigates to ConferenceSubmissionPageContainer when /submissions/conferences', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/conferences'
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('conference-submission-page')).toBeInTheDocument();
  });

  it('navigates to ConferenceSubmissionSuccessPageContainer when /submissions/conferences/new/success', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/conferences/new/success'
    );

    expect(asFragment()).toMatchSnapshot();
    expect(
      getByTestId('conference-submission-success-page')
    ).toBeInTheDocument();
  });

  // SEMINAR SUBMISSION
  it('navigates to SeminarSubmissionPageContainer when /submissions/seminars', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/seminars'
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('seminar-submission-page')).toBeInTheDocument();
  });

  it('navigates to SeminarUpdateSubmissionPageContainer when /submissions/seminars/:id', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/seminars/1'
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('seminar-update-submission-page')).toBeInTheDocument();
  });

  it('navigates to SeminarSubmissionSuccessPageContainer when /submissions/seminars/new/success', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/seminars/new/success'
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('seminar-submission-success-page')).toBeInTheDocument();
  });

  it('navigates to SeminarSubmissionSuccessPageContainer when /submissions/seminars/1/success', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/seminars/1/success'
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('seminar-submission-success-page')).toBeInTheDocument();
  });

  // EXPERIMENT SUBMISSION
  it('navigates to ExperimentSubmissionPageContainer when /submissions/experiments', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/experiments',
      store
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('experiment-submission-page')).toBeInTheDocument();
  });

  // JOURNAL SUBMISSION
  it('navigates to JournalSubmissionPageContainer when /submissions/journals', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/journals',
      store
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('journal-submission-page')).toBeInTheDocument();
  });

  // INSTITUTION SUBMISSION
  it('navigates to InstitutuinsSubmissionPageContainer when /submissions/institutions', () => {
    const { asFragment, getByTestId } = renderSubmissions(
      '/submissions/institutions',
      store
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('institution-submission-page')).toBeInTheDocument();
  });
});
