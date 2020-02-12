import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';

import './AuthorOrcid.scss';
import orcidLogo from '../../../common/orcid.svg';
import OrcidProfileLink from '../../../common/components/OrcidProfileLink';

class AuthorOrcid extends Component {
  render() {
    const { orcid } = this.props;
    return (
      <Tooltip title="ORCID">
        <OrcidProfileLink className="__AuthorOrcid__" orcid={orcid}>
          <img src={orcidLogo} alt="ORCID" />
        </OrcidProfileLink>
      </Tooltip>
    );
  }
}

AuthorOrcid.propTypes = {
  orcid: PropTypes.string.isRequired,
};

export default AuthorOrcid;
