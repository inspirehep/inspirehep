import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import PaginatedList from '../../common/components/PaginatedList';
import ReferenceItem from './ReferenceItem';

class ReferenceList extends Component {
  render() {
    const { references, loading } = this.props;
    return (
      references && (
        <PaginatedList
          title="References"
          items={references}
          loading={loading}
          renderItem={(reference, index, page) => (
            // reference data model doesn't have any identifier, thus we have hack for `key`
            <ReferenceItem
              key={
                reference.getIn(['titles', 0, 'title']) || String(page * index)
              }
              reference={reference}
            />
          )}
        />
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
