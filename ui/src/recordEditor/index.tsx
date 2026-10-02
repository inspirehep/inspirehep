import { Route, Routes } from 'react-router-dom';
import DocumentHead from '../common/components/DocumentHead';
import AuthorEditorContainer from './author/containers/AuthorEditorContainer';

const META_DESCRIPTION = 'Tool for curators to edit records';
const TITLE = 'Record editor';

const RecordEditor = () => (
  <>
    <DocumentHead title={TITLE} description={META_DESCRIPTION} />
    <div className="w-100 __RecordEditor__">
      <Routes>
        <Route path="/record/authors/:id" element={<AuthorEditorContainer />} />
      </Routes>
    </div>
  </>
);
export default RecordEditor;
