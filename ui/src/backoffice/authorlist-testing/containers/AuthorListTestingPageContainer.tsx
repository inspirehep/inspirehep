import { useState } from 'react';
import { Alert, Button, Card, Input, Space, Typography } from 'antd';

import Breadcrumbs from '../../common/components/Breadcrumbs/Breadcrumbs';
import DocumentHead from '../../../common/components/DocumentHead';
import http from '../../../common/http';
import toYaml from '../utils/toYaml';

const { TextArea } = Input;

const TITLE = 'Author-list testing - Backoffice';
const META_DESCRIPTION = 'Test author-list parsing for curator workflows';

interface AuthorListResponse {
  authors?: unknown;
  warnings?: unknown;
  [key: string]: unknown;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const { response } = error as {
      response?: { data?: { message?: string } };
    };

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred while parsing the author list.';
}

function hasWarnings(warnings: unknown): boolean {
  return Array.isArray(warnings) ? warnings.length > 0 : Boolean(warnings);
}

function formatWarnings(warnings: unknown): string {
  if (Array.isArray(warnings)) {
    return warnings.map(String).join('\n');
  }
  return typeof warnings === 'string' ? warnings : toYaml(warnings);
}

function formatResult(result: AuthorListResponse): string {
  if (result.authors !== undefined) {
    return toYaml(result.authors);
  }
  const rest = { ...result };
  delete rest.warnings;
  return toYaml(rest);
}

const AuthorListTestingPageContainer = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AuthorListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!text.trim() || loading) {
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setResult(null);

    try {
      const response = await http.post('/editor/authorlist/text', { text });
      setResult(response.data as AuthorListResponse);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setErrorMessage('');
  };

  return (
    <div
      className="__AuthorListTestingPageContainer__"
      data-testid="authorlist-testing-page"
    >
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Breadcrumbs
        namespace=""
        title1="Author-list testing"
        href1="authorlist-testing"
      />

      <div className="inner-container mt2">
        <Typography.Title level={2}>Author-list testing</Typography.Title>
        <Typography.Paragraph>
          Paste an author list below to test the existing parser and check the
          parsed authors at a glance.
        </Typography.Paragraph>

        <Card>
          <Space direction="vertical" size="middle" className="w-100">
            <label htmlFor="author-list-input">Author-list text</label>
            <TextArea
              id="author-list-input"
              aria-label="Author-list text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste author-list text here..."
              autoSize={{ minRows: 8, maxRows: 20 }}
              disabled={loading}
            />

            <Space>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                disabled={!text.trim()}
              >
                Parse author list
              </Button>
              <Button onClick={handleClear} disabled={loading}>
                Clear
              </Button>
            </Space>
          </Space>
        </Card>

        {errorMessage && (
          <Alert
            className="mt3"
            type="error"
            showIcon
            message="Parsing failed"
            description={errorMessage}
          />
        )}

        {result && hasWarnings(result.warnings) && (
          <Alert
            className="mt3"
            type="warning"
            showIcon
            message="Parser warnings"
            description={
              <pre
                data-testid="authorlist-warnings"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {formatWarnings(result.warnings)}
              </pre>
            }
          />
        )}

        {result && (
          <Card title="Parsed authors" className="mt3">
            <pre
              data-testid="authorlist-result"
              style={{
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                overflowX: 'auto',
              }}
            >
              {formatResult(result)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AuthorListTestingPageContainer;
