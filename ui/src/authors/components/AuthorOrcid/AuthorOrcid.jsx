import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';

import './AuthorOrcid.scss';
import orcidLogo from '../../../common/orcid.svg';
import ExternalLink from '../../../common/components/ExternalLink';

class AuthorOrcid extends Component {
  render() {
    const { orcid } = this.props;
    const href = `//orcid.org/${orcid}`;
    return (
      <Tooltip title="ORCID">
        <ExternalLink className="__AuthorOrcid__" href={href}>
          <img src={orcidLogo} alt="ORCID" />
        </ExternalLink>
      </Tooltip>
    );
  }
}

AuthorOrcid.propTypes = {
  orcid: PropTypes.string.isRequired,
};

export default AuthorOrcid;
