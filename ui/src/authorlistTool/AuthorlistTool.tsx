import { Alert, Button } from 'antd';
import { useState } from 'react';
import TextArea from 'antd/es/input/TextArea';
import { List, Map } from 'immutable';
import CopyToClipboard from 'react-copy-to-clipboard';
import { CopyOutlined } from '@ant-design/icons';

import './AuthorlistTool.less';
import DocumentHead from '../common/components/DocumentHead';
import FormatGuide from './FormatGuide';
import Warnings from './Warnings';
import AuthorsYaml from './AuthorsYaml';
import { AUTHORLIST_TOOL_URL } from '../common/constants';

interface AuthorlistToolProps {
  onSubmit: (authorlist: string) => void;
  loading: boolean;
  authors: List<Map<string, any>> | null;
  warnings: List<string> | null;
  error: string | null;
}

function AuthorlistTool({
  onSubmit,
  loading,
  authors,
  warnings,
  error,
}: AuthorlistToolProps) {
  const [authorsInput, setAuthorsInput] = useState('');
  const warningsData = warnings?.toJS() as string[] | undefined;
  const hasWarnings = warningsData && warningsData.length > 0;

  const authorsData = authors?.toJS() as unknown[] | undefined;
  const hasAuthors = authorsData && authorsData.length > 0;

  const disableActions = loading || authorsInput.trim() === '';

  return (
    <div className="__AuthorlistTool__" data-testid="authorlist-tool">
      <DocumentHead
        title="Author list tool"
        description="Validate a list of authors"
      />
      <h1>Authorlist: format author strings</h1>
      <a href={AUTHORLIST_TOOL_URL} target="_blank" rel="noreferrer">
        Documentation
      </a>
      <div className="rowContainer">
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(authorsInput);
          }}
        >
          <TextArea
            value={authorsInput}
            onChange={(event) => setAuthorsInput(event.target.value)}
            styles={{
              root: { height: '100%', minHeight: '500px', maxHeight: '1000px' },
            }}
          />
          <div className="actions">
            <CopyToClipboard text={authorsInput}>
              <Button>
                <CopyOutlined /> Copy to Clipboard
              </Button>
            </CopyToClipboard>
            <div className="leftActions">
              <Button
                type="primary"
                disabled={disableActions}
                htmlType="submit"
              >
                Format
              </Button>
              <Button
                onClick={() => setAuthorsInput('')}
                disabled={disableActions}
              >
                Clear
              </Button>
            </div>
          </div>
        </form>
        {(error || hasAuthors || hasWarnings) && (
          <div className="results">
            <h4>Result</h4>
            {hasWarnings && <Warnings warnings={warningsData} />}
            {hasAuthors && <AuthorsYaml authors={authorsData} />}
            {error && <Alert title={error} type="error" showIcon />}
            <FormatGuide />
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthorlistTool;
