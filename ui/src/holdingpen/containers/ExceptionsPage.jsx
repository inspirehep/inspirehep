import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import fetchExceptions from '../../actions/exceptions';
import toJS from '../../common/immutableToJS';
import ExceptionsDashboard from '../components/ExceptionsDashboard';

class ExceptionsPage extends Component {
  componentWillMount() {
    this.props.dispatch(fetchExceptions());
  }

  render() {
    return <ExceptionsDashboard exceptions={this.props.exceptions} />;
  }
}

ExceptionsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  exceptions: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = state => ({
  exceptions: state.exceptions.get('data'),
});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(toJS(ExceptionsPage));
