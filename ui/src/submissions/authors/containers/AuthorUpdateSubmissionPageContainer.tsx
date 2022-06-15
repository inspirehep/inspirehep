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
  static getRecordIdFromProps(props: any) {
    return props.match.params.id;
  }

  constructor(props: any) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.dispatch(fetchUpdateFormData(AUTHORS_PID_TYPE, this.recordId));
  }

  componentDidUpdate(prevProps: any) {
    const prevRecordId = AuthorUpdateSubmissionPage.getRecordIdFromProps(
      prevProps
    );
    if (this.recordId !== prevRecordId) {
      this.dispatch(fetchUpdateFormData(AUTHORS_PID_TYPE, this.recordId));
    }
  }

  async onSubmit(formData: any) {
    await this.dispatch(
      submitUpdate(AUTHORS_PID_TYPE, this.recordId, formData)
    );
  }

  get dispatch() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'dispatch' does not exist on type 'Readon... Remove this comment to see the full error message
    const { dispatch } = this.props;
    return dispatch;
  }

  get recordId() {
    return AuthorUpdateSubmissionPage.getRecordIdFromProps(this.props);
  }

  render() {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'Readonly<... Remove this comment to see the full error message
      error,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'updateFormData' does not exist on type '... Remove this comment to see the full error message
      updateFormData,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'loadingUpdateFormData' does not exist on... Remove this comment to see the full error message
      loadingUpdateFormData,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'updateFormDataError' does not exist on t... Remove this comment to see the full error message
      updateFormDataError,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'isCatalogerLoggedIn' does not exist on t... Remove this comment to see the full error message
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
        {/* @ts-ignore */}
        <LoadingOrChildren loading={loadingUpdateFormData}>
          {/* @ts-ignore */}
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
AuthorUpdateSubmissionPage.propTypes = {
  match: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  isCatalogerLoggedIn: PropTypes.bool.isRequired,
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
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
  updateFormData: state.submissions.get('initialData'),
  updateFormDataError: state.submissions.get('initialDataError'),
  loadingUpdateFormData: state.submissions.get('loadingInitialData')
});

const dispatchToProps = (dispatch: any) => ({
  dispatch
});

export default connect(stateToProps, dispatchToProps)(
  AuthorUpdateSubmissionPage
);
