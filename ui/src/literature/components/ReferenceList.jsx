import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, Map } from 'immutable';

import ClientPaginatedList from '../../common/components/ClientPaginatedList';
import ContentBox from '../../common/components/ContentBox';
import ReferenceItem from './ReferenceItem';
import ErrorAlertOrChildren from '../../common/components/ErrorAlertOrChildren';

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

  renderList() {
    const { references } = this.props;
    return (
      references && (
        <ClientPaginatedList
          items={references}
          renderItem={ReferenceList.renderReferenceItem}
        />
      )
    );
  }

  render() {
    const { loading, error } = this.props;
    return (
      <ContentBox loading={loading}>
        <ErrorAlertOrChildren error={error}>
          {this.renderList()}
        </ErrorAlertOrChildren>
      </ContentBox>
    );
  }
}

ReferenceList.propTypes = {
  references: PropTypes.instanceOf(List),
  error: PropTypes.instanceOf(Map),
  loading: PropTypes.bool,
};

ReferenceList.defaultProps = {
  references: null,
  error: null,
  loading: false,
};

export default ReferenceList;
