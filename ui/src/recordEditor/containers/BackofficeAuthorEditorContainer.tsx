import { legacy_connect as connect } from 'react-redux';

import { fetchAuthor } from '../../actions/recordEditor/record';
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

const stateToProps = (state: RootState) => ({
  author: state.recordEditor.getIn(['recordData', 'author']),
  error: state.recordEditor.getIn(['recordData', 'fetchAuthorError']),
  withRevisions: false as const,
});

const BackofficeAuthorEditorContainer = connect(stateToProps)(CommonEditor);

export default withRouteActionsDispatcher(BackofficeAuthorEditorContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: (id) => [
    resetEditor(),
    fetchAuthor(id!),
    fetchQueues(),
    fetchUsers(),
    fetchTickets(id!),
  ],
  loadingStateSelector: (state: RootState) =>
    !state.recordEditor.hasIn(['recordData', 'author', 'record']) &&
    !state.recordEditor.getIn(['recordData', 'fetchAuthorError']),
});
