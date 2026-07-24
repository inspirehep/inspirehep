import { fetchAuthor } from '../../actions/recordEditor';
import { RootState } from '../../types';
import { connect } from 'react-redux';
import withRouteActionsDispatcher from '../../common/withRouteActionsDispatcher';

interface AuthorEditorProps {
  author: Map<string, any>;
}

const AuthorEditor = ({ author }: AuthorEditorProps) => {
  const authorName = author
    .get('record')
    .get('metadata')
    .get('name')
    .get('preferred_name');

  return <div>Author editor: {authorName}</div>;
};

const stateToProps = (state: RootState) => ({
  author: state.recordEditor.get('author'),
});

const AuthorEditorContainer = connect(stateToProps)(AuthorEditor);

export default withRouteActionsDispatcher(AuthorEditorContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: (id) => [fetchAuthor(id)],
  loadingStateSelector: (state: RootState) =>
    !state.recordEditor.hasIn(['author', 'record']),
});
