import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ContentBox from '../../common/components/ContentBox';
import ReferenceItem from './ReferenceItem';
import ErrorAlertOrChildren from '../../common/components/ErrorAlertOrChildren';
import EmptyOrChildren from '../../common/components/EmptyOrChildren';
import { ErrorPropType } from '../../common/propTypes';
import ListWithPagination from '../../common/components/ListWithPagination';

function ReferenceList({
  total,
  references,
  error,
  loading,
  onQueryChange,
  query,
}) {
  const renderReferenceItem = useCallback(
    (reference, index) => (
      // reference data model doesn't have any identifier, thus we have hack for `key`
      // FIXME: find an proper key for reference item as index might cause bugs
      <ReferenceItem
        key={reference.getIn(['titles', 0, 'title']) || String(index)}
        reference={reference}
      />
    ),
    []
  );

  const onPageChange = useCallback(page => onQueryChange({ page }), [
    onQueryChange,
  ]);

  const renderList = useCallback(
    () =>
      total > 0 && (
        <ListWithPagination
          renderItem={renderReferenceItem}
          pageItems={references}
          onPageChange={onPageChange}
          total={total}
          page={query.page}
          pageSize={query.size}
        />
      ),
    [
      query.page,
      query.size,
      total,
      references,
      renderReferenceItem,
      onPageChange,
    ]
  );

  return (
    <ContentBox loading={loading}>
      <ErrorAlertOrChildren error={error}>
        <EmptyOrChildren data={references} title="0 References">
          {renderList()}
        </EmptyOrChildren>
      </ErrorAlertOrChildren>
    </ContentBox>
  );
}
ReferenceList.propTypes = {
  total: PropTypes.number.isRequired,
  references: PropTypes.instanceOf(List).isRequired,
  error: ErrorPropType,
  loading: PropTypes.bool.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  query: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default ReferenceList;
