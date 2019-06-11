import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Row, Col } from 'antd';

import {
  fetchUpdateFormData,
  submitUpdate,
} from '../../../actions/submissions';
import { JOBS_PID_TYPE } from '../../../common/constants';
import JobSubmission from '../components/JobSubmission';

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
    // TODO: display updateFormDataError ?
    const { error, updateFormData, loadingUpdateFormData } = this.props;
    return (
      !loadingUpdateFormData && (
        <Row type="flex" justify="center">
          <Col className="mt3 mb3" xs={24} md={21} lg={16} xl={15} xxl={14}>
            <Row className="mb3 pa3 bg-white">
              <h3>Update a job opening</h3>
              All modifications will appear immediately.
            </Row>
            <Row>
              <Col>
                <JobSubmission
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

JobUpdateSubmissionPage.propTypes = {
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

export default connect(stateToProps, dispatchToProps)(JobUpdateSubmissionPage);
