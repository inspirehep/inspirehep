import { legacy_connect as connect } from 'react-redux';
import { List, Map } from 'immutable';
import { Form } from '@rjsf/antd';
import FormType from '@rjsf/core';
import { useRef } from 'react';
import { ConfigProvider } from 'antd';

import {
  fetchAuthor,
  fetchAuthorRevisions,
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

interface AuthorEditorProps {
  author: Map<string, any>;
  revisions: List<Map<string, any>>;
}

const AuthorEditor = ({ author, revisions }: AuthorEditorProps) => {
  const authorData = author.get('record').get('metadata');
  const schema = prepareAuthorSchema(author.get('schema').toJS());
  const lastRevision = revisions.get(0);

  const formRef = useRef<FormType>(null);

  const onSubmit = () => {
    //console.log('coucou');
  };

  const onSave = () => {
    const formData = formRef.current?.state.formData;
    console.log({ formData });
    return formRef.current?.submit();
  };

  return (
    <div className="__AuthorEditorContainer__">
      <Header
        lastRevision={
          lastRevision && {
            date: lastRevision.get('updated'),
            userEmail: lastRevision.get('user_email'),
          }
        }
        onSave={onSave}
      />

      <ConfigProvider componentSize="small">
        <Form
          ref={formRef}
          schema={schema}
          validator={validator}
          formData={authorData.toJS()}
          uiSchema={authorUiSchema}
          templates={{
            ObjectFieldTemplate: DefaultObjectFieldTemplate,
            ArrayFieldTemplate: DefaultArrayFieldTemplate,
            ArrayFieldItemTemplate: DefaultArrayFieldItemTemplate,
            FieldTemplate: DefaultFieldTemplate,
          }}
          widgets={{
            institutionAutocomplete: InstitutionAutocompleteWidget,
            projectNameAutocomplete: ProjectNameAutocompleteWidget,
            viewRecordWidget: ViewRecordWidget,
            enumMultiSelect: EnumMultiSelectWidget,
          }}
          className="editor-form"
          experimental_defaultFormStateBehavior={{
            arrayMinItems: { populate: 'requiredOnly' },
          }}
          onSubmit={onSubmit}
        />
      </ConfigProvider>
    </div>
  );
};

const stateToProps = (state: RootState) => ({
  author: state.recordEditor.get('author'),
  revisions: state.recordEditor.get('author_revisions'),
});

const AuthorEditorContainer = connect(stateToProps)(AuthorEditor);

export default withRouteActionsDispatcher(AuthorEditorContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: (id) => [fetchAuthor(id!), fetchAuthorRevisions(id!)],
  loadingStateSelector: (state: RootState) =>
    !state.recordEditor.hasIn(['author', 'record']),
});
