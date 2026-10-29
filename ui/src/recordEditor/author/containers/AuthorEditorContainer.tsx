import { legacy_connect as connect } from 'react-redux';
import { List, Map } from 'immutable';
import { Form } from '@rjsf/antd';
import FormType from '@rjsf/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isEqual } from 'lodash';
import { flushSync } from 'react-dom';
import { ConfigProvider } from 'antd';
import { Action, ActionCreator } from 'redux';
import { useParams } from 'react-router-dom';

import {
  fetchAuthor,
  resetEditor,
  fetchAuthorRevisions,
  resetAuthorRevisionData,
  saveAuthor,
} from '../../../actions/recordEditor/record';
import {
  fetchQueues,
  fetchTickets,
  fetchUsers,
} from '../../../actions/recordEditor/tickets';
import { RootState } from '../../../types';
import withRouteActionsDispatcher from '../../../common/withRouteActionsDispatcher';
import Header from '../components/Header';
import authorUiSchema from '../../uiSchema/authorUiSchema';
import prepareAuthorSchema from '../utils/prepareAuthorSchema';
import DefaultObjectFieldTemplate from '../components/customTemplates/objectFieldTemplates/DefaultObjectFieldTemplate';
import DefaultFieldTemplate from '../components/customTemplates/fieldTemplates/DefaultFieldTemplate';
import DefaultArrayFieldTemplate from '../components/customTemplates/arrayFieldTemplates/DefaultArrayFieldTemplate';
import DefaultArrayFieldItemTemplate from '../components/customTemplates/arrayFieldTemplates/DefaultArrayFieldItemTemplate';
import InstitutionAutocompleteWidget from '../components/customWidgets/InstitutionAutocompleteWidget';
import ProjectNameAutocompleteWidget from '../components/customWidgets/ProjectNameAutocompleteWidget';
import ViewRecordWidget from '../components/customWidgets/ViewRecordWidget';
import EnumMultiSelectWidget from '../components/customWidgets/EnumMultiSelectWidget';
import '../components/customTemplates/Templates.less';
import validator from '../utils/validator';
import './AuthorEditorContainer.less';
import pruneEmptyObjects from '../utils/pruneEmptyObjects';
import ErrorListTemplate from '../components/customTemplates/ErrorListTemplate';
import FetchingRecordError from '../components/FetchingRecordError';
import ToggleWidget from '../components/customWidgets/ToggleWidget';
import { Revision } from '../../types';

const isTextEntryElement = (element: Element | null) =>
  element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement;

interface AuthorEditorProps {
  dispatch: ActionCreator<Action>;
  author: Map<string, any>;
  authorRevisions: List<Map<string, any>>;
  error: number | null;
  currentRevision: Map<string, any>;
  revisionError: string | null;
}

const AuthorEditor = ({
  dispatch,
  author,
  authorRevisions,
  error,
  currentRevision,
  revisionError,
}: AuthorEditorProps) => {
  const { id } = useParams();
  const authorData = author.get('record')?.get('metadata');
  const revisions = authorRevisions.toJS() as Revision[];

  const [formData, setFormData] = useState(() => authorData?.toJS());

  const formRef = useRef<FormType>(null);
  const historyRef = useRef<any[]>([]);
  const isTypingGroupOpenRef = useRef(false);
  const preRevisionFormDataRef = useRef<any>(null);
  const isViewingRevision = !!currentRevision;

  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const saveInHistoryIfNotFocusedOnATypingField = useCallback(() => {
    const focusedField = document.activeElement;
    const isTyping = isTextEntryElement(focusedField);
    if (!isTyping || !isTypingGroupOpenRef.current) {
      historyRef.current.push({
        formData: formDataRef.current,
        id: focusedField?.id,
      });
    }
    isTypingGroupOpenRef.current = isTyping;
  }, []);

  useEffect(() => {
    setFormData(authorData?.toJS());
    historyRef.current = [];
    isTypingGroupOpenRef.current = false;
    preRevisionFormDataRef.current = null;
  }, [authorData]);

  useEffect(() => {
    if (currentRevision) {
      if (preRevisionFormDataRef.current === null) {
        preRevisionFormDataRef.current = formDataRef.current;
      }
      setFormData(currentRevision.toJS());
    }
  }, [currentRevision]);

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (historyRef.current.length > 0) {
        event.preventDefault();
      }
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, []);

  if (!id) {
    return null;
  }

  if (error !== null) {
    return <FetchingRecordError controlNumber={id} errorStatus={error} />;
  }

  const schema = prepareAuthorSchema(author.get('schema').toJS());

  const onFormChange = (nextFormData: any) => {
    if (isViewingRevision) {
      return;
    }
    if (!isEqual(nextFormData, formData)) {
      saveInHistoryIfNotFocusedOnATypingField();
    }
    setFormData(nextFormData);
  };

  const onUndo = () => {
    isTypingGroupOpenRef.current = false;
    const previousInHistory = historyRef.current.pop();
    if (previousInHistory !== undefined) {
      setFormData(previousInHistory.formData);
      document.getElementById(previousInHistory.id)?.focus();
    }
  };

  const onSave = () => {
    const prunedFormData = pruneEmptyObjects(formData);
    // flushSync forces the pruned formData to reach the Form's internal
    // state synchronously, so validateForm() right after can read it.
    flushSync(() => {
      setFormData(prunedFormData);
    });
    if (!formRef.current?.validateForm()) {
      window.scrollTo(0, 0);
      return;
    }
    dispatch(saveAuthor(id, prunedFormData));
  };

  const resetToLastUpdate = () => {
    setFormData(preRevisionFormDataRef.current ?? authorData?.toJS());
    preRevisionFormDataRef.current = null;
    dispatch(resetAuthorRevisionData());
  };

  return (
    <div
      className="__AuthorEditorContainer__"
      onBlur={() => {
        isTypingGroupOpenRef.current = false;
      }}
    >
      <Header
        controlNumber={id}
        revisions={revisions}
        revisionError={revisionError}
        onSave={() => onSave()}
        onUndo={onUndo}
        canUndo={historyRef.current.length > 0}
        dispatch={dispatch}
        resetToLastUpdate={resetToLastUpdate}
        isViewingRevision={isViewingRevision}
      />

      <ConfigProvider componentSize="small">
        <Form
          ref={formRef}
          schema={schema}
          validator={validator}
          formData={formData}
          readonly={isViewingRevision}
          onChange={({ formData: nextFormData }) => onFormChange(nextFormData)}
          uiSchema={authorUiSchema}
          templates={{
            ObjectFieldTemplate: DefaultObjectFieldTemplate,
            ArrayFieldTemplate: DefaultArrayFieldTemplate,
            ArrayFieldItemTemplate: DefaultArrayFieldItemTemplate,
            FieldTemplate: DefaultFieldTemplate,
            ErrorListTemplate,
          }}
          widgets={{
            institutionAutocomplete: InstitutionAutocompleteWidget,
            projectNameAutocomplete: ProjectNameAutocompleteWidget,
            viewRecordWidget: ViewRecordWidget,
            enumMultiSelect: EnumMultiSelectWidget,
            toggle: ToggleWidget,
          }}
          className="editor-form"
          experimental_defaultFormStateBehavior={{
            arrayMinItems: { populate: 'requiredOnly' },
          }}
          noHtml5Validate
        />
      </ConfigProvider>
    </div>
  );
};

const stateToProps = (state: RootState) => ({
  author: state.recordEditor.getIn(['recordData', 'author']),
  authorRevisions: state.recordEditor.getIn(['recordData', 'author_revisions']),
  error: state.recordEditor.getIn(['recordData', 'fetchAuthorError']),
  currentRevision: state.recordEditor.getIn([
    'recordData',
    'current_author_revision',
  ]),
  revisionError: state.recordEditor.getIn(['recordData', 'revisionError']),
});

const AuthorEditorContainer = connect(stateToProps)(AuthorEditor);

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
