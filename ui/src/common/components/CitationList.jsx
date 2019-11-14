import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import CitationItem from './CitationItem';
import ListWithPagination from './ListWithPagination';
import ContentBox from './ContentBox';
import ErrorAlertOrChildren from './ErrorAlertOrChildren';
import EmptyOrChildren from './EmptyOrChildren';
import { ErrorPropType } from '../propTypes';

function renderCitationItem(citation) {
  return (
    <CitationItem key={citation.get('control_number')} citation={citation} />
  );
}
function CitationList({
  total,
  citations,
  error,
  loading,
  onQueryChange,
  query,
}) {
  const onPageChange = useCallback(page => onQueryChange({ page }), [
    onQueryChange,
  ]);

  const renderList = useCallback(
    () =>
      total > 0 && (
        <ListWithPagination
          renderItem={renderCitationItem}
          pageItems={citations}
          onPageChange={onPageChange}
          total={total}
          page={query.page}
          pageSize={query.size}
        />
      ),
    [query.page, query.size, total, citations, onPageChange]
  );

  return (
    <ContentBox loading={loading}>
      <ErrorAlertOrChildren error={error}>
        <EmptyOrChildren data={citations} title="0 Citations">
          {renderList()}
        </EmptyOrChildren>
      </ErrorAlertOrChildren>
    </ContentBox>
  );
}
CitationList.propTypes = {
  total: PropTypes.number.isRequired,
  citations: PropTypes.instanceOf(List).isRequired,
  error: ErrorPropType,
  loading: PropTypes.bool.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  query: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default CitationList;
