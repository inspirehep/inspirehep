import React from 'react';
import { Link } from 'react-router-dom';
import { connect, MapDispatchToPropsParam } from 'react-redux';

import { submit } from '../../../actions/submissions';
import SubmissionPage from '../../common/components/SubmissionPage';
import { JournalSubmission } from '../components/JournalSubmission';
import { JOURNALS } from '../../../common/routes';
import { JOURNALS_PID_TYPE } from '../../../common/constants';

export interface RootState {
  submissions: {
    getIn: (values: string[]) => string;
  };
}

export interface JournalFormData {
  short_title: string;
  journal_title: string;
}

export const JournalSubmissionPage = ({
  error,
  onSubmit,
}: { error: string } & {
  onSubmit(formData: JournalFormData): Promise<void>;
}) => (
  <SubmissionPage
    title="Suggest journal"
    description={
      <span>
        This form allows you to create a new journal record. It will appear in
        the <Link to={JOURNALS}>Journals List</Link> immediately.
      </span>
    }
  >
    <JournalSubmission error={error} onSubmit={onSubmit} />
  </SubmissionPage>
);

const stateToProps = (state: RootState) => ({
  error: state.submissions.getIn(['submitError', 'message']),
});

const dispatchToProps = (dispatch: MapDispatchToPropsParam<any, any>) => ({
  async onSubmit(formData: JournalFormData) {
    await dispatch(submit(JOURNALS_PID_TYPE, formData));
  },
});

export default connect(stateToProps, dispatchToProps)(JournalSubmissionPage);
