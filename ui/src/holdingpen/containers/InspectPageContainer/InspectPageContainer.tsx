import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Row, Col, Card } from 'antd';

import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import JsonDiff from '../../components/JsonDiff';
import fetchInspect from '../../../actions/inspect';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';

import './InspectPage.scss';

class InspectPage extends Component {
  componentDidMount() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'match' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { match, dispatch } = this.props;
    const workflowId = match.params.id;
    dispatch(fetchInspect(workflowId));
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'loading' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { loading, data } = this.props;
    const root = data.root || {};
    const head = data.head || {};
    const update = data.update || {};
    const merged = data.merged || {};

    return (
      <div className="__InspectPage__ w-100">
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <LoadingOrChildren loading={loading}>
          <Row
            align="middle"
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            type="flex"
            justify="space-around"
            gutter={16}
            className="w-100 mt3"
          >
            <Col span={8}>
              <Card title="Head on root">
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                <JsonDiff first={root} second={head} />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Update on root">
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                <JsonDiff first={root} second={update} />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Merged on head">
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                <JsonDiff first={head} second={merged} />
              </Card>
            </Col>
          </Row>
        </LoadingOrChildren>
      </div>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
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

const mapStateToProps = (state: any) => ({
  data: state.inspect.get('data'),
  loading: state.inspect.get('loading')
});
const dispatchToProps = (dispatch: any) => ({
  dispatch
});

export default connect(mapStateToProps, dispatchToProps)(
  convertAllImmutablePropsToJS(InspectPage)
);
