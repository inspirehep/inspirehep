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
      <OrcidProfileLink className="__AuthorOrcid__" orcid={orcid}>
        <Tooltip title="ORCID">
          <img src={orcidLogo} alt="ORCID" />
        </Tooltip>
      </OrcidProfileLink>
    );
  }
}

AuthorOrcid.propTypes = {
  orcid: PropTypes.string.isRequired,
};

export default AuthorOrcid;
