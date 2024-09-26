import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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

class AuthorUpdateSubmissionPage extends Component {
  static getRecordIdFromProps(props) {
    return props.match.params.id;
  }

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.dispatch(fetchUpdateFormData(AUTHORS_PID_TYPE, this.recordId));
  }

  componentDidUpdate(prevProps) {
    const prevRecordId = AuthorUpdateSubmissionPage.getRecordIdFromProps(
      prevProps
    );
    if (this.recordId !== prevRecordId) {
      this.dispatch(fetchUpdateFormData(AUTHORS_PID_TYPE, this.recordId));
    }
  }

  async onSubmit(formData) {
    await this.dispatch(
      submitUpdate(AUTHORS_PID_TYPE, this.recordId, formData)
    );
  }

  get dispatch() {
    const { dispatch } = this.props;
    return dispatch;
  }

  get recordId() {
    return AuthorUpdateSubmissionPage.getRecordIdFromProps(this.props);
  }

  render() {
    const {
      error,
      updateFormData,
      loadingUpdateFormData,
      updateFormDataError,
      isCatalogerLoggedIn,
    } = this.props;
    return (
      <SubmissionPage
        title="Update author"
        description={
          <span>
            This form allows you to update information of an existing author.
            All modifications will appear immediately.
          </span>
        }
      >
        <LoadingOrChildren loading={loadingUpdateFormData}>
          <ErrorAlertOrChildren error={updateFormDataError}>
            <AuthorSubmission
              // TODO: use composition reduce or react-redux hook API to avoid prop-drilling
              isCatalogerLoggedIn={isCatalogerLoggedIn}
              // TODO: use composition instead
              isUpdate
              error={error}
              onSubmit={this.onSubmit}
              initialFormData={updateFormData}
            />
          </ErrorAlertOrChildren>
        </LoadingOrChildren>
      </SubmissionPage>
    );
  }
}

AuthorUpdateSubmissionPage.propTypes = {
  match: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  isCatalogerLoggedIn: PropTypes.bool.isRequired,
  error: PropTypes.instanceOf(Map),
  updateFormData: PropTypes.instanceOf(Map),
  updateFormDataError: PropTypes.instanceOf(Map),
  loadingUpdateFormData: PropTypes.bool.isRequired,
};

const stateToProps = state => ({
  error: state.submissions.get('submitError'),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
  updateFormData: state.submissions.get('initialData'),
  updateFormDataError: state.submissions.get('initialDataError'),
  loadingUpdateFormData: state.submissions.get('loadingInitialData'),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(
  AuthorUpdateSubmissionPage
);
