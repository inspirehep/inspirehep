import React from 'react';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { Map } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';

import { submit } from '../../../actions/submissions';
import { SEMINARS_PID_TYPE } from '../../../common/constants';
import SeminarSubmission from '../components/SeminarSubmission';
import { SEMINARS } from '../../../common/routes';
import SubmissionPage from '../../common/components/SubmissionPage';

function SeminarSubmissionPage({
  error,
  onSubmit
}: any) {
  return (
    <SubmissionPage
      title="Submit a new seminar"
      description={
        <span>
          This form allows you to submit a new seminar to INSPIRE. It will
          appear in the <Link to={`${SEMINARS}?q=`}> Seminar List</Link>{' '}
          immediately.
        </span>
      }
    >
      <SeminarSubmission error={error} onSubmit={onSubmit} />
    </SubmissionPage>
  );
}
SeminarSubmissionPage.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  error: PropTypes.instanceOf(Map),
};

const stateToProps = (state: any) => ({
  error: state.submissions.get('submitError')
});

const dispatchToProps = (dispatch: any) => ({
  async onSubmit(formData: any) {
    await dispatch(submit(SEMINARS_PID_TYPE, formData));
  }
});
export default connect(stateToProps, dispatchToProps)(SeminarSubmissionPage);
