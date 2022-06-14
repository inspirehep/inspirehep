import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { Map } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';

import { submit } from '../../../actions/submissions';
import { CONFERENCES_PID_TYPE } from '../../../common/constants';
import ConferenceSubmission from '../components/ConferenceSubmission';
import { CONFERENCES } from '../../../common/routes';
import SubmissionPage from '../../common/components/SubmissionPage';

type ConferenceSubmissionPageProps = {
    onSubmit: $TSFixMeFunction;
    error?: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function ConferenceSubmissionPage({ error, onSubmit }: ConferenceSubmissionPageProps) {
  return (
    <SubmissionPage
      title="Submit a new conference"
      description={
        <span>
          This form allows you to submit a new conference to INSPIRE. It will
          appear in the <Link to={`${CONFERENCES}?q=`}> Conference List</Link>{' '}
          immediately.
        </span>
      }
    >
      <ConferenceSubmission error={error} onSubmit={onSubmit} />
    </SubmissionPage>
  );
}

const stateToProps = (state: $TSFixMe) => ({
  error: state.submissions.get('submitError')
});

const dispatchToProps = (dispatch: $TSFixMe) => ({
  async onSubmit(formData: $TSFixMe) {
    await dispatch(submit(CONFERENCES_PID_TYPE, formData));
  }
});
export default connect(stateToProps, dispatchToProps)(ConferenceSubmissionPage);
