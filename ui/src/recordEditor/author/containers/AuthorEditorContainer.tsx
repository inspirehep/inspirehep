import {
  fetchAuthor,
  fetchAuthorRevisions,
} from '../../../actions/recordEditor';
import { RootState } from '../../../types';
import { connect } from 'react-redux';
import withRouteActionsDispatcher from '../../../common/withRouteActionsDispatcher';
import Header from '../components/Header';
import { List, Map } from 'immutable';
import { useParams } from 'react-router-dom';
import Form from '@rjsf/core';
import authorUiSchema from '../../uiSchema/authorUiSchema';
import prepareAuthorSchema from '../utils/prepareAuthorSchema';
import DefaultObjectFieldTemplate from '../components/customTemplates/objectFieldTemplates/DefaultObjectFieldTemplate';
import DefaultFieldTemplate from '../components/customTemplates/fieldTemplates/DefaultFieldTemplate';
import DefaultArrayFieldTemplate from '../components/customTemplates/arrayFieldTemplates/DefaultArrayFieldTemplate';
import InstitutionAutocompleteWidget from '../components/customWidgets/InstitutionAutocompleteWidget';
import ProjectNameAutocompleteWidget from '../components/customWidgets/ProjectNameAutocompleteWidget';
import ViewRecordWidget from '../components/customWidgets/ViewRecordWidget';
import EnumMultiSelectWidget from '../components/customWidgets/EnumMultiSelectWidget';
import '../components/customTemplates/Templates.less';
import { useRef, useState } from 'react';
import validator from '../utils/validator';
import pruneEmptyObjects from '../utils/pruneEmptyObjects';

interface AuthorEditorProps {
  author: Map<string, any>;
  revisions: List<Map<string, any>>;
}

const AuthorEditor = ({ author, revisions }: AuthorEditorProps) => {
  const { id } = useParams<{ id: string }>();
  const authorData = author.get('record').get('metadata');
  const schema = prepareAuthorSchema(author.get('schema').toJS());
  const lastRevision = revisions.get(0);

  const [formData, setFormData] = useState(() => authorData.toJS());
  const formRef = useRef<Form>(null);

  const onSubmit = () => {
    console.log('coucou');
  };

  const onSave = () => {
    console.log({ formData });
    return formRef.current?.submit();
  };

  return (
    <div style={{ position: 'relative' }}>
      <Header
        recordId={id}
        lastRevision={
          lastRevision && {
            date: lastRevision.get('updated'),
            userEmail: lastRevision.get('user_email'),
          }
        }
        onSave={onSave}
      />
      <Form
        ref={formRef}
        schema={schema}
        validator={validator}
        formData={formData}
        onChange={({ formData: nextFormData }) =>
          setFormData(pruneEmptyObjects(nextFormData))
        }
        uiSchema={authorUiSchema}
        templates={{
          ObjectFieldTemplate: DefaultObjectFieldTemplate,
          ArrayFieldTemplate: DefaultArrayFieldTemplate,
          FieldTemplate: DefaultFieldTemplate,
        }}
        widgets={{
          institutionAutocomplete: InstitutionAutocompleteWidget,
          projectNameAutocomplete: ProjectNameAutocompleteWidget,
          viewRecordWidget: ViewRecordWidget,
          enumMultiSelect: EnumMultiSelectWidget,
        }}
        className="mt5"
        experimental_defaultFormStateBehavior={{
          arrayMinItems: { populate: 'requiredOnly' },
        }}
        noHtml5Validate
        onSubmit={onSubmit}
      />
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
  routeActions: (id) => [fetchAuthor(id), fetchAuthorRevisions(id)],
  loadingStateSelector: (state: RootState) =>
    !state.recordEditor.hasIn(['author', 'record']),
});
