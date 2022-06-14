import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AuthorizedContainer from '../../common/containers/AuthorizedContainer';
import { SUPERUSER_OR_CATALOGER } from '../../common/authorization';

class JobTitle extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'position' does not exist on type 'Readon... Remove this comment to see the full error message
    const { position, externalJobId } = this.props;
    return (
      <>
        {position}
        {externalJobId && (
          <AuthorizedContainer authorizedRoles={SUPERUSER_OR_CATALOGER}>
            <span> ({externalJobId})</span>
          </AuthorizedContainer>
        )}
      </>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
JobTitle.propTypes = {
  position: PropTypes.string.isRequired,
  externalJobId: PropTypes.string,
};

export default JobTitle;
