import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';

import { submit } from '../../../actions/submissions';
import { JOBS_PID_TYPE } from '../../../common/constants';
import JobSubmission from '../components/JobSubmission';
import { JOBS } from '../../../common/routes';
import SubmissionPage from '../../common/components/SubmissionPage';

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
      <SubmissionPage
        title="Submit a new job opening"
        description={
          <span>
            This form allows you to advertise a new job opening. It will appear
            in the <Link to={`${JOBS}?q=`}>Jobs List</Link> upon approval.
          </span>
        }
      >
        <JobSubmission error={error} onSubmit={this.onSubmit} />
      </SubmissionPage>
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
