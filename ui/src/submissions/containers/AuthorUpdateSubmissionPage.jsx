import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import {
  fetchAuthorUpdateFormData,
  submitAuthorUpdate,
} from '../../actions/submissions';
import {
  authorSubmitErrorPath,
  authorUpdateDataPath,
  loadingAuthorUpdateDataPath,
} from '../../reducers/submissions';
import AuthorSubmission from '../components/AuthorSubmission';

class AuthorUpdateSubmissionPage extends Component {
  static getRecordIdFromProps(props) {
    return props.match.params.id;
  }

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    const recordId = this.getRecordId();
    this.props.dispatch(fetchAuthorUpdateFormData(recordId));
  }

  componentDidUpdate(prevProps) {
    const prevRecordId = AuthorUpdateSubmissionPage.getRecordIdFromProps(
      prevProps
    );
    const recordId = this.getRecordId();
    if (recordId !== prevRecordId) {
      this.props.dispatch(fetchAuthorUpdateFormData(recordId));
    }
  }

  async onSubmit(formData) {
    // TODO: submit update!
    const recordId = this.getRecordId();
    await this.props.dispatch(submitAuthorUpdate(formData, recordId));
  }

  getRecordId() {
    return AuthorUpdateSubmissionPage.getRecordIdFromProps(this.props);
  }

  render() {
    // TODO: display updateFormDataError ?
    const { error, updateFormData, loadingUpdateFormData } = this.props;
    return (
      !loadingUpdateFormData && (
        <AuthorSubmission
          error={error}
          onSubmit={this.onSubmit}
          initialFormData={updateFormData}
        />
      )
    );
  }
}

AuthorUpdateSubmissionPage.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired, // eslint-disable-line react/no-unused-prop-types
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Map), // eslint-disable-line react/require-default-props
  updateFormData: PropTypes.instanceOf(Map), // eslint-disable-line react/require-default-props
  loadingUpdateFormData: PropTypes.bool.isRequired,
};

const stateToProps = state => ({
  error: state.submissions.getIn(authorSubmitErrorPath),
  updateFormData: state.submissions.getIn(authorUpdateDataPath),
  loadingUpdateFormData: state.submissions.getIn(loadingAuthorUpdateDataPath),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(
  AuthorUpdateSubmissionPage
);
