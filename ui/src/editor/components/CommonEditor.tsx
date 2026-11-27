import { List, Map } from 'immutable';
import { useParams } from 'react-router-dom';
import { Action } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FormType from '@rjsf/core';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { isEqual } from 'lodash';
import { flushSync } from 'react-dom';
import { ConfigProvider } from 'antd';
import { Form } from '@rjsf/antd';
import FetchingRecordError from './FetchingRecordError';
import pruneEmptyObjects from '../utils/pruneEmptyObjects';
import trimStrings from '../utils/trimStrings';
import {
  resetRecordRevisionData,
  uploadDocument,
} from '../../actions/editor/record';
import {
  BackendValidationError,
  Reference,
  Revision,
  toExtraErrors,
} from '../types';
import Header from './Header';
import DocumentViewer, { getDefaultViewerWidth } from './DocumentViewer';
import validator from '../utils/validator';
import DefaultObjectFieldTemplate from './customTemplates/objectFieldTemplates/DefaultObjectFieldTemplate';
import DefaultArrayFieldTemplate from './customTemplates/arrayFieldTemplates/DefaultArrayFieldTemplate';
import DefaultArrayFieldItemTemplate from './customTemplates/arrayFieldTemplates/DefaultArrayFieldItemTemplate';
import DefaultFieldTemplate from './customTemplates/fieldTemplates/DefaultFieldTemplate';
import WrappingInputTemplate from './customTemplates/fieldTemplates/WrappingInputTemplate';
import ErrorListTemplate from './customTemplates/ErrorListTemplate';
import InstitutionAutocompleteWidget from './customWidgets/InstitutionAutocompleteWidget';
import ProjectNameAutocompleteWidget from './customWidgets/ProjectNameAutocompleteWidget';
import AbstractSourceAutocompleteWidget from './customWidgets/AbstractSourceAutocompleteWidget';
import JournalTitleAutocompleteWidget from './customWidgets/JournalTitleAutocompleteWidget';
import LatexTextareaWidget from './customWidgets/LatexTextareaWidget';
import RecordRefWidget from './customWidgets/RecordRefWidget';
import ViewRecordWidget from './customWidgets/ViewRecordWidget';
import EnumMultiSelectWidget from './customWidgets/EnumMultiSelectWidget';
import ToggleWidget from './customWidgets/ToggleWidget';
import { PidType, RootState } from '../../types';
import { DocumentUploadContext } from '../DocumentUploadContext';
import { ToolbarActionsContext } from '../ToolbarActionsContext';
import {
  extractReferences,
  linkReferences,
} from '../../actions/editor/references';
import { extractAuthors } from '../../actions/editor/authors';
import { HttpClientWrapper } from '../../common/http';
import { DEFAULT_TAB_NAME, EditorTabContext } from '../EditorTabContext';
import './CommonEditor.less';

const TEMPLATES = {
  ObjectFieldTemplate: DefaultObjectFieldTemplate,
  ArrayFieldTemplate: DefaultArrayFieldTemplate,
  ArrayFieldItemTemplate: DefaultArrayFieldItemTemplate,
  FieldTemplate: DefaultFieldTemplate,
  BaseInputTemplate: WrappingInputTemplate,
  ErrorListTemplate,
};

const WIDGETS = {
  institutionAutocomplete: InstitutionAutocompleteWidget,
  projectNameAutocomplete: ProjectNameAutocompleteWidget,
  abstractSourceAutocomplete: AbstractSourceAutocompleteWidget,
  journalTitleAutocomplete: JournalTitleAutocompleteWidget,
  latexTextarea: LatexTextareaWidget,
  recordRef: RecordRefWidget,
  viewRecordWidget: ViewRecordWidget,
  enumMultiSelect: EnumMultiSelectWidget,
  toggle: ToggleWidget,
};

const DEFAULT_FORM_STATE_BEHAVIOR = {
  arrayMinItems: { populate: 'requiredOnly' as const },
};

const isTextEntryElement = (element: Element | null) =>
  element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement;

interface CommonEditorProps {
  dispatch: ThunkDispatch<RootState, HttpClientWrapper, Action>;
  data: Map<string, any>;
  schema: RJSFSchema | null;
  uiSchema?: UiSchema;
  getUiSchema?: (formData: any) => UiSchema;
  error: number | null;
  save: (
    type: PidType,
    id: string,
    record: object
  ) => ThunkAction<Promise<void>, RootState, HttpClientWrapper, Action>;
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
  getUiSchema,
  error,
  save,
  validationErrors,
  withRevisions,
}: CommonEditorProps) => {
  const { id, type } = useParams();

  const currentRevision = withRevisions ? withRevisions.currentRevision : null;
  const isViewingRevision = !!currentRevision;

  const [formData, setFormData] = useState(() => data?.toJS());
  const [viewerFormData, setViewerFormData] = useState(formData);

  const [extraErrors, setExtraErrors] = useState(() =>
    toExtraErrors(
      validationErrors?.toJS() as BackendValidationError[],
      data?.toJS()
    )
  );

  const [activeTab, setActiveTab] = useState(DEFAULT_TAB_NAME);

  const [isViewerOpen, setIsViewerOpen] = useState(true);
  const [viewerWidth, setViewerWidth] = useState(getDefaultViewerWidth);

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
    const loadedData = data?.toJS();
    setFormData(loadedData);
    setViewerFormData(loadedData);
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
      const revisionData = currentRevision.toJS();
      setFormData(revisionData);
      setViewerFormData(revisionData);
    }
  }, [currentRevision]);

  const onUploadDocument = useCallback(
    (file: File): Promise<string | undefined> =>
      dispatch(uploadDocument(type as string, id as string, file)),
    [dispatch, type, id]
  );

  const [isToolbarRequestPending, setIsToolbarRequestPending] = useState(false);

  const toolbarActions = useMemo(() => {
    const whileLocked = async <T,>(request: Promise<T>): Promise<T> => {
      setIsToolbarRequestPending(true);
      try {
        return await request;
      } finally {
        setIsToolbarRequestPending(false);
      }
    };
    return {
      extractReferences: (source: string) =>
        whileLocked(dispatch(extractReferences(source))),
      linkReferences: (references: Reference[]) =>
        whileLocked(dispatch(linkReferences(references))),
      extractAuthors: (source: string) =>
        whileLocked(dispatch(extractAuthors(source))),
    };
  }, [dispatch]);

  const tabContextValue = useMemo(
    () => ({ activeTab, setActiveTab }),
    [activeTab]
  );

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
    const prunedFormData = pruneEmptyObjects(trimStrings(formData));
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
    dispatch(save(type as PidType, id, prunedFormData));
  };

  const resetToLastUpdate = () => {
    const restoredData = preRevisionFormDataRef.current ?? data?.toJS();
    setFormData(restoredData);
    setViewerFormData(restoredData);
    preRevisionFormDataRef.current = null;
    dispatch(resetRecordRevisionData());
  };

  const hasDocumentViewer = type === 'literature';
  const showViewer = hasDocumentViewer && isViewerOpen;

  return (
    <div
      className="__CommonEditor__"
      style={showViewer ? { paddingRight: viewerWidth } : undefined}
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
        documentViewer={
          hasDocumentViewer
            ? {
                isOpen: isViewerOpen,
                onToggle: () => setIsViewerOpen((open) => !open),
              }
            : undefined
        }
      />

      <DocumentUploadContext.Provider value={onUploadDocument}>
        <ToolbarActionsContext.Provider value={toolbarActions}>
          <EditorTabContext.Provider value={tabContextValue}>
            <ConfigProvider componentSize="small">
              <Form
                ref={formRef}
                schema={schema}
                validator={validator}
                formData={formData}
                extraErrors={extraErrors}
                readonly={isViewingRevision || isToolbarRequestPending}
                onChange={({ formData: nextFormData }) =>
                  onFormChange(nextFormData)
                }
                uiSchema={getUiSchema?.(formData) ?? uiSchema}
                templates={TEMPLATES}
                widgets={WIDGETS}
                className="editor-form"
                experimental_defaultFormStateBehavior={
                  DEFAULT_FORM_STATE_BEHAVIOR
                }
                noHtml5Validate
              />
            </ConfigProvider>
          </EditorTabContext.Provider>
        </ToolbarActionsContext.Provider>
      </DocumentUploadContext.Provider>

      {showViewer && (
        <DocumentViewer
          formData={viewerFormData}
          width={viewerWidth}
          onWidthChange={setViewerWidth}
        />
      )}
    </div>
  );
};

export default CommonEditor;
