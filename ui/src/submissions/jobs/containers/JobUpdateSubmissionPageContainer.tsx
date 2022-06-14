import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

class JobUpdateSubmissionPage extends Component {
  static getRecordIdFromProps(props: any) {
    return props.match.params.id;
  }

  constructor(props: any) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.dispatch(fetchUpdateFormData(JOBS_PID_TYPE, this.recordId));
  }

  componentDidUpdate(prevProps: any) {
    const prevRecordId = JobUpdateSubmissionPage.getRecordIdFromProps(
      prevProps
    );
    if (this.recordId !== prevRecordId) {
      this.dispatch(fetchUpdateFormData(JOBS_PID_TYPE, this.recordId));
    }
  }

  async onSubmit(formData: any) {
    await this.dispatch(submitUpdate(JOBS_PID_TYPE, this.recordId, formData));
  }

  get dispatch() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'dispatch' does not exist on type 'Readon... Remove this comment to see the full error message
    const { dispatch } = this.props;
    return dispatch;
  }

  get recordId() {
    return JobUpdateSubmissionPage.getRecordIdFromProps(this.props);
  }

  render() {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'Readonly<... Remove this comment to see the full error message
      error,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'updateFormData' does not exist on type '... Remove this comment to see the full error message
      updateFormData,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'loadingUpdateFormData' does not exist on... Remove this comment to see the full error message
      loadingUpdateFormData,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'updateFormDataError' does not exist on t... Remove this comment to see the full error message
      updateFormDataError,
    } = this.props;
    return (
      <SubmissionPage
        title="Update a job opening"
        description="All modifications will appear immediately."
      >
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <LoadingOrChildren loading={loadingUpdateFormData}>
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
JobUpdateSubmissionPage.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  dispatch: PropTypes.func.isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  error: PropTypes.instanceOf(Map),
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  updateFormData: PropTypes.instanceOf(Map),
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  updateFormDataError: PropTypes.instanceOf(Map),
  loadingUpdateFormData: PropTypes.bool.isRequired,
};

const stateToProps = (state: any) => ({
  error: state.submissions.get('submitError'),
  updateFormData: state.submissions.get('initialData'),
  updateFormDataError: state.submissions.get('initialDataError'),
  loadingUpdateFormData: state.submissions.get('loadingInitialData')
});

const dispatchToProps = (dispatch: any) => ({
  dispatch
});

export default connect(stateToProps, dispatchToProps)(JobUpdateSubmissionPage);
