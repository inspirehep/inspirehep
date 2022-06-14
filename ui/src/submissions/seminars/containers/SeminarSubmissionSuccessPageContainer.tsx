import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { SEMINARS } from '../../../common/routes';

type SeminarSubmissionSuccessPageProps = {
    recordId: number;
};

export function SeminarSubmissionSuccessPage({ recordId }: SeminarSubmissionSuccessPageProps) {
  return (
    <SubmissionSuccess
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      message={
        <span>
          Successfully submitted, thank you for the submission! See the seminar{' '}
          <Link to={`${SEMINARS}/${recordId}`}>here</Link>.
        </span>
      }
    />
  );
}

const stateToProps = (state: $TSFixMe) => ({
  recordId: state.submissions.getIn(['successData', 'pid_value'])
});

export default connect(stateToProps)(SeminarSubmissionSuccessPage);
