import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList, { SEPARATOR_AND } from './InlineList';
import AuthorAffiliation from './AuthorAffiliation';
import { getInstitutionName } from '../utils';

class AuthorAffiliationList extends Component {
  static renderAffiliation(affiliation) {
    return <AuthorAffiliation affiliation={affiliation} />;
  }

  render() {
    const { affiliations } = this.props;
    if (affiliations) {
      return (
        <InlineList
          wrapperClassName="di"
          separator={SEPARATOR_AND}
          items={affiliations}
          renderItem={AuthorAffiliationList.renderAffiliation}
          extractKey={getInstitutionName}
        />
      );
    }
    return null;
  }
}

AuthorAffiliationList.propTypes = {
  affiliations: PropTypes.instanceOf(List),
};

AuthorAffiliationList.defaultProps = {
  affiliations: null,
};

export default AuthorAffiliationList;
