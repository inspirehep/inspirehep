import React, { useCallback, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import { LITERATURE_SEMINARS_NS } from '../../search/constants';
import { LOCAL_TIMEZONE } from '../../common/constants';
import SeminarItem from '../../seminars/components/SeminarItem';
import ResultsContainer from '../../common/containers/ResultsContainer';
import PaginationContainer from '../../common/containers/PaginationContainer';
import { searchBaseQueriesUpdate } from '../../actions/search';
import EmptyOrChildren from '../../common/components/EmptyOrChildren';

function LiteratureSeminars({ onBaseQueryChange, recordId, seminars }) {
  const baseQuery = useMemo(
    () => ({
      q: `literature_records.record.$ref:${recordId}`,
    }),
    [recordId]
  );

  useEffect(
    () => {
      onBaseQueryChange(LITERATURE_SEMINARS_NS, baseQuery);
    },
    [baseQuery, onBaseQueryChange]
  );

  const renderSeminarItem = useCallback(
    result => (
      <SeminarItem
        metadata={result.get('metadata')}
        selectedTimezone={LOCAL_TIMEZONE}
        enableActions={false}
      />
    ),
    []
  );

  return (
    <EmptyOrChildren data={seminars} title="0 Seminars">
      <ResultsContainer
        namespace={LITERATURE_SEMINARS_NS}
        renderItem={renderSeminarItem}
      />
      <PaginationContainer namespace={LITERATURE_SEMINARS_NS} />
    </EmptyOrChildren>
  );
}

LiteratureSeminars.propTypes = {
  onBaseQueryChange: PropTypes.func,
  recordId: PropTypes.string.isRequired,
  seminars: PropTypes.instanceOf(List).isRequired,
};

const stateToProps = state => ({
  seminars: state.search.getIn([
    'namespaces',
    LITERATURE_SEMINARS_NS,
    'results',
  ]),
});

const dispatchToProps = dispatch => ({
  onBaseQueryChange(namespace, baseQuery) {
    dispatch(searchBaseQueriesUpdate(namespace, { baseQuery }));
  },
});

export default connect(stateToProps, dispatchToProps)(LiteratureSeminars);
