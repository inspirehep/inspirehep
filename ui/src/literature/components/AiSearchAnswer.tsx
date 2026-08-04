import { ReactNode, useEffect, useState } from 'react';
import { Alert, Card, Spin, Typography } from 'antd';
import {
  CheckCircleOutlined,
  LoadingOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { List, Map } from 'immutable';
import { Link } from 'react-router-dom';

import { LITERATURE } from '../../common/routes';

const PAPER_REFERENCE_REGEXP = /\[([^[\]]+)\]\((\d+)\)/g;
const INCOMPLETE_REFERENCE_REGEXP = /\[[^[\]]*(\]\(\d*)?$/;

export const LOADING_MESSAGES = [
  'Waking up the assistant…',
  'Warming up the accelerator…',
  'Consulting the Standard Model…',
  'Rummaging through the preprint pile…',
  'Untangling a few Feynman diagrams…',
  'Colliding some hadrons for luck…',
  'Chasing down a five-sigma rumour…',
  'Looking for the missing energy…',
  'Renormalising expectations…',
  'Asking a postdoc for directions…',
  'Checking arXiv for fresh gossip…',
  'Politely queueing at the beamline…',
  'Consulting the Magic Conch Shell…',
];
function randomLoadingMessage() {
  return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
}

const TOOL_TERM_KEYS = ['query', 'author', 'publisher', 'id', 'inspire_id'];

function useLoadingMessage(active: boolean): string {
  const [message, setMessage] = useState(randomLoadingMessage);

  useEffect(() => {
    if (active) {
      setMessage(randomLoadingMessage());
    }
  }, [active]);

  return message;
}

export function stripIncompleteReference(answer: string): string {
  return answer.replace(INCOMPLETE_REFERENCE_REGEXP, '');
}

function describeToolCall(toolCall: Map<string, any>): string {
  const input = toolCall.get('input') || Map();
  const termKey = TOOL_TERM_KEYS.find((key) => input.get(key));
  const term = termKey && String(input.get(termKey));
  return term ? `Searching INSPIRE for “${term}”` : 'Searching INSPIRE';
}

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

function toolCallsIn(progress: List<Map<string, any>>) {
  return progress.filter((event) => event.get('type') === 'tool');
}

function AiSearchProgress({ progress }: { progress: List<Map<string, any>> }) {
  const toolCalls = toolCallsIn(progress);
  const completedCount = progress.filter(
    (event) => event.get('type') === 'tool_result'
  ).size;

  return (
    <div data-testid="ai-search-progress">
      {toolCalls.map((toolCall, index) => (
        <div
          className="mb1"
          // eslint-disable-next-line react/no-array-index-key
          key={`${toolCall.get('name')}-${index}`}
        >
          {index < completedCount ? (
            <CheckCircleOutlined className="mr2" />
          ) : (
            <Spin
              className="mr2"
              size="small"
              indicator={<LoadingOutlined spin />}
            />
          )}
          <Typography.Text type="secondary">
            {describeToolCall(toolCall)}
          </Typography.Text>
        </div>
      ))}
    </div>
  );
}

function AiSearchAnswer({ aiSearch }: { aiSearch?: Map<string, any> | null }) {
  const loading = Boolean(aiSearch && aiSearch.get('loading'));
  const response = aiSearch && aiSearch.get('response');
  const progress = (aiSearch && aiSearch.get('progress')) || List();
  const waitingToStart = toolCallsIn(progress).isEmpty();
  const loadingMessage = useLoadingMessage(
    loading && !response && waitingToStart
  );

  if (!aiSearch) {
    return null;
  }

  const error = aiSearch.get('error');

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
        <div className="mb3">
          <AiSearchProgress progress={progress} />
          {!response && waitingToStart && (
            <div>
              <Spin
                className="mr2"
                size="small"
                indicator={<LoadingOutlined spin />}
              />
              <Typography.Text type="secondary">
                {loadingMessage}
              </Typography.Text>
            </div>
          )}
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
      {response && (
        <Typography.Paragraph style={{ whiteSpace: 'pre-line' }}>
          {renderAnswerWithLinks(
            loading ? stripIncompleteReference(response) : response
          )}
        </Typography.Paragraph>
      )}
      {!loading && !error && response && (
        <Typography.Text type="secondary">
          AI-generated answer based on INSPIRE records. The records it refers to
          are listed below. Always verify against the original papers.
        </Typography.Text>
      )}
    </Card>
  );
}

export default AiSearchAnswer;
