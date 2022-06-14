import { useEffect, useRef } from 'react';

export default function usePrevious(value: $TSFixMe) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
