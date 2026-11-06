import { Route, Routes } from 'react-router-dom';
import DocumentHead from '../common/components/DocumentHead';
import RecordEditorContainer from './containers/RecordEditorContainer';
import RequireAuth from '../common/RequireAuth';
import { SUPERUSER_OR_CATALOGER } from '../common/authorization';
import BackofficeAuthorEditorContainer from './containers/BackofficeAuthorEditorContainer';

const META_DESCRIPTION = 'Tool for curators to edit records';
const TITLE = 'Record editor';

const Editor = () => (
  <>
    <DocumentHead title={TITLE} description={META_DESCRIPTION} />
    <div className="w-100 __Editor__" data-testid="editor">
      <Routes>
        <Route
          path="/record/:type/:id"
          element={
            <RequireAuth authorizedRoles={SUPERUSER_OR_CATALOGER}>
              <RecordEditorContainer />
            </RequireAuth>
          }
        />
        <Route
          path="/backoffice/:type/:id"
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
export default Editor;
