import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AuthorizedContainer from '../../common/containers/AuthorizedContainer';
import { SUPERUSER_OR_CATALOGER } from '../../common/authorization';

class JobTitle extends Component {
  render() {
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

JobTitle.propTypes = {
  position: PropTypes.string.isRequired,
  externalJobId: PropTypes.string,
};

export default JobTitle;
