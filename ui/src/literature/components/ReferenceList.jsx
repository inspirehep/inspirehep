import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ClientPaginatedList from '../../common/components/ClientPaginatedList';
import ContentBox from '../../common/components/ContentBox';
import ReferenceItem from './ReferenceItem';

class ReferenceList extends Component {
  static renderReferenceItem(reference, index, page) {
    return (
      // reference data model doesn't have any identifier, thus we have hack for `key`
      <ReferenceItem
        key={reference.getIn(['titles', 0, 'title']) || String(index * page)}
        reference={reference}
      />
    );
  }

  render() {
    const { references, loading } = this.props;
    return (
      references && (
        <ContentBox title={`References (${references.size})`} loading={loading}>
          <ClientPaginatedList
            items={references}
            loading={loading}
            renderItem={ReferenceList.renderReferenceItem}
          />
        </ContentBox>
      )
    );
  }
}

ReferenceList.propTypes = {
  references: PropTypes.instanceOf(List),
  loading: PropTypes.bool,
};

ReferenceList.defaultProps = {
  references: null,
  loading: false,
};

export default ReferenceList;
