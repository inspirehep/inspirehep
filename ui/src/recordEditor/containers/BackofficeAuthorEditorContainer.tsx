import { legacy_connect as connect } from 'react-redux';

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
import {
  fetchAuthorWorkflow,
  saveAuthorWorkflow,
} from '../../actions/recordEditor/workflow';
import prepareAuthorSchema from '../utils/prepareAuthorSchema';

const stateToProps = (state: RootState) => ({
  authorData: state.recordEditor.getIn(['workflowData', 'author']).get('data'),
  schema: state.recordEditor.getIn(['workflowData', 'schema'])
    ? prepareAuthorSchema(
        state.recordEditor.getIn(['workflowData', 'schema']).toJS()
      )
    : null,
  error:
    state.recordEditor.getIn(['workflowData', 'fetchAuthorError']) ??
    state.recordEditor.getIn(['workflowData', 'fetchSchemaError']),
  validationErrors: state.recordEditor
    .getIn(['workflowData', 'author'])
    .get('validation_errors'),
  save: saveAuthorWorkflow,
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
      !state.recordEditor.hasIn(['workflowData', 'author', 'data']) &&
      !state.recordEditor.getIn(['workflowData', 'fetchAuthorError']);
    const fetchingAuthorFailed = !!state.recordEditor.getIn([
      'workflowData',
      'fetchAuthorError',
    ]);
    const fetchingSchema =
      !state.recordEditor.getIn(['workflowData', 'schema']) &&
      !state.recordEditor.getIn(['workflowData', 'fetchSchemaError']);
    return fetchingAuthor || (!fetchingAuthorFailed && fetchingSchema);
  },
});
