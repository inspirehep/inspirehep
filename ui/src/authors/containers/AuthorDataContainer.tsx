import React, { useEffect } from 'react';
import { connect, RootStateOrAny } from 'react-redux';

import { Action, ActionCreator } from 'redux';
import { searchBaseQueriesUpdate } from '../../actions/search';
import { AUTHOR_DATA_NS } from '../../search/constants';
import DataSearchPageContainer from '../../data/containers/DataSearchPageContainer';

const AuthorData = ({
  authorFacetName,
  onBaseQueriesChange,
}: {
  authorFacetName: string;
  onBaseQueriesChange: (baseQueries: any) => void;
}) => {
  useEffect(() => {
    if (authorFacetName) {
      onBaseQueriesChange({
        baseQuery: {
          author: [authorFacetName],
        },
      });
    }
  }, [authorFacetName, onBaseQueriesChange]);

  return <DataSearchPageContainer namespace={AUTHOR_DATA_NS} />;
};

const stateToProps = (state: RootStateOrAny) => ({
  authorFacetName: state.authors.getIn([
    'data',
    'metadata',
    'facet_author_name',
  ]),
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onBaseQueriesChange(baseQueries: any) {
    dispatch(searchBaseQueriesUpdate(AUTHOR_DATA_NS, baseQueries));
  },
});

export default connect(stateToProps, dispatchToProps)(AuthorData);
