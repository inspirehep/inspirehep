import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Row, Col, Card } from 'antd';

import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import JsonDiff from '../../components/JsonDiff';
import fetchInspect from '../../../actions/inspect';
import toJS from '../../../common/immutableToJS';

import './InspectPage.scss';

class InspectPage extends Component {
  componentDidMount() {
    const workflowId = this.props.match.params.id;
    this.props.dispatch(fetchInspect(workflowId));
  }

  render() {
    const { loading, data } = this.props;
    const root = data.root || {};
    const head = data.head || {};
    const update = data.update || {};
    const merged = data.merged || {};

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
              <Card title="Head on root">
                <JsonDiff first={root} second={head} />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Update on root">
                <JsonDiff first={root} second={update} />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Merged on head">
                <JsonDiff first={head} second={merged} />
              </Card>
            </Col>
          </Row>
        </LoadingOrChildren>
      </div>
    );
  }
}

InspectPage.propTypes = {
  data: PropTypes.shape({
    root: PropTypes.objectOf(PropTypes.any),
    head: PropTypes.objectOf(PropTypes.any),
    update: PropTypes.objectOf(PropTypes.any),
    merged: PropTypes.objectOf(PropTypes.any),
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

const mapStateToProps = state => ({
  data: state.inspect.get('data'),
  loading: state.inspect.get('loading'),
});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(toJS(InspectPage));
