import React, { useEffect } from 'react';
import { Action, ActionCreator } from 'redux';
import { connect, RootStateOrAny } from 'react-redux';
import { Map } from 'immutable';

import {
  fetchUpdateFormData,
  submitUpdate,
} from '../../../actions/submissions';
import AuthorSubmission from '../components/AuthorSubmission';
import { AUTHORS_PID_TYPE } from '../../../common/constants';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import SubmissionPage from '../../common/components/SubmissionPage';
import ErrorAlertOrChildren from '../../../common/components/ErrorAlertOrChildren';
import { isCataloger } from '../../../common/authorization';

const AuthorUpdateSubmissionPage = ({
  match,
  dispatch,
  error,
  updateFormData,
  loadingUpdateFormData,
  updateFormDataError,
  isCatalogerLoggedIn,
}: {
  match: object;
  dispatch: ActionCreator<Action<any>>;
  error: Map<string, any> | null;
  updateFormData: Map<string, any>;
  loadingUpdateFormData: boolean;
  updateFormDataError: Map<string, any>;
  isCatalogerLoggedIn: boolean;
}) => {
  const getRecordIdFromProps = (match: any) => {
    return match?.params?.id;
  };
  
  const recordId = getRecordIdFromProps(match);

  useEffect(() => {
    dispatch(fetchUpdateFormData(AUTHORS_PID_TYPE, recordId));
  }, [dispatch, recordId]);

  const onSubmit = async (formData: any) => {
    await dispatch(submitUpdate(AUTHORS_PID_TYPE, recordId, formData));
  };

  return (
    <SubmissionPage
      title="Update author"
      description={
        <span>
          This form allows you to update information of an existing author. All
          modifications will appear immediately.
        </span>
      }
    >
      <LoadingOrChildren loading={loadingUpdateFormData}>
        <ErrorAlertOrChildren error={updateFormDataError}>
          <AuthorSubmission
            isCatalogerLoggedIn={isCatalogerLoggedIn}
            isUpdate
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
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
  updateFormData: state.submissions.get('initialData'),
  updateFormDataError: state.submissions.get('initialDataError'),
  loadingUpdateFormData: state.submissions.get('loadingInitialData'),
});

export default connect(mapStateToProps)(AuthorUpdateSubmissionPage);
