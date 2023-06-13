import React, { useCallback } from 'react';
import { Map } from 'immutable';

import ContentBox from '../../common/components/ContentBox';
import ReferenceItem from './ReferenceItem';
import ErrorAlertOrChildren from '../../common/components/ErrorAlertOrChildren';
import EmptyOrChildren from '../../common/components/EmptyOrChildren';
import ListWithPagination from '../../common/components/ListWithPagination';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';

function ReferenceList({
  total,
  references,
  error,
  loading,
  query,
  onPageChange,
  onSizeChange,
  onEditReferenceClick,
  loggedIn,
}: {
  total?: number,
  references?: any[],
  error?: Map<string, any>,
  loading?: boolean,
  query?: any,
  onPageChange?: Function,
  onSizeChange?: Function,
  children?: any
  onEditReferenceClick?: Function,
  loggedIn?: boolean,
}) {
  const renderReferenceItem = useCallback(
    (reference, index) => (
      // reference data model doesn't have any identifier, thus we have hack for `key`
      // FIXME: find an proper key for reference item as index might cause bugs
      <ReferenceItem
        key={reference.getIn(['titles', 0, 'title']) || String(index)}
        reference={reference}
        reference_index={index}
        onEditReferenceClick={onEditReferenceClick}
        loggedIn={loggedIn}
      />
    ),
    [onEditReferenceClick, loggedIn]
  );

  const renderList = useCallback(
    () =>
      total && total > 0 ? (
        <ListWithPagination
          renderItem={renderReferenceItem}
          pageItems={references}
          onPageChange={onPageChange}
          onSizeChange={onSizeChange}
          total={total}
          page={query.page}
          pageSize={query.size}
        />
      ): <></>,
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
    <ContentBox>
      <LoadingOrChildren loading={loading}>
        <ErrorAlertOrChildren error={error}>
          <EmptyOrChildren data={references} title="0 References">
            {renderList()}
          </EmptyOrChildren>
        </ErrorAlertOrChildren>
      </LoadingOrChildren>
    </ContentBox>
  );
}

export default ReferenceList;
