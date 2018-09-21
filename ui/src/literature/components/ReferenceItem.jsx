import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { List, Row, Col } from 'antd';
import { Link } from 'react-router-dom';

import AuthorList from '../../common/components/AuthorList';
import ArxivEprintList from './ArxivEprintList';
import Latex from '../../common/components/Latex';
import PublicationInfoList from '../../common/components/PublicationInfoList';
import DOIList from './DOIList';
import URLList from './URLList';

class ReferenceItem extends Component {
  static renderLabel(reference) {
    const label = reference.get('label');
    const labelDisplay = label ? `[${label}] ` : null;
    return labelDisplay;
  }

  static renderTitle(reference) {
    const recordId = reference.get('control_number');
    const title = reference.getIn(['titles', 0, 'title'], '');
    if (recordId && title) {
      return (
        <Link className="f5" to={`/literature/${recordId}`}>
          <Latex>{title}</Latex>
        </Link>
      );
    } else if (title) {
      return <span className="f5">{title}</span>;
    }
    return null;
  }

  static renderMisc(reference) {
    const misc = reference.get('misc');
    return misc && <span>{misc}</span>;
  }

  render() {
    const { reference } = this.props;
    const publicationInfo = reference.get('publication_info');
    const arxivEprint = reference.get('arxiv_eprint');
    const dois = reference.get('dois');
    const urls = reference.get('urls');

    return (
      <List.Item>
        <Row gutter={24} type="flex" justify="space-around" align="middle">
          <Col>{ReferenceItem.renderLabel(reference)}</Col>
          <Col>
            <List.Item.Meta
              title={ReferenceItem.renderTitle(reference)}
              description={
                <Fragment>
                  {ReferenceItem.renderMisc(reference)}
                  <AuthorList
                    recordId={reference.get('control_number')}
                    authors={reference.get('authors')}
                  />
                  <PublicationInfoList
                    publicationInfo={publicationInfo}
                    labeled={false}
                    wrapperClassName="di"
                  />
                  <ul className="bulleted-inline-list secondary">
                    {arxivEprint && (
                      <li className="dib ml1 mr1">
                        <i>
                          <ArxivEprintList
                            eprints={arxivEprint}
                            wrapperClassName="di"
                          />
                        </i>
                      </li>
                    )}
                    {dois && (
                      <li className="dib ml1 mr1">
                        <i>
                          <DOIList dois={dois} wrapperClassName="di" />
                        </i>
                      </li>
                    )}
                    {urls && (
                      <li className="dib ml1 mr1">
                        <i>
                          <URLList urls={urls} wrapperClassName="di" />
                        </i>
                      </li>
                    )}
                  </ul>
                </Fragment>
              }
            />
          </Col>
        </Row>
      </List.Item>
    );
  }
}

ReferenceItem.propTypes = {
  reference: PropTypes.instanceOf(Map).isRequired,
};

export default ReferenceItem;
