import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { Map } from 'immutable';
import { Input, Button, Alert, Row, Col } from 'antd';
import LinkLikeButton from '../../../common/components/LinkLikeButton';

class DataImporterContainer extends Component {
  constructor(props) {
    super(props);
    this.onImportChange = this.onImportChange.bind(this);
  }

  async onImportChange(event) {
    const {
      target: { value },
    } = event;
    this.importValue = value;
  }

  async onImportClick() {
    const { dispatch } = this.props;
    dispatch(); // TODO: dispatch import action
  }

  render() {
    const { onSkipClick } = this.props;
    return (
      <div>
        <Row className="mb3">
          <Col>
            <Alert
              message="Fill in both fields to automatically import more data from arXiv or DOI"
              type="info"
            />
          </Col>
        </Row>
        <Row className="mb3" type="flex" justify="end" align="middle">
          <Col className="pr2">From arXiv or DOI:</Col>
          <Col span={19}>
            <Input
              placeholder="hep-th/9711200 or 1207.7235 or arXiv:1001.4538 or 10.1086/305772 or doi:10.1086/305772"
              onChange={this.onImportChange}
              onPressEnter={this.onImportClick}
            />
          </Col>
        </Row>
        <Row type="flex" justify="space-between" align="middle">
          <Col>
            <LinkLikeButton onClick={onSkipClick}>
              Skip and fill the form manually
            </LinkLikeButton>
          </Col>
          <Col>
            <Button onClick={this.onImportClick} type="primary">
              Import
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

DataImporterContainer.propTypes = {
  // TODO: maybe use portal to put this future directly into SubmissionPage or remove this component fully since it's not used anywhere else.
  onSkipClick: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  // error: PropTypes.instanceOf(Map), // eslint-disable-line react/require-default-props
};

const stateToProps = state => ({
  error: state.submissions.get('initialDataError'),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(DataImporterContainer);
