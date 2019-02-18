import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Card, Icon, Button, Modal, Table, Tabs, Tooltip } from 'antd';

import { LITERATURE } from '../../common/routes';

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
    render: query => <Link to={`${LITERATURE}?q=${query}`}>{query}</Link>,
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
    searchBy: 'Document type (type-code)',
    useOperators: 'tc, type-code, type, ty',
    example: 'For thesis: tc t',
  },
  {
    key: '7',
    searchBy: 'Citation number',
    useOperators: 'topcite,topcit, cited',
    example: 'topcite 1000+',
  },
  {
    key: '8',
    searchBy: 'Collaboration',
    useOperators: 'Cn, collaboration',
    example: 'cn babar',
  },
  {
    key: '9',
    searchBy: 'Journal',
    useOperators: 'J, journal, coden, published_in',
    example: 'j Nucl.Phys.,B164,171',
  },
  {
    key: '10',
    searchBy: 'Number of authors',
    useOperators: 'ac,author-count, authorcount',
    example: 'ac 1->10',
  },
  {
    key: '11',
    searchBy: 'Report number',
    useOperators: 'r,reportnumber, report-num, report, rept, rn',
    example: 'r ATLAS-CONF-2011-084',
  },
  {
    key: '12',
    searchBy: 'Citations of a record',
    useOperators: 'refersto:recid',
    example: 'refersto:recid:193978',
  },
  {
    key: '13',
    searchBy: 'Texkey',
    useOperators: 'texkey',
    example: 'texkey Lutz:2003jw',
  },
  {
    key: '14',
    searchBy: 'DOI',
    useOperators: 'doi',
    example: 'doi 10.1088/1475-7516/2013/05/009',
  },
  {
    key: '15',
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
                  <Link to={`${LITERATURE}?q=hierarchy discretely hook`}>
                    hierarchy discretely hook
                  </Link>
                </li>
                <li>
                  <Link
                    to={`${LITERATURE}?q=superconformal field theories Maldacena 1997`}
                  >
                    superconformal field theories Maldacena 1997
                  </Link>
                </li>
                <li>
                  <Link to={`${LITERATURE}?q=1605.03630`}>1605.03630</Link>
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
              Author name: <Link to={`${LITERATURE}?q=a witten`}>a witten</Link>
            </li>
            <li>
              Title:{' '}
              <Link to={`${LITERATURE}?q=t A First Course in String Theory`}>
                t A First Course in String Theory
              </Link>
            </li>
            <li>
              Exact author name:{' '}
              <Link to={`${LITERATURE}?q=ea ellis, j`}>ea ellis, j</Link>
            </li>
            <li>
              Date: <Link to={`${LITERATURE}?q=d 2015+`}>d 2015+</Link>
            </li>
          </ul>
          <h4>Free text search examples:</h4>
          <ul>
            <li>
              <Link to={`${LITERATURE}?q=hierarchy discretely hook`}>
                hierarchy discretely hook
              </Link>
            </li>
            <li>
              <Link
                to={`${LITERATURE}?q=superconformal field theories Maldacena 1997`}
              >
                superconformal field theories Maldacena 1997
              </Link>
            </li>
            <li>
              <Link to={`${LITERATURE}?q=1605.03630`}>1605.03630</Link>
            </li>
          </ul>
        </Card>
      </>
    );
  }
}

export default HowToSearch;
