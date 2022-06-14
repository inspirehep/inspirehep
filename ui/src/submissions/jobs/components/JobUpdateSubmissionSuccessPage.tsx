import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';

import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { JOBS } from '../../../common/routes';

type Props = {
    match: {
        [key: string]: $TSFixMe;
    };
};

class JobUpdateSubmissionSuccessPage extends Component<Props> {

  render() {
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

export default JobUpdateSubmissionSuccessPage;
