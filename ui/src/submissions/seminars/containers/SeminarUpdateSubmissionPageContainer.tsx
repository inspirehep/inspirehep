import React, { useCallback, useEffect } from 'react';
import { Action, ActionCreator } from 'redux';
import { connect, RootStateOrAny } from 'react-redux';
import { Map } from 'immutable';

import {
  fetchUpdateFormData,
  submitUpdate,
} from '../../../actions/submissions';
import { SEMINARS_PID_TYPE } from '../../../common/constants';
import SeminarSubmission from '../components/SeminarSubmission';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import SubmissionPage from '../../common/components/SubmissionPage';
import ErrorAlertOrChildren from '../../../common/components/ErrorAlertOrChildren';

function SeminarUpdateSubmissionPage({
  error,
  updateFormData,
  loadingUpdateFormData,
  updateFormDataError,
  dispatch,
  match,
}: {
  error: Map<string, any>;
  updateFormData: Map<string, any>;
  loadingUpdateFormData: boolean;
  updateFormDataError: Map<string, any>;
  dispatch: ActionCreator<Action<any>>;
  match: any;
}) {
  const recordId = match.params.id;
  const onSubmit = useCallback(
    async (formData) => {
      await dispatch(submitUpdate(SEMINARS_PID_TYPE, recordId, formData));
    },
    [dispatch, recordId]
  );
  useEffect(() => {
    dispatch(fetchUpdateFormData(SEMINARS_PID_TYPE, recordId));
  }, [dispatch, recordId]);
  return (
    <SubmissionPage
      title="Update a seminar"
      description="All modifications will appear immediately."
    >
      <LoadingOrChildren loading={loadingUpdateFormData}>
        <ErrorAlertOrChildren error={updateFormDataError}>
          <SeminarSubmission
            error={error}
            onSubmit={onSubmit}
            initialFormData={updateFormData}
          />
        </ErrorAlertOrChildren>
      </LoadingOrChildren>
    </SubmissionPage>
  );
}

const stateToProps = (state: RootStateOrAny) => ({
  error: state.submissions.get('submitError'),
  updateFormData: state.submissions.get('initialData'),
  updateFormDataError: state.submissions.get('initialDataError'),
  loadingUpdateFormData: state.submissions.get('loadingInitialData'),
});

const dispatchToProps = (dispatch: ActionCreator<Action<any>>) => ({
  dispatch,
});

export default connect(
  stateToProps,
  dispatchToProps
)(SeminarUpdateSubmissionPage);
