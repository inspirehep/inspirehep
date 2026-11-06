import { List, Map } from 'immutable';
import { useParams } from 'react-router-dom';
import { Action, ActionCreator } from 'redux';
import { useCallback, useEffect, useRef, useState } from 'react';
import FormType from '@rjsf/core';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { isEqual } from 'lodash';
import { flushSync } from 'react-dom';
import { ConfigProvider } from 'antd';
import { Form } from '@rjsf/antd';
import FetchingRecordError from './FetchingRecordError';
import pruneEmptyObjects from '../utils/pruneEmptyObjects';
import { resetRecordRevisionData } from '../../actions/editor/record';
import { BackendValidationError, Revision, toExtraErrors } from '../types';
import Header from './Header';
import validator from '../utils/validator';
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
import { RootState } from '../../types';
import { HttpClientWrapper } from '../../common/http';
import './CommonEditor.less';

const isTextEntryElement = (element: Element | null) =>
  element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement;

interface CommonEditorProps {
  dispatch: ActionCreator<Action>;
  data: Map<string, any>;
  schema: RJSFSchema | null;
  uiSchema: UiSchema;
  error: number | null;
  save: (
    id: string,
    record: object
  ) => (
    dispatch: ActionCreator<Action, any[]>,
    getState: () => RootState,
    http: HttpClientWrapper
  ) => Promise<void>;
  validationErrors?: List<Map<string, any>>;
  withRevisions:
    | false
    | {
        revisions: List<Map<string, any>>;
        currentRevision: Map<string, any>;
        revisionError: string | null;
      };
}

const CommonEditor = ({
  dispatch,
  data,
  schema,
  uiSchema,
  error,
  save,
  validationErrors,
  withRevisions,
}: CommonEditorProps) => {
  const { id, type } = useParams();

  const currentRevision = withRevisions ? withRevisions.currentRevision : null;
  const isViewingRevision = !!currentRevision;

  const [formData, setFormData] = useState(() => data?.toJS());

  const [extraErrors, setExtraErrors] = useState(() =>
    toExtraErrors(
      validationErrors?.toJS() as BackendValidationError[],
      data?.toJS()
    )
  );

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
    setFormData(data?.toJS());
    setExtraErrors(
      toExtraErrors(
        validationErrors?.toJS() as BackendValidationError[],
        data?.toJS()
      )
    );
    historyRef.current = [];
    isTypingGroupOpenRef.current = false;
    preRevisionFormDataRef.current = null;
  }, [data, validationErrors]);

  useEffect(() => {
    if (currentRevision) {
      if (preRevisionFormDataRef.current === null) {
        preRevisionFormDataRef.current = formDataRef.current;
      }
      setFormData(currentRevision.toJS());
    }
  }, [currentRevision]);

  if (!id || !type) {
    return null;
  }

  if (error !== null) {
    return <FetchingRecordError controlNumber={id} errorStatus={error} />;
  }
  if (schema === null) {
    return <FetchingRecordError controlNumber={id} errorStatus={500} />;
  }

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
      setExtraErrors(undefined);
      setFormData(prunedFormData);
    });
    if (!formRef.current?.validateForm()) {
      window.scrollTo(0, 0);
      return;
    }
    dispatch(save(id, prunedFormData));
  };

  const resetToLastUpdate = () => {
    setFormData(preRevisionFormDataRef.current ?? data?.toJS());
    preRevisionFormDataRef.current = null;
    dispatch(resetRecordRevisionData());
  };

  return (
    <div
      className="__CommonEditor__"
      onBlur={() => {
        isTypingGroupOpenRef.current = false;
      }}
    >
      <Header
        controlNumber={id}
        type={type}
        withRevisions={
          withRevisions
            ? {
                revisions: withRevisions.revisions.toJS() as Revision[],
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
          extraErrors={extraErrors}
          readonly={isViewingRevision}
          onChange={({ formData: nextFormData }) => onFormChange(nextFormData)}
          uiSchema={uiSchema}
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
