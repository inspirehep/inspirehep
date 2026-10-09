import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { SelectOutlined } from '@ant-design/icons';
import { Drawer, Radio, Row, Col, Card, Button, RadioChangeEvent } from 'antd';
import { Map } from 'immutable';

import './CurateReferenceDrawer.less';
import EmbeddedSearchBoxContainer from '../../../common/containers/EmbeddedSearchBoxContainer';
import NumberOfResultsContainer from '../../../common/containers/NumberOfResultsContainer';
import { CURATE_REFERENCE_NS } from '../../../search/constants';
import ResultsContainer from '../../../common/containers/ResultsContainer';
import AuthorsAndCollaborations from '../../../common/components/AuthorsAndCollaborations';
import LiteratureTitle from '../../../common/components/LiteratureTitle';
import { LITERATURE } from '../../../common/routes';
import LiteratureDate from '../../../common/components/LiteratureDate';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import PaginationContainer from '../../../common/containers/PaginationContainer';

export function renderReferenceItem(result: Map<string, any>) {
  const metadata = result?.get('metadata');
  const controlNumber = metadata?.get('control_number');
  const title = metadata?.getIn(['titles', 0]);
  const authors = metadata?.get('authors');
  const authorCount = metadata?.get('number_of_authors');
  const date = metadata?.get('date');
  const collaborations = metadata?.get('collaborations');
  const collaborationsWithSuffix = metadata?.get('collaborations_with_suffix');

  return (
    <div data-testid={`reference-drawer-item-${controlNumber}`}>
      <Row>
        <Col span={1}>
          <Radio
            value={controlNumber}
            data-testid={`reference-drawer-radio-${controlNumber}`}
          />
        </Col>
        <Col span={23}>
          <Card className="reference-result-item">
            <div>
              <Link
                data-testid="result-item-title"
                className="result-item-title"
                to={`${LITERATURE}/${controlNumber}`}
              >
                <LiteratureTitle title={title} />
              </Link>
            </div>
            <div className="mt1">
              <AuthorsAndCollaborations
                authorCount={authorCount}
                authors={authors}
                collaborations={collaborations}
                collaborationsWithSuffix={collaborationsWithSuffix}
              />
            </div>
            <div>
              {date && (
                <>
                  (<LiteratureDate date={date} />)
                </>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

interface CurateReferenceDrawerProps {
  recordId: string;
  recordUuid: string;
  revisionId: number;
  referenceId: number;
  onDrawerClose: () => void;
  onCurate: (args: {
    recordId: string;
    recordUuid: string;
    revisionId: number;
    referenceId: number;
    newReferenceId: number;
  }) => void;
  loading: boolean;
  visible: boolean;
}

function CurateReferenceDrawer({
  recordId,
  recordUuid,
  revisionId,
  referenceId,
  onDrawerClose,
  onCurate,
  loading,
  visible,
}: CurateReferenceDrawerProps) {
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  const onSelectedRecordChange = useCallback((event: RadioChangeEvent) => {
    setSelectedRecordId(event.target.value);
  }, []);

  const onSelectClick = useCallback(() => {
    onCurate({
      recordId,
      recordUuid,
      revisionId,
      referenceId,
      newReferenceId: selectedRecordId!,
    });
    onDrawerClose();
    setSelectedRecordId(null);
  }, [
    recordId,
    recordUuid,
    revisionId,
    referenceId,
    selectedRecordId,
    onCurate,
    onDrawerClose,
  ]);

  return (
    <Drawer
      className="search-drawer"
      rootClassName="curate-reference-drawer"
      placement="right"
      onClose={() => {
        onDrawerClose();
        setSelectedRecordId(null);
      }}
      destroyOnHidden
      open={visible}
      title="Find the correct reference:"
    >
      <div data-testid="reference-embedded-search">
        <EmbeddedSearchBoxContainer namespace={CURATE_REFERENCE_NS} />
      </div>
      <LoadingOrChildren loading={loading}>
        <div className="mt1">
          <NumberOfResultsContainer namespace={CURATE_REFERENCE_NS} />
        </div>
        <Radio.Group
          data-testid="reference-radio-group"
          className="w-100"
          onChange={onSelectedRecordChange}
          value={selectedRecordId}
        >
          <ResultsContainer
            namespace={CURATE_REFERENCE_NS}
            renderItem={renderReferenceItem}
          />
          <PaginationContainer namespace={CURATE_REFERENCE_NS} hideSizeChange />
        </Radio.Group>

        <Row className="mt2" justify="end">
          <Col>
            <Button
              data-testid="curate-button"
              disabled={selectedRecordId == null}
              icon={<SelectOutlined />}
              type="primary"
              onClick={onSelectClick}
            >
              Select
            </Button>
          </Col>
        </Row>
      </LoadingOrChildren>
    </Drawer>
  );
}

export default CurateReferenceDrawer;
