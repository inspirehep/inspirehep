import SafeSwitch from '../common/components/SafeSwitch';
import DocumentHead from '../common/components/DocumentHead';
import { Route } from 'react-router-dom';
import { EDIT_AUTHOR_CATALOGER } from '../common/routes';
import AuthorEditorContainer from './author/containers/AuthorEditorContainer';

const META_DESCRIPTION = 'Tool for curators to edit records';
const TITLE = 'Record editor';

const RecordEditor = () => {
  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <div className="w-100 __RecordEditor__">
        <SafeSwitch>
          <Route
            exact
            path={`${EDIT_AUTHOR_CATALOGER}/:id`}
            component={AuthorEditorContainer}
          />
        </SafeSwitch>
      </div>
    </>
  );
};

export default RecordEditor;
