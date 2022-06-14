import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
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

function SeminarUpdateSubmissionPage({
  error,
  updateFormData,
  loadingUpdateFormData,
  updateFormDataError,
  dispatch,
  match
}: any) {
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
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <LoadingOrChildren loading={loadingUpdateFormData}>
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  error: PropTypes.instanceOf(Map),
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  updateFormData: PropTypes.instanceOf(Map),
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  updateFormDataError: PropTypes.instanceOf(Map),
  loadingUpdateFormData: PropTypes.bool.isRequired,
};

const stateToProps = (state: any) => ({
  error: state.submissions.get('submitError'),
  updateFormData: state.submissions.get('initialData'),
  updateFormDataError: state.submissions.get('initialDataError'),
  loadingUpdateFormData: state.submissions.get('loadingInitialData')
});

const dispatchToProps = (dispatch: any) => ({
  dispatch
});

export default connect(stateToProps, dispatchToProps)(
  SeminarUpdateSubmissionPage
);
