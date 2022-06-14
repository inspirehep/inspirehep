import React, { Component } from 'react';
import AuthorizedContainer from '../../common/containers/AuthorizedContainer';
import { SUPERUSER_OR_CATALOGER } from '../../common/authorization';

type Props = {
    position: string;
    externalJobId?: string;
};

class JobTitle extends Component<Props> {

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

export default JobTitle;
