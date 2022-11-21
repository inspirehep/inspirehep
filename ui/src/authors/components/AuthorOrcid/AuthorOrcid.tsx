import React from 'react';
import { Tooltip } from 'antd';

import './AuthorOrcid.less';
import orcidLogo from '../../../common/assets/orcid.svg';
import OrcidProfileLink from '../../../common/components/OrcidProfileLink';

const AuthorOrcid = ({ orcid }: { orcid: string }) => (
  <OrcidProfileLink className="__AuthorOrcid__" orcid={orcid}>
    <Tooltip title="ORCID">
      <img src={orcidLogo} alt="ORCID" />
    </Tooltip>
  </OrcidProfileLink>
);

export default AuthorOrcid;
