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
  query
}: any) {
  const renderReferenceItem = useCallback(
    (reference, index) => (
      // reference data model doesn't have any identifier, thus we have hack for `key`
      // FIXME: find an proper key for reference item as index might cause bugs
      <ReferenceItem
        key={reference.getIn(['titles', 0, 'title']) || String(index)}
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        reference={reference}
      />
    ),
    []
  );

  const onPageChange = useCallback(page => onQueryChange({ page }), [
    onQueryChange,
  ]);

  const onSizeChange = useCallback(
    (page, size) => onQueryChange({ size, page: '1' }),
    [onQueryChange]
  );

  const renderList = useCallback(
    () =>
      total > 0 && (
        <ListWithPagination
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ renderItem: (reference: any, index: any) =... Remove this comment to see the full error message
          renderItem={renderReferenceItem}
          pageItems={references}
          onPageChange={onPageChange}
          onSizeChange={onSizeChange}
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
      onSizeChange,
    ]
  );

  return (
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    <ContentBox loading={loading}>
      {/* @ts-ignore */}
      <ErrorAlertOrChildren error={error}>
        {/* @ts-ignore */}
        <EmptyOrChildren data={references} title="0 References">
          {renderList()}
        </EmptyOrChildren>
      </ErrorAlertOrChildren>
    </ContentBox>
  );
}
ReferenceList.propTypes = {
  total: PropTypes.number.isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  references: PropTypes.instanceOf(List).isRequired,
  error: ErrorPropType,
  loading: PropTypes.bool.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  query: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default ReferenceList;
