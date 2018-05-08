import React, { Component } from 'react';
import data from '../report-errors.json';
import ExceptionsDashboard from '../components/ExceptionsDashboard';

class ExceptionsDashboardPage extends Component {
  render() {
    return <ExceptionsDashboard exceptions={data} />;
  }
}

export default ExceptionsDashboardPage;
