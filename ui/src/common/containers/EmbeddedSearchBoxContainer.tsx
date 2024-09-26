import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import EmbeddedSearchBox from '../components/EmbeddedSearchBox';
import { searchQueryUpdate } from '../../actions/search';

const dispatchToProps = (dispatch: ActionCreator<Action>, { namespace }: { namespace: string }) => ({
  onSearch(value: string) {
    dispatch(searchQueryUpdate(namespace, { q: value }));
  },
});

export default connect(null, dispatchToProps)(EmbeddedSearchBox);
