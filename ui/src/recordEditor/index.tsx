import { Route, Routes } from 'react-router-dom';
import DocumentHead from '../common/components/DocumentHead';
import AuthorEditorContainer from './author/containers/AuthorEditorContainer';
import RequireAuth from '../common/RequireAuth';
import { SUPERUSER_OR_CATALOGER } from '../common/authorization';

const META_DESCRIPTION = 'Tool for curators to edit records';
const TITLE = 'Record editor';

const RecordEditor = () => (
  <>
    <DocumentHead title={TITLE} description={META_DESCRIPTION} />
    <div className="w-100 __RecordEditor__">
      <Routes>
        <Route
          path="/record/authors/:id"
          element={
            <RequireAuth authorizedRoles={SUPERUSER_OR_CATALOGER}>
              <AuthorEditorContainer />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  </>
);
export default RecordEditor;
