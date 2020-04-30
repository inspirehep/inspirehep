import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';
import { Row, Col } from 'antd';

import { submit } from '../../../actions/submissions';
import { SEMINARS_PID_TYPE } from '../../../common/constants';
import SeminarSubmission from '../components/SeminarSubmission';
import { SEMINARS } from '../../../common/routes';

function SeminarSubmissionPage({ error, onSubmit }) {
  return (
    <Row type="flex" justify="center">
      <Col className="mt3 mb3" xs={24} md={21} lg={16} xl={15} xxl={14}>
        <Row className="mb3 pa3 bg-white">
          <Col span={24}>
            <h3>Submit a new conference</h3>
            This form allows you to submit a new seminar to INSPIRE. It will
            appear in the <Link to={`${SEMINARS}?q=`}> Seminar List</Link>{' '}
            immediately.
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <SeminarSubmission error={error} onSubmit={onSubmit} />
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
SeminarSubmissionPage.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Map),
};

const stateToProps = state => ({
  error: state.submissions.get('submitError'),
});

const dispatchToProps = dispatch => ({
  async onSubmit(formData) {
    await dispatch(submit(SEMINARS_PID_TYPE, formData));
  },
});
export default connect(stateToProps, dispatchToProps)(SeminarSubmissionPage);
