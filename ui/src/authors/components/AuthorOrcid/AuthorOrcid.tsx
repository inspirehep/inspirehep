import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';

import './AuthorOrcid.scss';
import orcidLogo from '../../../common/orcid.svg';
import OrcidProfileLink from '../../../common/components/OrcidProfileLink';

class AuthorOrcid extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'orcid' does not exist on type 'Readonly<... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
AuthorOrcid.propTypes = {
  orcid: PropTypes.string.isRequired,
};

export default AuthorOrcid;
