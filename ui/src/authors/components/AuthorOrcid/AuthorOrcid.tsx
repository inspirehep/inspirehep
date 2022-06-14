import React, { Component } from 'react';
import { Tooltip } from 'antd';

import './AuthorOrcid.scss';
import orcidLogo from '../../../common/orcid.svg';
import OrcidProfileLink from '../../../common/components/OrcidProfileLink';

type Props = {
    orcid: string;
};

class AuthorOrcid extends Component<Props> {

  render() {
    const { orcid } = this.props;
    return (
      <OrcidProfileLink className="__AuthorOrcid__" orcid={orcid}>
        <Tooltip title="ORCID">
          <img src={orcidLogo} alt="ORCID" />
        </Tooltip>
      </OrcidProfileLink>
    );
  }
}

export default AuthorOrcid;
