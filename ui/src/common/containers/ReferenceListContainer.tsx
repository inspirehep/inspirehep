import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import {
  fetchLiteratureReferences,
  setCurateDrawerVisibility,
} from '../../actions/literature';
import { setScrollElement } from '../../actions/ui';
import ReferenceList from '../../literature/components/ReferenceList';
import { LITERATURE_REFERENCES_NS } from '../../search/constants';
import { convertSomeImmutablePropsToJS } from '../immutableToJS';
import { castPropToNumber } from '../utils';

const stateToProps = (state: RootStateOrAny) => ({
  loading: state.literature.get('loadingReferences'),
  references: state.literature.get('references'),
  error: state.literature.get('errorReferences'),
  total: state.literature.get('totalReferences'),
  query: {
    size: castPropToNumber(
      state.search.getIn([
        'namespaces',
        LITERATURE_REFERENCES_NS,
        'query',
        'size',
      ])
    ),
    page: castPropToNumber(state.literature.get('pageReferences')),
  },
  baseQuery: state.search.getIn([
    'namespaces',
    LITERATURE_REFERENCES_NS,
    'baseQuery',
  ]),
  loggedIn: state.user.get('loggedIn'),
});

const dispatchToProps = (
  dispatch: ActionCreator<Action>,
  ownProps: { recordId: number }
) => ({
  onPageChange(page: number, size: number) {
    const { recordId } = ownProps;
    dispatch(fetchLiteratureReferences(recordId, { size, page: String(page) }));
  },

  onSizeChange(page: number, size: number) {
    const { recordId } = ownProps;
    dispatch(fetchLiteratureReferences(recordId, { size, page: '1' }));
  },

  onEditReferenceClick(referenceId: number) {
    dispatch(setCurateDrawerVisibility(referenceId));
  },
  
  setScrollElement(element: string) {
    dispatch(setScrollElement(element));
  },
});

export default connect(
  stateToProps,
  dispatchToProps
)(convertSomeImmutablePropsToJS(ReferenceList, ['query']));
