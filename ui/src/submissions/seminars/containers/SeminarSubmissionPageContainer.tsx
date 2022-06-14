import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { Map } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';

import { submit } from '../../../actions/submissions';
import { SEMINARS_PID_TYPE } from '../../../common/constants';
import SeminarSubmission from '../components/SeminarSubmission';
import { SEMINARS } from '../../../common/routes';
import SubmissionPage from '../../common/components/SubmissionPage';

type SeminarSubmissionPageProps = {
    onSubmit: $TSFixMeFunction;
    error?: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function SeminarSubmissionPage({ error, onSubmit }: SeminarSubmissionPageProps) {
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

const stateToProps = (state: $TSFixMe) => ({
  error: state.submissions.get('submitError')
});

const dispatchToProps = (dispatch: $TSFixMe) => ({
  async onSubmit(formData: $TSFixMe) {
    await dispatch(submit(SEMINARS_PID_TYPE, formData));
  }
});
export default connect(stateToProps, dispatchToProps)(SeminarSubmissionPage);
