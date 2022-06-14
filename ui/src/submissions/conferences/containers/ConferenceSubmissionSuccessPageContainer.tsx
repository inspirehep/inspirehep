import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { CONFERENCES } from '../../../common/routes';

type ConferenceSubmissionSucessPageProps = {
    cnum: string;
    recordId: number;
};

export function ConferenceSubmissionSucessPage({ cnum, recordId }: ConferenceSubmissionSucessPageProps) {
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

const stateToProps = (state: $TSFixMe) => ({
  cnum: state.submissions.getIn(['successData', 'cnum']),
  recordId: state.submissions.getIn(['successData', 'pid_value'])
});

export default connect(stateToProps)(ConferenceSubmissionSucessPage);
