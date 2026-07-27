import {
  fetchAuthor,
  fetchAuthorRevisions,
} from '../../../actions/recordEditor';
import { RootState } from '../../../types';
import { connect } from 'react-redux';
import withRouteActionsDispatcher from '../../../common/withRouteActionsDispatcher';
import Header from '../components/Header';
import { List, Map } from 'immutable';
import { useParams } from 'react-router-dom';

interface AuthorEditorProps {
  author: Map<string, any>;
  revisions: List<Map<string, any>>;
}

const AuthorEditor = ({ author, revisions }: AuthorEditorProps) => {
  const { id } = useParams<{ id: string }>();
  const authorName = author
    .get('record')
    .get('metadata')
    .get('name')
    .get('preferred_name');

  const lastRevision = revisions.get(0);

  return (
    <div style={{ position: 'relative' }}>
      <Header
        recordId={id}
        lastRevision={
          lastRevision && {
            date: lastRevision.get('updated'),
            userEmail: lastRevision.get('user_email'),
          }
        }
      />
      Author editor: {authorName}
    </div>
  );
};

const stateToProps = (state: RootState) => ({
  author: state.recordEditor.get('author'),
  revisions: state.recordEditor.get('author_revisions'),
});

const AuthorEditorContainer = connect(stateToProps)(AuthorEditor);

export default withRouteActionsDispatcher(AuthorEditorContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: (id) => [fetchAuthor(id), fetchAuthorRevisions(id)],
  loadingStateSelector: (state: RootState) =>
    !state.recordEditor.hasIn(['author', 'record']),
});
