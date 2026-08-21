import { Navigate, Route, Routes } from 'react-router-dom';
import { ReactNode } from 'react';
import { ERRORS } from '../routes';

interface RoutesWithFallbackProps {
  children: ReactNode;
}

function RoutesWithFallback({ children }: RoutesWithFallbackProps) {
  return (
    <Routes>
      {children}
      <Route path="*" element={<Navigate to={ERRORS} replace />} />
    </Routes>
  );
}

export default RoutesWithFallback;
