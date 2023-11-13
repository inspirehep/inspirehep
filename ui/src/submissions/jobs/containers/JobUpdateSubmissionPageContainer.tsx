import React, { useEffect } from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { Map } from 'immutable';
import { ActionCreator, Action } from 'redux';

import {
  fetchUpdateFormData,
  submitUpdate,
} from '../../../actions/submissions';
import { JOBS_PID_TYPE } from '../../../common/constants';
import JobSubmission from '../components/JobSubmission';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import SubmissionPage from '../../common/components/SubmissionPage';
import ErrorAlertOrChildren from '../../../common/components/ErrorAlertOrChildren';

const JobUpdateSubmissionPage = ({
  match,
  dispatch,
  error,
  updateFormData,
  loadingUpdateFormData,
  updateFormDataError,
}: {
  match: object;
  dispatch: ActionCreator<Action<any>>;
  error: Map<string, any> | null;
  updateFormData: Map<string, any>;
  loadingUpdateFormData: boolean;
  updateFormDataError: Map<string, any>;
  isCatalogerLoggedIn: boolean;
}) => {
  const getRecordIdFromProps = (match: any) => match?.params?.id;

  const recordId = getRecordIdFromProps(match);

  useEffect(() => {
    dispatch(fetchUpdateFormData(JOBS_PID_TYPE, recordId));
  }, [dispatch, recordId]);

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

const mapStateToProps = (state: RootStateOrAny) => ({
  error: state.submissions.get('submitError'),
  updateFormData: state.submissions.get('initialData'),
  updateFormDataError: state.submissions.get('initialDataError'),
  loadingUpdateFormData: state.submissions.get('loadingInitialData'),
});

export default connect(mapStateToProps)(JobUpdateSubmissionPage);
