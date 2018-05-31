import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import PaginatedList from '../../common/components/PaginatedList';
import ReferenceItem from './ReferenceItem';

class ReferenceList extends Component {
  render() {
    const { references } = this.props;
    return (
      references && (
        <PaginatedList
          title="References"
          items={references}
          renderItem={reference => (
            <ReferenceItem key={reference.get('title')} reference={reference} />
          )}
        />
      )
    );
  }
}

ReferenceList.propTypes = {
  references: PropTypes.instanceOf(List),
};

ReferenceList.defaultProps = {
  references: null,
};

export default ReferenceList;
