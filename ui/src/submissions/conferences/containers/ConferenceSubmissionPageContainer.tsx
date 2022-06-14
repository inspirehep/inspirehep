import React from 'react';
import PropTypes from 'prop-types';
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

function ConferenceSubmissionPage({
  error,
  onSubmit
}: any) {
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
ConferenceSubmissionPage.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  error: PropTypes.instanceOf(Map),
};

const stateToProps = (state: any) => ({
  error: state.submissions.get('submitError')
});

const dispatchToProps = (dispatch: any) => ({
  async onSubmit(formData: any) {
    await dispatch(submit(CONFERENCES_PID_TYPE, formData));
  }
});
export default connect(stateToProps, dispatchToProps)(ConferenceSubmissionPage);
