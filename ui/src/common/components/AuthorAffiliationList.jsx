import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ExternalLink from './ExternalLink';
import InlineList from './InlineList';

class AuthorAffiliationList extends Component {
  static renderAffiliation(affiliation) {
    const affiliationHref = `//inspirehep.net/search?cc=Institutions&p=institution:"${affiliation}"`;
    return (
      <ExternalLink className="secondary-link" href={affiliationHref}>
        {affiliation}
      </ExternalLink>
    );
  }

  render() {
    const { affiliations } = this.props;
    if (affiliations) {
      return (
        <InlineList
          wrapperClassName="di"
          separateItemsClassName="separate-items-with-and"
          items={affiliations}
          renderItem={AuthorAffiliationList.renderAffiliation}
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
