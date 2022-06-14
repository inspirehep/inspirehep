import React from 'react';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { CONFERENCES } from '../../../common/routes';

export function ConferenceSubmissionSucessPage({
  cnum,
  recordId
}: any) {
  return (
    <SubmissionSuccess
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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

const stateToProps = (state: any) => ({
  cnum: state.submissions.getIn(['successData', 'cnum']),
  recordId: state.submissions.getIn(['successData', 'pid_value'])
});

export default connect(stateToProps)(ConferenceSubmissionSucessPage);
