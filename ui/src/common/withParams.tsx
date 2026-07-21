import { ComponentType } from 'react';
import { useParams } from 'react-router-dom';

export default function withParams(WrappedComponent: ComponentType<any>) {
  return function WithParams(props: any) {
    const params = useParams();
    return <WrappedComponent {...props} match={{ params }} />;
  };
}
