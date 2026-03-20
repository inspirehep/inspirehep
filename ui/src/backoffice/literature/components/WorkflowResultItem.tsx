import React from 'react';
import { Row, Col, Card, Checkbox, Descriptions, Typography } from 'antd';
import { List } from 'immutable';

import '../../common/components/ResultItem/ResultItem.less';
import { Link } from 'react-router-dom';
import {
  formatDateTime,
  hasPublicationInfo,
  isFullCoverageWorkflow,
} from '../../utils/utils';
import { LITERATURE_PID_TYPE } from '../../../common/constants';
import ResultItem from '../../../common/components/ResultItem';
import { BACKOFFICE } from '../../../common/routes';
import AcquisitionSourceInfo from '../../common/components/AcquisitionSourceInfo/AcquisitionSourceInfo';
import LiteratureActionButtons from './LiteratureActionButtons';
import LiteratureSubjectAreas from './LiteratureSubjectAreas';
import LiteratureResultItem from './LiteratureResultItem';
import AuthorList from '../../../common/components/AuthorList';
import PublicationInfoList from '../../../common/components/PublicationInfoList';
import ArxivEprintList from '../../../literature/components/ArxivEprintList';
import ToggleableAbstract from './ToggleableAbstract';
import AutomaticDecision from './AutomaticDecision';
import LiteratureReferenceCount from './LiteratureReferenceCount';
import LiteratureSearchKeywords from './LiteratureSearchKeywords';
import StatusInfoWithTooltip from '../../common/components/StatusInfoWithTooltip';

const { Paragraph } = Typography;

const WorkflowResultItem = ({
  item,
  compactBottom = false,
  handleResolveAction,
  shouldShowSelectionCheckbox = false,
  isSelected = false,
  onSelectionChange,
  isSubmitted = false,
}: {
  item: any;
  compactBottom?: boolean;
  handleResolveAction?: (action: string, value: string) => void;
  shouldShowSelectionCheckbox?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (workflowId: string, checked: boolean) => void;
  isSubmitted?: boolean;
}) => {
  const workflowId = item?.get('id');
  const workflowType = item?.get('workflow_type');
  const journalCoverage = item?.get('journal_coverage');
  const isFullCoverage = isFullCoverageWorkflow(workflowType, journalCoverage);
  const relevancePrediction = item?.get('relevance_prediction');
  const classifierResults = item?.get('classifier_results');
  const data = item?.get('data');
  const abstract = data?.getIn(['abstracts', 0]);
  const dateTime = data?.getIn(['acquisition_source', 'datetime']);
  const acquisitionSourceDatetime = formatDateTime(dateTime);
  const acquisitionSourceSource = data?.getIn(['acquisition_source', 'source']);
  const acquisitionSourceEmail = data?.getIn(['acquisition_source', 'email']);
  const subjectAreas = data?.get('inspire_categories');

  const status = item?.get('status');
  const referenceCount = item?.get('reference_count');
  const references = data?.get('references')?.toJS();
  const totalReferences =
    references && Array.isArray(references) ? references.length : 0;

  const authors = data?.get('authors');
  const hasAuthors = List.isList(authors) && authors.size > 0;

  const publicationInfo = data?.get('publication_info');
  const hasPublicationInfoValue = hasPublicationInfo(publicationInfo);

  const arxivEprints = data?.get('arxiv_eprints');
  const hasArxivEprints = List.isList(arxivEprints) && arxivEprints.size > 0;

  const numberOfPages = data?.get('number_of_pages');
  const publicNotes = data?.get('public_notes');
  const hasPublicNotes = List.isList(publicNotes) && publicNotes.size > 0;

  const inspireCategories = data?.get('inspire_categories')?.toJS();
  const hasInspireCategories =
    Array.isArray(inspireCategories) && inspireCategories.length > 0;

  return (
    <div
      className="result-item result-item-action mv2"
      style={compactBottom ? { marginBottom: 0 } : undefined}
    >
      <Row justify="start" wrap={false}>
        <Col className="col-details">
          <ResultItem>
            <div className="workflow-title-with-checkbox">
              {shouldShowSelectionCheckbox && (
                <Checkbox
                  className="workflow-selection-checkbox"
                  checked={isSelected}
                  onChange={(event) =>
                    onSelectionChange?.(workflowId, event.target.checked)
                  }
                  aria-label={`Select workflow ${workflowId}`}
                />
              )}
              <Link
                className="result-item-title"
                to={`${BACKOFFICE}/${LITERATURE_PID_TYPE}/${workflowId}`}
                target="_blank"
              >
                <LiteratureResultItem item={item} />
              </Link>
            </div>
            {hasAuthors && (
              <div className="mb2">
                <AuthorList
                  wrapperClassName="author-list-wrapper"
                  limit={10}
                  authors={authors}
                  page="literature results backofice"
                  unlinked
                />
              </div>
            )}
            <Descriptions
              className={hasAuthors ? '' : 'mt2'}
              column={1}
              size="small"
              labelStyle={{ width: 140 }}
            >
              {hasPublicationInfoValue && (
                <Descriptions.Item label="Published In">
                  <PublicationInfoList
                    publicationInfo={publicationInfo}
                    labeled={false}
                  />
                </Descriptions.Item>
              )}

              {hasArxivEprints && (
                <Descriptions.Item label="e-Print">
                  <ArxivEprintList eprints={arxivEprints} showLabel={false} />
                </Descriptions.Item>
              )}

              {numberOfPages != null && (
                <Descriptions.Item label="Number of Pages">
                  {numberOfPages}
                </Descriptions.Item>
              )}

              {hasPublicNotes && (
                <Descriptions.Item label="Public notes">
                  <Paragraph style={{ margin: 0, whiteSpace: 'pre-line' }}>
                    {publicNotes.map((pn: any) => pn.get('value')).join('\n')}
                  </Paragraph>
                </Descriptions.Item>
              )}
            </Descriptions>

            <ToggleableAbstract abstract={abstract} />
          </ResultItem>
        </Col>
        <Col className="col-actions">
          <Card>
            <>
              <StatusInfoWithTooltip status={status} />
              <AutomaticDecision
                hasInspireCategories={hasInspireCategories}
                relevancePrediction={relevancePrediction}
              />
              <LiteratureActionButtons
                status={status}
                handleResolveAction={handleResolveAction}
                isFullCoverage={isFullCoverage}
                isSubmitted={isSubmitted}
              />
              <LiteratureReferenceCount
                referenceCount={referenceCount}
                totalReferences={totalReferences}
              />
              <LiteratureSearchKeywords classifierResults={classifierResults} />
            </>
          </Card>
        </Col>
        <Col className="col-info">
          <Card>
            <AcquisitionSourceInfo
              datetime={acquisitionSourceDatetime}
              source={acquisitionSourceSource}
              email={acquisitionSourceEmail}
            />
          </Card>
        </Col>
        <Col className="col-subject">
          <Card>
            <LiteratureSubjectAreas categories={subjectAreas} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WorkflowResultItem;
