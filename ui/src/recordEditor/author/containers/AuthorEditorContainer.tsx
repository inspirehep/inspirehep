import { legacy_connect as connect } from 'react-redux';
import { List, Map } from 'immutable';

import {
  fetchAuthor,
  fetchAuthorRevisions,
} from '../../../actions/recordEditor';
import { RootState } from '../../../types';
import withRouteActionsDispatcher from '../../../common/withRouteActionsDispatcher';
import Header from '../components/Header';

interface AuthorEditorProps {
  author: Map<string, any>;
  revisions: List<Map<string, any>>;
}

const AuthorEditor = ({ author, revisions }: AuthorEditorProps) => {
  const authorName = author
    .get('record')
    .get('metadata')
    .get('name')
    .get('preferred_name');

  const lastRevision = revisions.get(0);

  return (
    <div style={{ position: 'relative' }}>
      <Header
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
  routeActions: (id) => [fetchAuthor(id!), fetchAuthorRevisions(id!)],
  loadingStateSelector: (state: RootState) =>
    !state.recordEditor.hasIn(['author', 'record']),
});
