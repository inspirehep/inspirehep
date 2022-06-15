import React from 'react';
import PropTypes from 'prop-types';
import AuthorizedContainer from '../../common/containers/AuthorizedContainer';
import { SUPERUSER_OR_CATALOGER } from '../../common/authorization';

function JobTitle(props: any) {
    const { position, externalJobId } = props;
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

JobTitle.propTypes = {
  position: PropTypes.string.isRequired,
  externalJobId: PropTypes.string,
};

export default JobTitle;
