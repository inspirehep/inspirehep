import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';

import { submit } from '../../../actions/submissions';
import { SEMINARS_PID_TYPE } from '../../../common/constants';
import SeminarSubmission from '../components/SeminarSubmission';
import { SEMINARS } from '../../../common/routes';
import SubmissionPage from '../../common/components/SubmissionPage';

function SeminarSubmissionPage({ error, onSubmit }) {
  return (
    <SubmissionPage
      title="Submit a new seminar"
      description={
        <span>
          This form allows you to submit a new seminar to INSPIRE. It will
          appear in the <Link to={`${SEMINARS}?q=`}> Seminar List</Link>{' '}
          immediately.
        </span>
      }
    >
      <SeminarSubmission error={error} onSubmit={onSubmit} />
    </SubmissionPage>
  );
}
SeminarSubmissionPage.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Map),
};

const stateToProps = state => ({
  error: state.submissions.get('submitError'),
});

const dispatchToProps = dispatch => ({
  async onSubmit(formData) {
    await dispatch(submit(SEMINARS_PID_TYPE, formData));
  },
});
export default connect(stateToProps, dispatchToProps)(SeminarSubmissionPage);
