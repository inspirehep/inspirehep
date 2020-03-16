import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Row, Col, Alert } from 'antd';

import {
  fetchUpdateFormData,
  submitUpdate,
} from '../../../actions/submissions';
import { JOBS_PID_TYPE } from '../../../common/constants';
import JobSubmission from '../components/JobSubmission';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';

class JobUpdateSubmissionPage extends Component {
  static getRecordIdFromProps(props) {
    return props.match.params.id;
  }

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.dispatch(fetchUpdateFormData(JOBS_PID_TYPE, this.recordId));
  }

  componentDidUpdate(prevProps) {
    const prevRecordId = JobUpdateSubmissionPage.getRecordIdFromProps(
      prevProps
    );
    if (this.recordId !== prevRecordId) {
      this.dispatch(fetchUpdateFormData(JOBS_PID_TYPE, this.recordId));
    }
  }

  async onSubmit(formData) {
    await this.dispatch(submitUpdate(JOBS_PID_TYPE, this.recordId, formData));
  }

  get dispatch() {
    const { dispatch } = this.props;
    return dispatch;
  }

  get recordId() {
    return JobUpdateSubmissionPage.getRecordIdFromProps(this.props);
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
              <h3>Update a job opening</h3>
              All modifications will appear immediately.
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
                  <JobSubmission
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

JobUpdateSubmissionPage.propTypes = {
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

export default connect(stateToProps, dispatchToProps)(JobUpdateSubmissionPage);
