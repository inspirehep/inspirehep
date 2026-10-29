import { List, Map } from 'immutable';
import { useParams } from 'react-router-dom';
import { Action, ActionCreator } from 'redux';
import { useCallback, useEffect, useRef, useState } from 'react';
import FormType from '@rjsf/core';
import { isEqual } from 'lodash';
import { flushSync } from 'react-dom';
import { ConfigProvider } from 'antd';
import { Form } from '@rjsf/antd';
import FetchingRecordError from './FetchingRecordError';
import prepareAuthorSchema from '../utils/prepareAuthorSchema';
import pruneEmptyObjects from '../utils/pruneEmptyObjects';
import {
  resetAuthorRevisionData,
  saveAuthor,
} from '../../actions/recordEditor/record';
import { Revision } from '../types';
import Header from './Header';
import validator from '../utils/validator';
import authorUiSchema from '../uiSchema/authorUiSchema';
import DefaultObjectFieldTemplate from './customTemplates/objectFieldTemplates/DefaultObjectFieldTemplate';
import DefaultArrayFieldTemplate from './customTemplates/arrayFieldTemplates/DefaultArrayFieldTemplate';
import DefaultArrayFieldItemTemplate from './customTemplates/arrayFieldTemplates/DefaultArrayFieldItemTemplate';
import DefaultFieldTemplate from './customTemplates/fieldTemplates/DefaultFieldTemplate';
import ErrorListTemplate from './customTemplates/ErrorListTemplate';
import InstitutionAutocompleteWidget from './customWidgets/InstitutionAutocompleteWidget';
import ProjectNameAutocompleteWidget from './customWidgets/ProjectNameAutocompleteWidget';
import ViewRecordWidget from './customWidgets/ViewRecordWidget';
import EnumMultiSelectWidget from './customWidgets/EnumMultiSelectWidget';
import ToggleWidget from './customWidgets/ToggleWidget';

const isTextEntryElement = (element: Element | null) =>
  element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement;

interface CommonEditorProps {
  dispatch: ActionCreator<Action>;
  author: Map<string, any>;
  error: number | null;
  withRevisions:
    | false
    | {
        authorRevisions: List<Map<string, any>>;
        currentRevision: Map<string, any>;
        revisionError: string | null;
      };
}

const CommonEditor = ({
  dispatch,
  author,
  error,
  withRevisions,
}: CommonEditorProps) => {
  const { id } = useParams();
  const authorData = author.get('record')?.get('metadata');

  const currentRevision = withRevisions ? withRevisions.currentRevision : null;
  const isViewingRevision = !!currentRevision;

  const [formData, setFormData] = useState(() => authorData?.toJS());

  const formRef = useRef<FormType>(null);
  const historyRef = useRef<any[]>([]);
  const isTypingGroupOpenRef = useRef(false);
  const preRevisionFormDataRef = useRef<any>(null);

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
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (historyRef.current.length > 0) {
        event.preventDefault();
      }
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
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
        withRevisions={
          withRevisions
            ? {
                revisions: withRevisions.authorRevisions.toJS() as Revision[],
                revisionError: withRevisions.revisionError,
                isViewingRevision,
                resetToLastUpdate,
              }
            : false
        }
        onSave={() => onSave()}
        onUndo={onUndo}
        canUndo={historyRef.current.length > 0}
        dispatch={dispatch}
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

export default CommonEditor;
