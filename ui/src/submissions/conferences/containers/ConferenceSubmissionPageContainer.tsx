import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';

import { submit } from '../../../actions/submissions';
import { CONFERENCES_PID_TYPE } from '../../../common/constants';
import ConferenceSubmission from '../components/ConferenceSubmission';
import { CONFERENCES } from '../../../common/routes';
import SubmissionPage from '../../common/components/SubmissionPage';

function ConferenceSubmissionPage({ error, onSubmit }) {
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
  error: PropTypes.instanceOf(Map),
};

const stateToProps = state => ({
  error: state.submissions.get('submitError'),
});

const dispatchToProps = dispatch => ({
  async onSubmit(formData) {
    await dispatch(submit(CONFERENCES_PID_TYPE, formData));
  },
});
export default connect(stateToProps, dispatchToProps)(ConferenceSubmissionPage);
