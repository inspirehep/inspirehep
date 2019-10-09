import React, { Component } from 'react';
import { Card, Icon, Button, Modal, Table, Tabs, Tooltip } from 'antd';
import ExternalLink from '../../common/components/ExternalLink';
import LinkWithEncodedLiteratureQuery from './LinkWithEncodedLiteratureQuery';

const TABLE_COLUMNS = [
  {
    title: 'Search by',
    dataIndex: 'searchBy',
  },
  {
    title: 'Use operators',
    dataIndex: 'useOperators',
  },
  {
    title: 'Example',
    dataIndex: 'example',
    render: query => <LinkWithEncodedLiteratureQuery query={query} />,
  },
];

const DATA = [
  {
    key: '1',
    searchBy: 'Author name',
    useOperators: 'a, au, author, name',
    example: 'a witten',
  },
  {
    key: '2',
    searchBy: 'Author BAI',
    useOperators: 'a, au, author, name',
    example: 'a J.M.Maldacena.1',
  },
  {
    key: '3',
    searchBy: 'Title',
    useOperators: 't, title, ti',
    example: 't A First Course in String Theory',
  },
  {
    key: '4',
    searchBy: 'Eprint',
    useOperators: 'eprint',
    example: 'eprint 1605.03630',
  },
  {
    key: '5',
    searchBy: 'Exact author name',
    useOperators: 'ea, exactauthor, exact-author',
    example: 'ea ellis, j',
  },
  {
    key: '6',
    searchBy: (
      <>
        Document type{' '}
        <ExternalLink href="http://inspirehep.net/info/hep/search-tips#tc">
          (type-code)
        </ExternalLink>
      </>
    ),
    useOperators: 'tc, type-code, type, ty',
    example: 'tc t',
  },
  {
    key: '8',
    searchBy: 'Date',
    useOperators: 'd, date, year',
    example: 'd 2015+',
  },
  {
    key: '9',
    searchBy: 'Citation number',
    useOperators: 'topcite, topcit, cited',
    example: 'topcite 1000+',
  },
  {
    key: '8',
    searchBy: 'Collaboration',
    useOperators: 'cn, collaboration',
    example: 'cn babar',
  },
  {
    key: '10',
    searchBy: 'Journal',
    useOperators: 'j, journal, coden, published_in',
    example: 'j Nucl.Phys.,B164,171',
  },
  {
    key: '11',
    searchBy: 'Number of authors',
    useOperators: 'ac, authorcount',
    example: 'ac 1->10',
  },
  {
    key: '12',
    searchBy: 'Report number',
    useOperators: 'r, reportnumber, report-num, report, rept, rn',
    example: 'r ATLAS-CONF-2011-084',
  },
  {
    key: '13',
    searchBy: 'Citations of a record',
    useOperators: 'refersto:recid',
    example: 'refersto:recid:193978',
  },
  {
    key: '14',
    searchBy: 'Texkey',
    useOperators: 'texkey',
    example: 'texkey Lutz:2003jw',
  },
  {
    key: '15',
    searchBy: 'DOI',
    useOperators: 'doi',
    example: 'doi 10.1088/1475-7516/2013/05/009',
  },
  {
    key: '16',
    searchBy: 'Record id',
    useOperators: 'recid, control_number',
    example: 'recid:193978',
  },
];

class HowToSearch extends Component {
  constructor(props) {
    super(props);
    this.onModalOpen = this.onModalOpen.bind(this);
    this.onModalClose = this.onModalClose.bind(this);

    this.state = {
      modalVisible: false,
    };
  }

  onModalOpen() {
    this.setState({
      modalVisible: true,
    });
  }

  onModalClose() {
    this.setState({
      modalVisible: false,
    });
  }

  renderInfoButton() {
    return (
      <Tooltip title="Search Tips">
        <Button shape="circle" onClick={this.onModalOpen}>
          <Icon type="info-circle" theme="twoTone" />
        </Button>
      </Tooltip>
    );
  }

  static renderModalContent() {
    return (
      <>
        <p>
          INSPIRE beta supports the most popular SPIRES syntax operators and
          free text searches.
        </p>
        <Tabs type="card">
          <Tabs.TabPane tab="SPIRES style search" key="1">
            <div className="pa3">
              <Table
                size="small"
                dataSource={DATA}
                columns={TABLE_COLUMNS}
                pagination={false}
              />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Free text search (under development)" key="2">
            <div className="pa3">
              <p>
                Users can also type free text searches using any combination of
                author names, title, dates etc. (feature under development).
              </p>
              <ul>
                <li>
                  <LinkWithEncodedLiteratureQuery query="n=2 pedestrians tachikawa" />
                </li>
                <li>
                  <LinkWithEncodedLiteratureQuery query="superconformal field theories Maldacena 1997" />
                </li>
                <li>
                  <LinkWithEncodedLiteratureQuery query="1207.7214" />
                </li>
              </ul>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </>
    );
  }

  render() {
    const { modalVisible } = this.state;
    return (
      <>
        <Modal
          visible={modalVisible}
          destroyOnClose
          width={1000}
          title="Search Tips"
          footer={false}
          onCancel={this.onModalClose}
        >
          {HowToSearch.renderModalContent()}
        </Modal>
        <Card title="How to search" extra={this.renderInfoButton()}>
          <h4>SPIRES style search examples:</h4>
          <ul>
            <li>
              Author name: <LinkWithEncodedLiteratureQuery query="a witten" />
            </li>
            <li>
              Title:{' '}
              <LinkWithEncodedLiteratureQuery query="t A First Course in String Theory" />
            </li>
            <li>
              Exact author name:{' '}
              <LinkWithEncodedLiteratureQuery query="ea ellis, j" />
            </li>
            <li>
              Date: <LinkWithEncodedLiteratureQuery query="d 2015+" />
            </li>
          </ul>
          <h4>Free text search examples:</h4>
          <ul>
            <li>
              <LinkWithEncodedLiteratureQuery query="n=2 pedestrians tachikawa" />
            </li>
            <li>
              <LinkWithEncodedLiteratureQuery query="superconformal field theories Maldacena 1997" />
            </li>
            <li>
              <LinkWithEncodedLiteratureQuery query="1207.7214" />
            </li>
          </ul>
        </Card>
      </>
    );
  }
}

export default HowToSearch;
