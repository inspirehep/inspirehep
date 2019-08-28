import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';
import { Row, Col } from 'antd';

import { submit } from '../../../actions/submissions';
import { JOBS_PID_TYPE } from '../../../common/constants';
import JobSubmission from '../components/JobSubmission';
import { JOBS } from '../../../common/routes';

class JobSubmissionPage extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  async onSubmit(formData) {
    const { dispatch } = this.props;
    await dispatch(submit(JOBS_PID_TYPE, formData));
  }

  render() {
    const { error } = this.props;
    return (
      <Row type="flex" justify="center">
        <Col className="mt3 mb3" xs={24} md={21} lg={16} xl={15} xxl={14}>
          <Row className="mb3 pa3 bg-white">
            <h3>Submit a new job opening</h3>
            This form allows you to advertise a new job opening. It will appear
            in the <Link to={`${JOBS}?q=`}>Jobs List</Link> upon approval.
          </Row>
          <Row>
            <Col>
              <JobSubmission error={error} onSubmit={this.onSubmit} />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

JobSubmissionPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Map),
};

const stateToProps = state => ({
  error: state.submissions.get('submitError'),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(JobSubmissionPage);
