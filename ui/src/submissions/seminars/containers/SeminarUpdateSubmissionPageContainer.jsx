import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
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

function SeminarUpdateSubmissionPage({
  error,
  updateFormData,
  loadingUpdateFormData,
  updateFormDataError,
  dispatch,
  match,
}) {
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

SeminarUpdateSubmissionPage.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Map),
  updateFormData: PropTypes.instanceOf(Map),
  updateFormDataError: PropTypes.instanceOf(Map),
  loadingUpdateFormData: PropTypes.bool.isRequired,
};

const stateToProps = state => ({
  error: state.submissions.get('submitError'),
  updateFormData: state.submissions.get('initialData'),
  updateFormDataError: state.submissions.get('initialDataError'),
  loadingUpdateFormData: state.submissions.get('loadingInitialData'),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(
  SeminarUpdateSubmissionPage
);
