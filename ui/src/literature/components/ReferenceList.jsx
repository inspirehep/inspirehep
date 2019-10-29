import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, Map } from 'immutable';

import ClientPaginatedList from '../../common/components/ClientPaginatedList';
import ContentBox from '../../common/components/ContentBox';
import ReferenceItem from './ReferenceItem';
import ErrorAlertOrChildren from '../../common/components/ErrorAlertOrChildren';
import EmptyOrChildren from '../../common/components/EmptyOrChildren';

class ReferenceList extends Component {
  static renderReferenceItem(reference, index) {
    return (
      // reference data model doesn't have any identifier, thus we have hack for `key`
      // FIXME: find an proper key for reference item as index might cause bugs
      <ReferenceItem
        key={reference.getIn(['titles', 0, 'title']) || String(index)}
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
    const { loading, error, references } = this.props;
    return (
      <ContentBox loading={loading}>
        <ErrorAlertOrChildren error={error}>
          <EmptyOrChildren data={references} description="0 References">
            {this.renderList()}
          </EmptyOrChildren>
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
