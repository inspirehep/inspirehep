import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { AUTHORS } from '../../../common/routes';

export function AuthorUpdateSuccessPage({ recordId }) {
  return (
    <SubmissionSuccess
      message={
        <span>
          Successfully submitted, thank you! See the author profile{' '}
          <Link to={`${AUTHORS}/${recordId}`}>here</Link>.
            All proposed updates are reviewed by INSPIRE and further updates might be necessary to insure the best performance of the INSPIRE database.
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

export default connect(stateToProps)(AuthorUpdateSuccessPage);
