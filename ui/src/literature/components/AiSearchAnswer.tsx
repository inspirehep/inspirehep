import { ReactNode } from 'react';
import { Alert, Card, Spin, Typography } from 'antd';
import { LoadingOutlined, RobotOutlined } from '@ant-design/icons';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';

import { LITERATURE } from '../../common/routes';

const PAPER_REFERENCE_REGEXP = /\[([^[\]]+)\]\((\d+)\)/g;

function renderAnswerWithLinks(answer: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  Array.from(answer.matchAll(PAPER_REFERENCE_REGEXP)).forEach(
    ([reference, label, recordId]) => {
      const referenceIndex = answer.indexOf(reference, lastIndex);
      nodes.push(answer.slice(lastIndex, referenceIndex));
      nodes.push(
        <Link
          key={`${recordId}-${referenceIndex}`}
          to={`${LITERATURE}/${recordId}`}
        >
          {label}
        </Link>
      );
      lastIndex = referenceIndex + reference.length;
    }
  );
  nodes.push(answer.slice(lastIndex));

  return nodes;
}

function AiSearchAnswer({ aiSearch }: { aiSearch?: Map<string, any> | null }) {
  if (!aiSearch) {
    return null;
  }

  const loading = aiSearch.get('loading');
  const error = aiSearch.get('error');
  const response = aiSearch.get('response');

  return (
    <Card
      className="mb3"
      title={
        <span>
          <RobotOutlined className="mr1" />
          AI answer
        </span>
      }
      data-testid="ai-search-answer"
    >
      {loading && (
        <div className="tc pv3">
          <Spin size="large" indicator={<LoadingOutlined spin />} />
          <div className="mt3">
            Searching INSPIRE and generating an answer. This can take a
            minute...
          </div>
        </div>
      )}
      {!loading && error && (
        <Alert
          type="warning"
          showIcon
          message="The AI search could not be completed"
          description={error.get('message') || 'Please try again later.'}
        />
      )}
      {!loading && !error && response && (
        <>
          <Typography.Paragraph style={{ whiteSpace: 'pre-line' }}>
            {renderAnswerWithLinks(response)}
          </Typography.Paragraph>
          <Typography.Text type="secondary">
            AI-generated answer based on INSPIRE records. The records it refers
            to are listed below. Always verify against the original papers.
          </Typography.Text>
        </>
      )}
    </Card>
  );
}

export default AiSearchAnswer;
