import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Row, Col } from 'antd';

import {
  fetchAuthorUpdateFormData,
  submitAuthorUpdate,
} from '../../../actions/submissions';
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
    this.dispatch(fetchAuthorUpdateFormData(this.recordId));
  }

  componentDidUpdate(prevProps) {
    const prevRecordId = AuthorUpdateSubmissionPage.getRecordIdFromProps(
      prevProps
    );
    if (this.recordId !== prevRecordId) {
      this.dispatch(fetchAuthorUpdateFormData(this.recordId));
    }
  }

  async onSubmit(formData) {
    await this.dispatch(submitAuthorUpdate(formData, this.recordId));
  }

  get dispatch() {
    const { dispatch } = this.props;
    return dispatch;
  }

  get recordId() {
    return AuthorUpdateSubmissionPage.getRecordIdFromProps(this.props);
  }

  render() {
    // TODO: display updateFormDataError ?
    const { error, updateFormData, loadingUpdateFormData } = this.props;
    return (
      !loadingUpdateFormData && (
        <Row type="flex" justify="center">
          <Col className="mt3 mb3" span={14}>
            <Row>
              <Col>
                <AuthorSubmission
                  error={error}
                  onSubmit={this.onSubmit}
                  initialFormData={updateFormData}
                />
              </Col>
            </Row>
          </Col>
        </Row>
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
  error: state.submissions.get('submitError'),
  updateFormData: state.submissions.get('initialData'),
  loadingUpdateFormData: state.submissions.get('loadingInitialData'),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(
  AuthorUpdateSubmissionPage
);
