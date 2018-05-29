import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Spin, Row, Col } from 'antd';
import { Map } from 'immutable';

import fetch from './../../../actions/literature';

import './DetailPage.scss';

class DetailPage extends Component {
  componentWillMount() {
    this.props.dispatch(fetch(this.props.match.params.id));
  }

  render() {
    return (
      <Row className="__DetailPage__" type="flex" justify="center">
        <Col className="content" span={16}>
          {this.props.loading && <Spin tip="Loading" />}
          <h2>{this.props.record.getIn(['metadata', 'titles', 0, 'title'])}</h2>
          <p>
            {this.props.record.getIn(['metadata', 'abstracts', 0, 'value'])}
          </p>
        </Col>
      </Row>
    );
  }
}

DetailPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.objectOf(PropTypes.object).isRequired,
  record: PropTypes.instanceOf(Map).isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  loading: state.literature.get('loading'),
  record: state.literature.get('data'),
});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(DetailPage);
