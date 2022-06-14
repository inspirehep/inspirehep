import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { Map } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';

import { submit } from '../../../actions/submissions';
import { JOBS_PID_TYPE } from '../../../common/constants';
import JobSubmission from '../components/JobSubmission';
import { JOBS } from '../../../common/routes';
import SubmissionPage from '../../common/components/SubmissionPage';

type JobSubmissionPageProps = {
    dispatch: $TSFixMeFunction;
    error?: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

class JobSubmissionPage extends Component<JobSubmissionPageProps> {

  constructor(props: JobSubmissionPageProps) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  async onSubmit(formData: $TSFixMe) {
    const { dispatch } = this.props;
    await dispatch(submit(JOBS_PID_TYPE, formData));
  }

  render() {
    const { error } = this.props;
    return (
      <SubmissionPage
        title="Submit a new job opening"
        description={
          <span>
            This form allows you to advertise a new job opening. It will appear
            in the <Link to={`${JOBS}?q=`}>Jobs List</Link> upon approval.
          </span>
        }
      >
        <JobSubmission error={error} onSubmit={this.onSubmit} />
      </SubmissionPage>
    );
  }
}

const stateToProps = (state: $TSFixMe) => ({
  error: state.submissions.get('submitError')
});

const dispatchToProps = (dispatch: $TSFixMe) => ({
  dispatch
});

export default connect(stateToProps, dispatchToProps)(JobSubmissionPage);
