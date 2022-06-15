import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { JOBS } from '../../../common/routes';

class JobUpdateSubmissionSuccessPage extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'match' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { match } = this.props;
    const { id } = match.params;
    return (
      <SubmissionSuccess
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
JobUpdateSubmissionSuccessPage.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default JobUpdateSubmissionSuccessPage;
