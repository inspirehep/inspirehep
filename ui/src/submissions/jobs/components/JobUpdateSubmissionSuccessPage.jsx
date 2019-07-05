import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { JOBS } from '../../../common/routes';

class JobUpdateSubmissionSuccessPage extends Component {
  render() {
    const { match } = this.props;
    const { id } = match.params;
    return (
      <SubmissionSuccess
        message={
          <span>
            Successfully submitted, thank you for the submission! See the
            updates <Link to={`${JOBS}/${id}`}>here</Link>.
          </span>
        }
      />
    );
  }
}

JobUpdateSubmissionSuccessPage.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default JobUpdateSubmissionSuccessPage;
