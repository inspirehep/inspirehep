import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Row, Col, Alert } from 'antd';

import {
  fetchUpdateFormData,
  submitUpdate,
} from '../../../actions/submissions';
import { SEMINARS_PID_TYPE } from '../../../common/constants';
import SeminarSubmission from '../components/SeminarSubmission';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';

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
    <Row type="flex" justify="center">
      <Col className="mt3 mb3" xs={24} md={21} lg={16} xl={15} xxl={14}>
        <Row className="mb3 pa3 bg-white">
          <Col span={24}>
            <h3>Update a seminar</h3>
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
                  <SeminarSubmission
                    error={error}
                    onSubmit={onSubmit}
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
