import { Action, ActionCreator } from 'redux';
import { legacy_connect as connect } from 'react-redux';
import { RootState } from '../types';
import { submitAuthorlist } from '../actions/authorlist';
import AuthorlistTool from './AuthorlistTool';

const stateToProps = (state: RootState) => ({
  loading: state.authorlist.get('loading'),
  authors: state.authorlist.get('authors'),
  warnings: state.authorlist.get('warnings'),
  error: state.authorlist.get('error'),
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  async onSubmit(authorlist: string) {
    dispatch(submitAuthorlist(authorlist));
  },
});
export default connect(stateToProps, dispatchToProps)(AuthorlistTool);
