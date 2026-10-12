import { legacy_connect as connect } from 'react-redux';
import { List, Map } from 'immutable';
import { Form } from '@rjsf/antd';
import FormType from '@rjsf/core';
import { useEffect, useRef, useState } from 'react';
import { isEqual } from 'lodash';
import { flushSync } from 'react-dom';
import { ConfigProvider } from 'antd';
import { Action, ActionCreator } from 'redux';
import { useParams } from 'react-router-dom';

import {
  fetchAuthor,
  fetchAuthorRevisions,
  saveAuthor,
} from '../../../actions/recordEditor';
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

const isTextEntryElement = (element: Element | null) =>
  element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement;

interface AuthorEditorProps {
  dispatch: ActionCreator<Action>;
  author: Map<string, any>;
  revisions: List<Map<string, any>>;
  error: number | null;
}

const AuthorEditor = ({
  dispatch,
  author,
  revisions,
  error,
}: AuthorEditorProps) => {
  const { id } = useParams();
  const authorData = author.get('record')?.get('metadata');
  const lastRevision = revisions.get(0);

  const [formData, setFormData] = useState(() => authorData?.toJS());
  const formRef = useRef<FormType>(null);
  const historyRef = useRef<any[]>([]);
  const isTypingGroupOpenRef = useRef(false);

  useEffect(() => {
    setFormData(authorData?.toJS());
    historyRef.current = [];
    isTypingGroupOpenRef.current = false;
  }, [authorData]);

  if (!id) {
    return null;
  }

  if (error !== null) {
    return <FetchingRecordError controlNumber={id} errorStatus={error} />;
  }

  const schema = prepareAuthorSchema(author.get('schema').toJS());

  const saveInHistoryIfNotFocusedOnATypingField = () => {
    const focusedField = document.activeElement;
    const isTyping = isTextEntryElement(focusedField);
    if (!isTyping || !isTypingGroupOpenRef.current) {
      historyRef.current.push({ formData, id: focusedField?.id });
    }
    isTypingGroupOpenRef.current = isTyping;
  };

  const onFormChange = (nextFormData: any) => {
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

  return (
    <div
      className="__AuthorEditorContainer__"
      onBlur={() => {
        isTypingGroupOpenRef.current = false;
      }}
    >
      <Header
        lastRevision={
          lastRevision && {
            date: lastRevision.get('updated'),
            userEmail: lastRevision.get('user_email'),
          }
        }
        onSave={() => onSave()}
        onUndo={onUndo}
        canUndo={historyRef.current.length > 0}
      />

      <ConfigProvider componentSize="small">
        <Form
          ref={formRef}
          schema={schema}
          validator={validator}
          formData={formData}
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
  author: state.recordEditor.get('author'),
  revisions: state.recordEditor.get('author_revisions'),
  error: state.recordEditor.get('fetchAuthorError'),
});

const AuthorEditorContainer = connect(stateToProps)(AuthorEditor);

export default withRouteActionsDispatcher(AuthorEditorContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: (id) => [fetchAuthor(id!), fetchAuthorRevisions(id!)],
  loadingStateSelector: (state: RootState) =>
    !state.recordEditor.hasIn(['author', 'record']) &&
    !state.recordEditor.get('fetchAuthorError'),
});
