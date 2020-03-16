import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Row, Col, Alert } from 'antd';

import {
  fetchUpdateFormData,
  submitUpdate,
} from '../../../actions/submissions';
import AuthorSubmission from '../components/AuthorSubmission';
import ExternalLink from '../../../common/components/ExternalLink';
import { AUTHORS_PID_TYPE } from '../../../common/constants';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';

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
    } = this.props;
    return (
      <Row type="flex" justify="center">
        <Col className="mt3 mb3" xs={24} md={21} lg={16} xl={15} xxl={14}>
          <Row className="mb3 pa3 bg-white">
            <Col span={24}>
              <h3>Update author</h3>
              This form allows you to update information of an existing author.
              All modifications are transferred to{' '}
              <ExternalLink href="//inspirehep.net/hepnames">
                inspirehep.net/hepnames
              </ExternalLink>{' '}
              upon approval.
            </Col>
          </Row>
          <LoadingOrChildren loading={loadingUpdateFormData}>
            <Row>
              <Col span={24}>
                {updateFormDataError ? (
                  <Alert
                    message={updateFormDataError.get('message')}
                    type="error"
                    showIcon
                  />
                ) : (
                  <AuthorSubmission
                    error={error}
                    onSubmit={this.onSubmit}
                    initialFormData={updateFormData}
                  />
                )}
              </Col>
            </Row>
          </LoadingOrChildren>
        </Col>
      </Row>
    );
  }
}

AuthorUpdateSubmissionPage.propTypes = {
  match: PropTypes.object.isRequired,
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
  AuthorUpdateSubmissionPage
);
