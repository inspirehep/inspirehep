import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { SEMINARS } from '../../../common/routes';

export function SeminarSubmissionSuccessPage({ recordId }) {
  return (
    <SubmissionSuccess
      message={
        <span>
          Successfully submitted, thank you for the submission! See the seminar{' '}
          <Link to={`${SEMINARS}/${recordId}`}>here</Link>.
        </span>
      }
    />
  );
}

SeminarSubmissionSuccessPage.propTypes = {
  recordId: PropTypes.number.isRequired,
};

const stateToProps = state => ({
  recordId: state.submissions.getIn(['successData', 'pid_value']),
});

export default connect(stateToProps)(SeminarSubmissionSuccessPage);
