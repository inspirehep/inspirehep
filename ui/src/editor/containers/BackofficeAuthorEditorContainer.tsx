import { legacy_connect as connect } from 'react-redux';

import {
  fetchQueues,
  fetchTickets,
  fetchUsers,
} from '../../actions/editor/tickets';
import { RootState } from '../../types';
import withRouteActionsDispatcher from '../../common/withRouteActionsDispatcher';
import '../components/customTemplates/Templates.less';

import { resetEditor } from '../../actions/editor/common';
import CommonEditor from '../components/CommonEditor';
import {
  fetchAuthorWorkflow,
  saveAuthorWorkflow,
} from '../../actions/editor/workflow';
import prepareAuthorSchema from '../utils/prepareAuthorSchema';
import authorUiSchema from '../uiSchema/authorUiSchema';

const stateToProps = (state: RootState) => ({
  data: state.editor.getIn(['workflowData', 'author']).get('data'),
  schema: state.editor.getIn(['workflowData', 'schema'])
    ? prepareAuthorSchema(state.editor.getIn(['workflowData', 'schema']).toJS())
    : null,
  error:
    state.editor.getIn(['workflowData', 'fetchAuthorError']) ??
    state.editor.getIn(['workflowData', 'fetchSchemaError']),
  validationErrors: state.editor
    .getIn(['workflowData', 'author'])
    .get('validation_errors'),
  save: saveAuthorWorkflow,
  uiSchema: authorUiSchema,
  withRevisions: false as const,
});

const BackofficeAuthorEditorContainer = connect(stateToProps)(CommonEditor);

export default withRouteActionsDispatcher(BackofficeAuthorEditorContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: (id) => [
    resetEditor(),
    fetchAuthorWorkflow(id!),
    fetchQueues(),
    fetchUsers(),
    fetchTickets(id!),
  ],
  loadingStateSelector: (state: RootState) => {
    const fetchingAuthor =
      !state.editor.hasIn(['workflowData', 'author', 'data']) &&
      !state.editor.getIn(['workflowData', 'fetchAuthorError']);
    const fetchingAuthorFailed = !!state.editor.getIn([
      'workflowData',
      'fetchAuthorError',
    ]);
    const fetchingSchema =
      !state.editor.getIn(['workflowData', 'schema']) &&
      !state.editor.getIn(['workflowData', 'fetchSchemaError']);
    return fetchingAuthor || (!fetchingAuthorFailed && fetchingSchema);
  },
});
