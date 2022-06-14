import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { Map } from 'immutable';

import {
  fetchUpdateFormData,
  submitUpdate,
} from '../../../actions/submissions';
import { JOBS_PID_TYPE } from '../../../common/constants';
import JobSubmission from '../components/JobSubmission';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import SubmissionPage from '../../common/components/SubmissionPage';
import ErrorAlertOrChildren from '../../../common/components/ErrorAlertOrChildren';

type JobUpdateSubmissionPageProps = {
    match: {
        [key: string]: $TSFixMe;
    };
    dispatch: $TSFixMeFunction;
    error?: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
    updateFormData?: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
    updateFormDataError?: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
    loadingUpdateFormData: boolean;
};

class JobUpdateSubmissionPage extends Component<JobUpdateSubmissionPageProps> {

  static getRecordIdFromProps(props: $TSFixMe) {
    return props.match.params.id;
  }

  constructor(props: JobUpdateSubmissionPageProps) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.dispatch(fetchUpdateFormData(JOBS_PID_TYPE, this.recordId));
  }

  componentDidUpdate(prevProps: JobUpdateSubmissionPageProps) {
    const prevRecordId = JobUpdateSubmissionPage.getRecordIdFromProps(
      prevProps
    );
    if (this.recordId !== prevRecordId) {
      this.dispatch(fetchUpdateFormData(JOBS_PID_TYPE, this.recordId));
    }
  }

  async onSubmit(formData: $TSFixMe) {
    await this.dispatch(submitUpdate(JOBS_PID_TYPE, this.recordId, formData));
  }

  get dispatch() {
    const { dispatch } = this.props;
    return dispatch;
  }

  get recordId() {
    return JobUpdateSubmissionPage.getRecordIdFromProps(this.props);
  }

  render() {
    const {
      error,
      updateFormData,
      loadingUpdateFormData,
      updateFormDataError,
    } = this.props;
    return (
      <SubmissionPage
        title="Update a job opening"
        description="All modifications will appear immediately."
      >
        <LoadingOrChildren loading={loadingUpdateFormData}>
          <ErrorAlertOrChildren error={updateFormDataError}>
            <JobSubmission
              error={error}
              onSubmit={this.onSubmit}
              initialFormData={updateFormData}
            />
          </ErrorAlertOrChildren>
        </LoadingOrChildren>
      </SubmissionPage>
    );
  }
}

const stateToProps = (state: $TSFixMe) => ({
  error: state.submissions.get('submitError'),
  updateFormData: state.submissions.get('initialData'),
  updateFormDataError: state.submissions.get('initialDataError'),
  loadingUpdateFormData: state.submissions.get('loadingInitialData')
});

const dispatchToProps = (dispatch: $TSFixMe) => ({
  dispatch
});

export default connect(stateToProps, dispatchToProps)(JobUpdateSubmissionPage);
