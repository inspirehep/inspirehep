import React, { Component } from 'react';
import { connect } from 'react-redux';
import { diff, formatters } from 'jsondiffpatch';
import PropTypes from 'prop-types';
import { Row, Col, Card } from 'antd';
import { Map } from 'immutable';
import 'jsondiffpatch/dist/formatters-styles/html.css';

import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import fetchInspect from '../../../actions/inspect';

import './InspectPage.scss';

class InspectPage extends Component {
  componentWillMount() {
    const workflowId = this.props.match.params.id;
    this.props.dispatch(fetchInspect(workflowId));
  }

  /* eslint class-methods-use-this: ["error", { "exceptMethods": ["renderDiff"] }] */
  renderDiff(first, second) {
    const delta = diff(first, second);
    return (
      <div
        /* eslint-disable-next-line react/no-danger */
        dangerouslySetInnerHTML={{
          __html: formatters.html.format(delta, second),
        }}
      />
    );
  }

  render() {
    const { loading, data } = this.props;
    const root = data.get('root', {});
    const head = data.get('head', {});
    const update = data.get('update', {});
    const merged = data.get('merged', {});

    return (
      <div className="__InspectPage__ w-100">
        <LoadingOrChildren loading={loading}>
          <Row
            align="center"
            type="flex"
            justify="space-around"
            gutter={16}
            className="w-100 mt3"
          >
            <Col span={8}>
              <Card title="Root on record">{this.renderDiff(root, head)}</Card>
            </Col>
            <Col span={8}>
              <Card title="Root on harvested">
                {this.renderDiff(root, update)}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Root on merged">
                {this.renderDiff(root, merged)}
              </Card>
            </Col>
          </Row>
        </LoadingOrChildren>
      </div>
    );
  }
}

InspectPage.propTypes = {
  data: PropTypes.instanceOf(Map).isRequired,
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

const mapStateToProps = state => ({
  data: state.inspect.get('data'),
  loading: state.inspect.get('loading'),
});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(InspectPage);
