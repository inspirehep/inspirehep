import React from 'react';
import { Action, ActionCreator } from 'redux';
import { connect, RootStateOrAny } from 'react-redux';
import { Link } from 'react-router-dom';

import { submit } from '../../../actions/submissions';
import { JOBS_PID_TYPE } from '../../../common/constants';
import JobSubmission from '../components/JobSubmission';
import { JOBS } from '../../../common/routes';
import SubmissionPage from '../../common/components/SubmissionPage';

function JobSubmissionPage(props: any) {
  const { error, onSubmit } = props;
  return (
    <SubmissionPage
      title="Submit a new job opening"
      description={
        <span>
          This form allows you to advertise a new job opening. It will appear in
          the <Link to={`${JOBS}?q=`}>Jobs List</Link> upon approval.
        </span>
      }
    >
      <JobSubmission error={error} onSubmit={onSubmit} />
    </SubmissionPage>
  );
}

const stateToProps = (state: RootStateOrAny) => ({
  error: state.submissions.get('submitError'),
});

const dispatchToProps = (dispatch: ActionCreator<Action<any>>) => ({
  async onSubmit(formData: any) {
    await dispatch(submit(JOBS_PID_TYPE, formData));
  },
});

export default connect(stateToProps, dispatchToProps)(JobSubmissionPage);
