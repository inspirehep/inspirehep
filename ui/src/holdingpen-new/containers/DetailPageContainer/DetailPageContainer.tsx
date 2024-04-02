import React from 'react';
import Immutable, { List } from 'immutable';
import { SyncOutlined, RedoOutlined, EditOutlined } from '@ant-design/icons';
import { Row, Col, Button, Input, Space, Switch } from 'antd';

import './DetailPageContainer.less';
import Breadcrumbs from '../../components/Breadcrumbs';
import item from '../../mocks/mockDetaiPageData';
import references from '../../mocks/mockReferencesData';
import ContentBox from '../../../common/components/ContentBox';
import LiteratureTitle from '../../../common/components/LiteratureTitle';
import PublicationInfoList from '../../../common/components/PublicationInfoList';
import Abstract from '../../../literature/components/Abstract';
import DOIList from '../../../literature/components/DOIList';
import CollapsableForm from '../../../submissions/common/components/CollapsableForm';
import AuthorList from '../../../common/components/AuthorList';
import ReferenceList from '../../../literature/components/ReferenceList';
import UnclickableTag from '../../../common/components/UnclickableTag/UnclickableTag';

interface DetailPageContainerProps {
  item?: any;
}

const OPEN_SECTIONS = ['references', 'errors', 'delete'];

const DetailPageContainer: React.FC<DetailPageContainerProps> = () => {
  const numberOfAuthors = (item.get('authors') as List<any>)?.size || 0;
  return (
    <div
      className="__DetailPageContainer__"
      data-testid="holdingpen-detail-page"
    >
      <Breadcrumbs
        title1="Search"
        href1={`${document.referrer}`}
        title2={(item?.getIn(['title', 'title']) as string) || 'Details'}
        href2={`${item?.get('id')}`}
      />
      <Row justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <Row className="mv3" justify="center" gutter={35}>
            <Col xs={24}>
              <div className="bg-error white w-100">
                <p className="b f3 tc pv2">
                  ERROR on: Raise if a matching wf is not in completed state in
                  the HoldingPen. <u>View Stack Trace</u>
                </p>
              </div>
            </Col>
          </Row>
          <Row className="mv3" justify="center" gutter={35}>
            <Col xs={24} lg={16}>
              <ContentBox
                fullHeight={false}
                className="md-pb3 mb3 p3"
                smallPadding={false}
              >
                <h2>
                  <LiteratureTitle title={item.get('title')} />
                </h2>
                <div className="flex">
                  <AuthorList authors={item.get('authors')} />
                  <span className="ml1">({numberOfAuthors} authors)</span>
                </div>
                <div className="mt3">
                  <PublicationInfoList
                    publicationInfo={item.get('publicationInfo')}
                    bold
                  />
                  <div className="mv2" />
                  <Abstract abstract={item.get('abstract')} />
                  <div className="mv4" />
                  <DOIList dois={item.get('dois')} bold />
                </div>
              </ContentBox>
              <CollapsableForm openSections={OPEN_SECTIONS}>
                <CollapsableForm.Section header="Matches" key="matches">
                  <h2>
                    <LiteratureTitle title={item.get('title')} />
                  </h2>
                  <div className="flex">
                    <AuthorList authors={item.get('authors')} />
                    <span className="ml1">({numberOfAuthors} authors)</span>
                  </div>
                  <div className="mt3">
                    <PublicationInfoList
                      publicationInfo={item.get('publicationInfo')}
                      bold
                    />
                    <div className="mv2" />
                    <Abstract abstract={item.get('abstract')} />
                    <div className="mv4" />
                    <DOIList dois={item.get('dois')} bold />
                  </div>
                  <div className="flex mt4">
                    <Button className="font-white bg-completed db mr3 w-25">
                      Best match
                    </Button>
                    <Button className="font-white bg-error db w-25">
                      None of these
                    </Button>
                  </div>
                </CollapsableForm.Section>
                <CollapsableForm.Section header="References" key="references">
                  <ReferenceList
                    total={4}
                    disableEdit
                    references={
                      Immutable.fromJS(references) as unknown as any[]
                    }
                    query={{ size: 10, page: 1 }}
                    onPageChange={() => {}}
                  />
                </CollapsableForm.Section>
                <CollapsableForm.Section header="Errors" key="errors">
                  <div className="error-code bg-waiting">
                    {item.get('error')}
                  </div>
                </CollapsableForm.Section>
                <CollapsableForm.Section
                  header="Subject Areas"
                  key="subject-areas"
                >
                  <div className="flex justify-between mb2">
                    <span className="waiting">
                      <b>Term</b>
                    </span>
                    <span className="waiting">
                      <b>Source</b>
                    </span>
                  </div>
                  <div className="flex justify-between mb4">
                    <span>Experiment-HEP</span>
                    <UnclickableTag color="green">12</UnclickableTag>
                  </div>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input placeholder="Add subject areas" />
                    <Button type="primary">+ Add</Button>
                  </Space.Compact>
                </CollapsableForm.Section>
                <CollapsableForm.Section
                  header="Suggested Keywords"
                  key="keywords"
                >
                  <div className="flex justify-between mb2">
                    <span className="waiting">
                      <b>Name</b>
                    </span>
                    <div className="flex justify-between">
                      <span className="waiting mr6">
                        <b>Score</b>
                      </span>
                      <span className="waiting">
                        <b>Accept</b>
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between mb4">
                    <span>HEP</span>
                    <div className="flex justify-between">
                      <span className="mr6">0.33</span>
                      <span>
                        <b>
                          <Switch defaultChecked />
                        </b>
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between mb4">
                    <span>Physics</span>
                    <div className="flex justify-between">
                      <span className="mr6">0.33</span>
                      <span>
                        <b>
                          <Switch defaultChecked />
                        </b>
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between mb4">
                    <span>Quantum physics</span>
                    <div className="flex justify-between">
                      <span className="mr6">0.33</span>
                      <span>
                        <b>
                          <Switch checked={false} />
                        </b>
                      </span>
                    </div>
                  </div>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input placeholder="Add keywords" />
                    <Button type="primary">+ Add</Button>
                  </Space.Compact>
                </CollapsableForm.Section>
                <CollapsableForm.Section header="Danger area" key="delete">
                  <Button className="font-white bg-error">Delete</Button>
                </CollapsableForm.Section>
              </CollapsableForm>
            </Col>
            <Col xs={24} lg={8}>
              <ContentBox
                className="mb3"
                fullHeight={false}
                subTitle="Decision"
              >
                Automatic Decision:{' '}
                <span className="halted">Non-CORE 0.55</span>
                <br />
                <br />
                References: <b>17/60</b> core, <b>52/60</b> matched
                <br />
                <br />
                <span className="waiting">
                  <b>4</b> core keywords from fulltext.
                </span>
                <br />
                <br />
                <span className="waiting">
                  <b>1</b> Filtered :
                </span>
                <br />
                <div className="flex justify-between mb3">
                  neutrino, mass
                  <UnclickableTag color="green">12</UnclickableTag>
                </div>
              </ContentBox>
              <ContentBox
                className="mb3"
                fullHeight={false}
                subTitle="Submission"
              >
                Harvested on{' '}
                <b>
                  {new Date('2024-05-20T15:30:20.467877').toLocaleDateString()}
                </b>{' '}
                from <b>APS</b> using
                <b> hepcrawl</b>.
              </ContentBox>
              <ContentBox
                className="mb3"
                fullHeight={false}
                subTitle="SNow information"
              >
                No SNow tickets found.
              </ContentBox>
              <ContentBox fullHeight={false} subTitle="Actions">
                <div className="flex flex-column">
                  <Button className="mb2">
                    <SyncOutlined />
                    Restart workflow
                  </Button>
                  <Button className="mb2">
                    <RedoOutlined />
                    Restart current step
                  </Button>
                  <Button type="primary">
                    <EditOutlined />
                    Open in Editor
                  </Button>
                </div>
              </ContentBox>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default DetailPageContainer;
