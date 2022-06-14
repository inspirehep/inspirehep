import React, { useCallback } from 'react';
import { List } from 'immutable';

import ContentBox from '../../common/components/ContentBox';
import ReferenceItem from './ReferenceItem';
import ErrorAlertOrChildren from '../../common/components/ErrorAlertOrChildren';
import EmptyOrChildren from '../../common/components/EmptyOrChildren';
import { ErrorPropType } from '../../common/propTypes';
import ListWithPagination from '../../common/components/ListWithPagination';

type Props = {
    total: number;
    references: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    // @ts-expect-error ts-migrate(2749) FIXME: 'ErrorPropType' refers to a value, but is being us... Remove this comment to see the full error message
    error?: ErrorPropType;
    loading: boolean;
    onQueryChange: $TSFixMeFunction;
    query: {
        [key: string]: $TSFixMe;
    };
};

function ReferenceList({ total, references, error, loading, onQueryChange, query, }: Props) {
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

  const onSizeChange = useCallback(
    (page, size) => onQueryChange({ size, page: '1' }),
    [onQueryChange]
  );

  const renderList = useCallback(
    () =>
      total > 0 && (
        <ListWithPagination
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
      <ErrorAlertOrChildren error={error}>
        <EmptyOrChildren data={references} title="0 References">
          {renderList()}
        </EmptyOrChildren>
      </ErrorAlertOrChildren>
    </ContentBox>
  );
}

export default ReferenceList;
