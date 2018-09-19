import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { List, Row, Col } from 'antd';
import { Link } from 'react-router-dom';

import AuthorList from '../../common/components/AuthorList';
import Latex from '../../common/components/Latex';
import PublicationInfoList from '../../common/components/PublicationInfoList';

class ReferenceItem extends Component {
  static renderLabel(reference) {
    const label = reference.get('label');
    const labelDisplay = label ? `[${label}] ` : null;
    return labelDisplay;
  }

  static renderTitleOrMisc(reference) {
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

  render() {
    const { reference } = this.props;
    const publicationInfo = reference.get('publication_info');
    const misc = reference.get('misc');
    return (
      <List.Item>
        <Row gutter={24} type="flex" justify="space-around" align="middle">
          <Col>{ReferenceItem.renderLabel(reference)}</Col>
          <Col>
            <List.Item.Meta
              title={ReferenceItem.renderTitleOrMisc(reference)}
              description={
                <Fragment>
                  {misc && <span>{misc}</span>}
                  <AuthorList
                    recordId={reference.get('control_number')}
                    authors={reference.get('authors')}
                  />
                  <PublicationInfoList
                    publicationInfo={publicationInfo}
                    labeled={false}
                  />
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
