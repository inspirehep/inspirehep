import { Component } from 'react';
import { Row } from 'antd';
import { Route, Routes, Navigate } from 'react-router-dom';

import { ERROR_404 } from '../common/routes';
import Error404 from './components/Error404';
import Error401 from './components/Error401';
import Error500 from './components/Error500';
import ErrorNetwork from './components/ErrorNetwork';

class Errors extends Component {
  render() {
    return (
      <Row
        className="w-100 h-100"
        type="flex"
        justify="center"
        align="middle"
        data-testid="errors"
      >
        <Routes>
          <Route path="401" element={<Error401 />} />
          <Route path="404" element={<Error404 />} />
          <Route path="500" element={<Error500 />} />
          <Route path="network" element={<ErrorNetwork />} />
          <Route path="*" element={<Navigate to={ERROR_404} replace />} />
        </Routes>
      </Row>
    );
  }
}

export default Errors;
