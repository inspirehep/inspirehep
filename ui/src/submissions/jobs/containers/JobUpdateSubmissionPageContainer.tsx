import React, { useEffect } from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { Map } from 'immutable';

import {
  fetchUpdateFormData,
  submitUpdate,
} from '../../../actions/submissions';
import { JOBS_PID_TYPE } from '../../../common/constants';
import JobSubmission from '../components/JobSubmission';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import SubmissionPage from '../../common/components/SubmissionPage';
import ErrorAlertOrChildren from '../../../common/components/ErrorAlertOrChildren';

interface JobUpdateSubmissionPageProps {
  dispatch: ActionCreator<Action>;
  error: Map<string, any>;
  match: any;
  updateFormData: Map<string, any>;
  updateFormDataError: Map<string, any>;
  loadingUpdateFormData: boolean;
}

const JobUpdateSubmissionPage = (props: JobUpdateSubmissionPageProps) => {
  const { dispatch, error, updateFormData, loadingUpdateFormData, updateFormDataError } = props;

  const recordId = props.match.params.id;

  const fetchUpdateData = () => {
    dispatch(fetchUpdateFormData(JOBS_PID_TYPE, recordId));
  };

  useEffect(() => {
    fetchUpdateData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId]);

  const onSubmit = async (formData: any) => {
    await dispatch(submitUpdate(JOBS_PID_TYPE, recordId, formData));
  };

  return (
    <SubmissionPage
      title="Update a job opening"
      description="All modifications will appear immediately."
    >
      <LoadingOrChildren loading={loadingUpdateFormData}>
        <ErrorAlertOrChildren error={updateFormDataError}>
          <JobSubmission
            error={error}
            onSubmit={onSubmit}
            initialFormData={updateFormData}
          />
        </ErrorAlertOrChildren>
      </LoadingOrChildren>
    </SubmissionPage>
  );
};

const stateToProps = (state: RootStateOrAny) => ({
  error: state.submissions.get('submitError'),
  updateFormData: state.submissions.get('initialData'),
  updateFormDataError: state.submissions.get('initialDataError'),
  loadingUpdateFormData: state.submissions.get('loadingInitialData'),
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(JobUpdateSubmissionPage);
