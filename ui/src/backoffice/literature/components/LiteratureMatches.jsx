import React, { useState } from 'react';
import { Card, Radio, Button, Typography, Descriptions, Space } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { List, Map } from 'immutable';
import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank';
import { LITERATURE } from '../../../common/routes';
import PublicationInfoList from '../../../common/components/PublicationInfoList';
import Latex from '../../../common/components/Latex';
import { WorkflowDecisions } from '../../../common/constants';
import { hasPublicationInfo } from '../../utils/utils';
import ToggleableAbstract from './ToggleableAbstract';
import LiteratureDocumentTypes from './LiteratureDocumentTypes';
import './LiteratureMatches.less';
import ReportNumberList from '../../../literature/components/ReportNumberList';

const { Text, Paragraph } = Typography;

const LiteratureMatchItem = ({ match, selectedBestMatch, onSelect }) => {
  const controlNumber = match.get('control_number');

  const handleRadioChange = () => {
    onSelect(controlNumber);
  };

  const abstractValue = match.get('abstract');
  const abstract = abstractValue ? Map({ value: abstractValue }) : null;
  const arxivEprint = match.get('arxiv_eprint');
  const authors = match.get('authors', List());
  const authorsCount = match.get('authors_count');
  const documentTypes = match.get('document_type', List());
  const earliestDate = match.get('earliest_date');
  const numberOfPages = match.get('number_of_pages');
  const publicNotes = match.get('public_notes', List());
  const reportNumbers = match.get('report_numbers', List());
  const publicationInfo = match.get('publication_info', List());
  const hasPublicationInfoValue = hasPublicationInfo(publicationInfo);

  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      bodyStyle={{ paddingTop: 8 }}
      className="literature-match-item"
      title={
        <div>
          {documentTypes.size > 0 && (
            <div style={{ marginBottom: 4 }}>
              <LiteratureDocumentTypes documentTypes={documentTypes} />
            </div>
          )}
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
        </div>
      }
    >
      {authors.size > 0 && (
        <div style={{ marginBottom: 8 }}>
          <Text>
            {authors.map((a) => a.get('full_name')).join('; ')}
            {authorsCount > 1 && <> ({authorsCount} authors)</>}
          </Text>
        </div>
      )}

      <Descriptions column={1} size="small" labelStyle={{ width: 140 }}>
        {hasPublicationInfoValue && (
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
        {reportNumbers.size > 0 && (
          <Descriptions.Item label="Report numbers">
            <ReportNumberList reportNumbers={reportNumbers} hideLabel />
          </Descriptions.Item>
        )}
      </Descriptions>

      <ToggleableAbstract abstract={abstract} />
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
