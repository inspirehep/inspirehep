import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { CONFERENCES } from '../../../common/routes';

export function ConferenceSubmissionSucessPage({ cnum, recordId }) {
  return (
    <SubmissionSuccess
      message={
        <span>
          Successfully submitted, thank you for the submission! See the
          conference ({cnum}){' '}
          <Link to={`${CONFERENCES}/${recordId}`}>here</Link>.
        </span>
      }
    />
  );
}

ConferenceSubmissionSucessPage.propTypes = {
  cnum: PropTypes.string.isRequired,
  recordId: PropTypes.number.isRequired,
};

const stateToProps = state => ({
  cnum: state.submissions.getIn(['successData', 'cnum']),
  recordId: state.submissions.getIn(['successData', 'pid_value']),
});

export default connect(stateToProps)(ConferenceSubmissionSucessPage);
