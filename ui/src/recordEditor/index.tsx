import { Route, Routes } from 'react-router-dom';
import DocumentHead from '../common/components/DocumentHead';
import AuthorEditorContainer from './containers/AuthorEditorContainer';
import RequireAuth from '../common/RequireAuth';
import { SUPERUSER_OR_CATALOGER } from '../common/authorization';
import BackofficeAuthorEditorContainer from './containers/BackofficeAuthorEditorContainer';

const META_DESCRIPTION = 'Tool for curators to edit records';
const TITLE = 'Record editor';

const RecordEditor = () => (
  <>
    <DocumentHead title={TITLE} description={META_DESCRIPTION} />
    <div className="w-100 __RecordEditor__" data-testid="record-editor">
      <Routes>
        <Route
          path="/record/authors/:id"
          element={
            <RequireAuth authorizedRoles={SUPERUSER_OR_CATALOGER}>
              <AuthorEditorContainer />
            </RequireAuth>
          }
        />
        <Route
          path="/backoffice/authors/:id"
          element={
            <RequireAuth authorizedRoles={SUPERUSER_OR_CATALOGER}>
              <BackofficeAuthorEditorContainer />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  </>
);
export default RecordEditor;
