import React from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { Map } from 'immutable';
import { Action, ActionCreator } from 'redux';
import { Link } from 'react-router-dom';

import { submit } from '../../../actions/submissions';
import { SEMINARS_PID_TYPE } from '../../../common/constants';
import SeminarSubmission from '../components/SeminarSubmission';
import { SEMINARS } from '../../../common/routes';
import SubmissionPage from '../../common/components/SubmissionPage';

function SeminarSubmissionPage({
  error,
  onSubmit,
}: {
  error: Map<string, any>;
  onSubmit: Function;
}) {
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

const stateToProps = (state: RootStateOrAny) => ({
  error: state.submissions.get('submitError'),
});

const dispatchToProps = (dispatch: ActionCreator<Action<any>>) => ({
  async onSubmit(formData: any) {
    await dispatch(submit(SEMINARS_PID_TYPE, formData));
  },
});
export default connect(stateToProps, dispatchToProps)(SeminarSubmissionPage);
