import { legacy_connect as connect } from 'react-redux';

import {
  fetchRecord,
  fetchRecordRevisions,
  saveAuthor,
} from '../../actions/editor/record';
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
import prepareAuthorSchema from '../utils/prepareAuthorSchema';
import { getUiSchema } from '../utils/getUiSchema';

const stateToProps = (state: RootState) => {
  const schemaFromState = state.editor
    .getIn(['recordData', 'record'])
    .get('schema');
  const recordMetadata = state.editor
    .getIn(['recordData', 'record'])
    .get('record')
    ?.get('metadata');
  return {
    data: recordMetadata,
    schema: schemaFromState
      ? prepareAuthorSchema(schemaFromState.toJS())
      : null,
    error: state.editor.getIn(['recordData', 'fetchRecordError']),
    save: saveAuthor,
    withRevisions: {
      revisions: state.editor.getIn(['recordData', 'record_revisions']),
      currentRevision: state.editor.getIn([
        'recordData',
        'current_record_revision',
      ]),
      revisionError: state.editor.getIn(['recordData', 'revisionError']),
    },
    uiSchema: getUiSchema(
      recordMetadata?.get('$schema'),
      recordMetadata?.getIn(['document_type', 0])
    ),
  };
};

const RecordEditorContainer = connect(stateToProps)(CommonEditor);

export default withRouteActionsDispatcher(RecordEditorContainer, {
  routeParamSelector: ({ id, type }) => `${type}/${id}`,
  routeActions: (param) => {
    const [type, id] = param.split('/');
    return [
      resetEditor(),
      fetchRecord(type, id),
      fetchRecordRevisions(type, id),
      fetchQueues(),
      fetchUsers(),
      fetchTickets(id),
    ];
  },
  loadingStateSelector: (state: RootState) =>
    !state.editor.hasIn(['recordData', 'record', 'record']) &&
    !state.editor.getIn(['recordData', 'fetchRecordError']),
});
