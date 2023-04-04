import React, { useState, useEffect } from 'react';
import * as Sentry from '@sentry/browser';

interface Props {
  children: React.ReactNode;
  renderError: (error: Error) => React.ReactNode;
}

function ErrorBoundary({ children, renderError }: Props) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    function handleError(error: ErrorEvent | Error, errorInfo: object) {
      if (
        error.message === 'ResizeObserver loop limit exceeded' ||
        error.message ===
          'ResizeObserver loop completed with undelivered notifications.'
      ) {
        return;
      }
      if (error instanceof ErrorEvent) {
        setError(error.error);
      } else {
        setError(error);
      }

      Sentry.withScope((scope) => {
        if (errorInfo) {
          Object.keys(errorInfo).forEach((key) => {
            scope.setExtra(key, errorInfo[key as keyof typeof errorInfo]);
          });
        }
        Sentry.captureException(error);
      });
    }

    // @ts-expect-error
    window.addEventListener('error', handleError);

    return () => {
      // @ts-expect-error
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (error) {
    return renderError(error);
  }

  return <>{children}</>;
}

export default ErrorBoundary;
