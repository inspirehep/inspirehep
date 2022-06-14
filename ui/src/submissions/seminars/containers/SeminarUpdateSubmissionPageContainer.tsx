import React, { useCallback, useEffect } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
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

type SeminarUpdateSubmissionPageProps = {
    match: {
        [key: string]: $TSFixMe;
    };
    dispatch: $TSFixMeFunction;
    error?: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
    updateFormData?: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
    updateFormDataError?: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
    loadingUpdateFormData: boolean;
};

function SeminarUpdateSubmissionPage({ error, updateFormData, loadingUpdateFormData, updateFormDataError, dispatch, match, }: SeminarUpdateSubmissionPageProps) {
  const recordId = match.params.id;
  const onSubmit = useCallback(
    async formData => {
      await dispatch(submitUpdate(SEMINARS_PID_TYPE, recordId, formData));
    },
    [dispatch, recordId]
  );
  useEffect(
    () => {
      dispatch(fetchUpdateFormData(SEMINARS_PID_TYPE, recordId));
    },
    [dispatch, recordId]
  );
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

const stateToProps = (state: $TSFixMe) => ({
  error: state.submissions.get('submitError'),
  updateFormData: state.submissions.get('initialData'),
  updateFormDataError: state.submissions.get('initialDataError'),
  loadingUpdateFormData: state.submissions.get('loadingInitialData')
});

const dispatchToProps = (dispatch: $TSFixMe) => ({
  dispatch
});

export default connect(stateToProps, dispatchToProps)(
  SeminarUpdateSubmissionPage
);
