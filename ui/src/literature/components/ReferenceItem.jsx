import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { List, Row, Col, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined } from '@ant-design/icons';

import AuthorsAndCollaborations from '../../common/components/AuthorsAndCollaborations';
import ArxivEprintList from './ArxivEprintList';
import PublicationInfoList from '../../common/components/PublicationInfoList';
import DOIList from './DOIList';
import { LITERATURE } from '../../common/routes';
import LiteratureTitle from '../../common/components/LiteratureTitle';
import URLList from '../../common/components/URLList';
import {
  InlineUL,
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';
import IconText from '../../common/components/IconText';
import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import { getConfigFor } from '../../common/config';

class ReferenceItem extends Component {
  static renderLabel(reference) {
    const label = reference.get('label');
    const labelDisplay = label ? <span>[{label}]</span> : null;
    return labelDisplay;
  }

  static renderTitle(reference) {
    const recordId = reference.get('control_number');
    const title = reference.getIn(['titles', 0]);
    if (recordId && title) {
      return (
        <Link className="f5" to={`${LITERATURE}/${recordId}`}>
          <LiteratureTitle title={title} />
        </Link>
      );
    }

    if (title) {
      return (
        <div className="f5">
          <LiteratureTitle title={title} />
        </div>
      );
    }

    return null;
  }

  static renderMisc(reference) {
    const misc = reference.get('misc');
    return misc && <div>{misc}</div>;
  }

  render() {
    const { reference } = this.props;
    const publicationInfo = reference.get('publication_info');
    const arxivEprint = reference.get('arxiv_eprint');
    const dois = reference.get('dois');
    const urls = reference.get('urls');
    const recordId = reference.get('control_number');

    const authors = reference.get('authors');
    const collaborations = reference.get('collaborations');
    const collaborationsWithSuffix = reference.get(
      'collaborations_with_suffix'
    );

    return (
      <List.Item>
        <Row
          gutter={24}
          type="flex"
          justify="start"
          align="middle"
          className="w-100 sm-plus-flex-nowrap"
        >
          <Col className="xs-sm-col-24">
            <div className="flex">
              {ReferenceItem.renderLabel(reference)}
            </div>
          </Col>
          <Col style={{ width: '100%' }}>
            <List.Item.Meta
              title={ReferenceItem.renderTitle(reference)}
              description={
                <Fragment>
                  {ReferenceItem.renderMisc(reference)}
                  <AuthorsAndCollaborations
                    authors={authors}
                    collaborations={collaborations}
                    collaborationsWithSuffix={collaborationsWithSuffix}
                    page="Literature detail"
                  />
                  <InlineUL
                    separator={SEPARATOR_MIDDLEDOT}
                    wrapperClassName="secondary-container"
                  >
                    {publicationInfo && (
                      <PublicationInfoList
                        publicationInfo={publicationInfo}
                        labeled={false}
                      />
                    )}
                    {arxivEprint && (
                      <ArxivEprintList
                        page="Literature detail"
                        eprints={arxivEprint}
                      />
                    )}
                    {dois && <DOIList dois={dois} />}
                    {urls && !recordId && <URLList urls={urls} />}
                  </InlineUL>
                </Fragment>
              }
            />
          </Col>
          {getConfigFor('SELF_CURATION_BUTTON') && (
            <Col className="xs-sm-col-24 pr3">
              <Tooltip title="Edit this reference">
                <div className="flex items-center justify-center">
                  <LinkWithTargetBlank
                    href="/"
                    style={{
                      color: '#0050b3',
                      fontStyle: 'normal',
                      textDecoration: 'none',
                    }}
                  >
                    <IconText
                      text="edit"
                      icon={<EditOutlined />}
                      className="flex items-center justify-center pr2"
                    />
                  </LinkWithTargetBlank>
                </div>
              </Tooltip>
            </Col>
          )}
        </Row>
      </List.Item>
    );
  }
}

ReferenceItem.propTypes = {
  reference: PropTypes.instanceOf(Map).isRequired,
};

export default ReferenceItem;
