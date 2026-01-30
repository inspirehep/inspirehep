import React, { useState } from 'react';
import { Card, Radio, Button, Typography, Descriptions, Space } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { List } from 'immutable';
import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank';
import { LITERATURE } from '../../../common/routes';
import PublicationInfoList from '../../../common/components/PublicationInfoList';
import Latex from '../../../common/components/Latex';
import { WorkflowDecisions } from '../../../common/constants';

const { Text, Paragraph } = Typography;

const LiteratureMatchItem = ({ match, selectedBestMatch, onSelect }) => {
  const [showAbstract, setShowAbstract] = useState(false);
  const controlNumber = match.get('control_number');

  const handleToggleAbstract = (e) => {
    e.preventDefault();
    setShowAbstract((prev) => !prev);
  };

  const handleRadioChange = () => {
    onSelect(controlNumber);
  };

  const abstract = match.get('abstract');
  const arxivEprint = match.get('arxiv_eprint');
  const authors = match.get('authors', List());
  const earliestDate = match.get('earliest_date');
  const numberOfPages = match.get('number_of_pages');
  const publicNotes = match.get('public_notes', List());
  const publicationInfo = match.get('publication_info', List());
  const firstPub = publicationInfo.first();

  const hasPublicationInfo =
    !!firstPub &&
    (firstPub.get('journal_title') || firstPub.get('pubinfo_freetext'));

  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      bodyStyle={{ paddingTop: 8 }}
      title={
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <Radio
            value={controlNumber}
            checked={selectedBestMatch === controlNumber}
            onChange={handleRadioChange}
          />
          <div
            style={{ flex: 1, whiteSpace: 'normal', wordBreak: 'break-word' }}
          >
            <LinkWithTargetBlank href={`${LITERATURE}/${controlNumber}`}>
              <Latex>{match.get('title')}</Latex>
              <ExportOutlined style={{ marginLeft: '4px' }} />
            </LinkWithTargetBlank>
          </div>
        </div>
      }
    >
      {authors.size > 0 && (
        <div style={{ marginBottom: 8 }}>
          <Text>
            {authors.map((a) => a.get('full_name')).join('; ')}
            {authors.size > 1 && <> ({authors.size} authors)</>}
          </Text>
        </div>
      )}

      <Descriptions column={1} size="small" labelStyle={{ width: 140 }}>
        {hasPublicationInfo && (
          <Descriptions.Item label="Published In">
            <PublicationInfoList
              publicationInfo={publicationInfo}
              labeled={false}
            />
          </Descriptions.Item>
        )}

        {arxivEprint && (
          <Descriptions.Item label="e-Print">{arxivEprint}</Descriptions.Item>
        )}

        {numberOfPages && (
          <Descriptions.Item label="Number of Pages">
            {numberOfPages}
          </Descriptions.Item>
        )}

        {earliestDate && (
          <Descriptions.Item label="Date">{earliestDate}</Descriptions.Item>
        )}

        {publicNotes.size > 0 && (
          <Descriptions.Item label="Public notes">
            <Paragraph style={{ margin: 0, whiteSpace: 'pre-line' }}>
              {publicNotes.map((pn) => pn.get('value')).join('\n')}
            </Paragraph>
          </Descriptions.Item>
        )}
      </Descriptions>

      {abstract && (
        <>
          <Button
            type="link"
            onClick={handleToggleAbstract}
            style={{ padding: 0 }}
          >
            {showAbstract ? 'Hide abstract' : 'Show abstract'}
          </Button>
          {showAbstract && (
            <Paragraph style={{ marginTop: 4 }}>{abstract}</Paragraph>
          )}
        </>
      )}
    </Card>
  );
};

const LiteratureMatches = ({ fuzzyMatches, handleResolveAction }) => {
  const [selectedBestMatch, setSelectedBestMatch] = useState(
    fuzzyMatches.getIn([0, 'control_number'])
  );
  const [hasSubmittedDecision, setHasSubmittedDecision] = useState(false);

  const handleBestMatchClick = () => {
    setHasSubmittedDecision(true);
    handleResolveAction(WorkflowDecisions.FUZZY_MATCH, selectedBestMatch);
  };

  const handleNoMatchClick = () => {
    setHasSubmittedDecision(true);
    handleResolveAction(WorkflowDecisions.FUZZY_MATCH);
  };

  if (hasSubmittedDecision) {
    return <p className="mb0 mt2 tc">Decision submitted.</p>;
  }

  return (
    <>
      <Radio.Group
        value={selectedBestMatch}
        onChange={(e) => setSelectedBestMatch(e.target.value)}
        style={{ width: '100%' }}
      >
        {fuzzyMatches.map((match) => (
          <LiteratureMatchItem
            key={match.get('control_number')}
            match={match}
            selectedBestMatch={selectedBestMatch}
            onSelect={setSelectedBestMatch}
          />
        ))}
      </Radio.Group>

      <Space style={{ marginTop: 16, justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={handleBestMatchClick}>
          Best Match
        </Button>
        <Button onClick={handleNoMatchClick}>None of these</Button>
      </Space>
    </>
  );
};

export default LiteratureMatches;
