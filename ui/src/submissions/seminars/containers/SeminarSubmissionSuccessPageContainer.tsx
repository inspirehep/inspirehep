import React from 'react';
import { Link } from 'react-router-dom';
import { connect, RootStateOrAny } from 'react-redux';

import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { SEMINARS } from '../../../common/routes';

export function SeminarSubmissionSuccessPage({
  recordId,
}: {
  recordId: number;
}) {
  return (
    <SubmissionSuccess
      message={
        <span>
          Successfully submitted, thank you for the submission! See the seminar{' '}
          <Link to={`${SEMINARS}/${recordId}`} className="submission-link">here</Link>.
        </span>
      }
    />
  );
}

const stateToProps = (state: RootStateOrAny) => ({
  recordId: state.submissions.getIn(['successData', 'pid_value']),
});

export default connect(stateToProps)(SeminarSubmissionSuccessPage);
