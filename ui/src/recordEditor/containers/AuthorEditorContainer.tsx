import { legacy_connect as connect } from 'react-redux';

import {
  fetchAuthor,
  fetchAuthorRevisions,
  saveAuthor,
} from '../../actions/recordEditor/record';
import {
  fetchQueues,
  fetchTickets,
  fetchUsers,
} from '../../actions/recordEditor/tickets';
import { RootState } from '../../types';
import withRouteActionsDispatcher from '../../common/withRouteActionsDispatcher';
import '../components/customTemplates/Templates.less';
import './AuthorEditorContainer.less';
import { resetEditor } from '../../actions/recordEditor/common';
import CommonEditor from '../components/CommonEditor';
import prepareAuthorSchema from '../utils/prepareAuthorSchema';

const stateToProps = (state: RootState) => {
  const schemaFromState = state.recordEditor
    .getIn(['recordData', 'author'])
    .get('schema');
  return {
    authorData: state.recordEditor
      .getIn(['recordData', 'author'])
      .get('record')
      ?.get('metadata'),
    schema: schemaFromState
      ? prepareAuthorSchema(schemaFromState.toJS())
      : null,
    error: state.recordEditor.getIn(['recordData', 'fetchAuthorError']),
    save: saveAuthor,
    withRevisions: {
      authorRevisions: state.recordEditor.getIn([
        'recordData',
        'author_revisions',
      ]),
      currentRevision: state.recordEditor.getIn([
        'recordData',
        'current_author_revision',
      ]),
      revisionError: state.recordEditor.getIn(['recordData', 'revisionError']),
    },
  };
};

const AuthorEditorContainer = connect(stateToProps)(CommonEditor);

export default withRouteActionsDispatcher(AuthorEditorContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: (id) => [
    resetEditor(),
    fetchAuthor(id!),
    fetchAuthorRevisions(id!),
    fetchQueues(),
    fetchUsers(),
    fetchTickets(id!),
  ],
  loadingStateSelector: (state: RootState) =>
    !state.recordEditor.hasIn(['recordData', 'author', 'record']) &&
    !state.recordEditor.getIn(['recordData', 'fetchAuthorError']),
});
