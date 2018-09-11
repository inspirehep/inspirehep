import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import fetchExceptions from '../../actions/exceptions';
import toJS from '../../common/immutableToJS';
import ExceptionsDashboard from '../components/ExceptionsDashboard';

class ExceptionsPage extends Component {
  componentDidMount() {
    this.props.dispatch(fetchExceptions());
  }

  render() {
    return (
      <ExceptionsDashboard
        exceptions={this.props.exceptions}
        loading={this.props.loading}
      />
    );
  }
}

ExceptionsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  exceptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  exceptions: state.exceptions.get('data'),
  loading: state.exceptions.get('loading'),
});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(toJS(ExceptionsPage));
