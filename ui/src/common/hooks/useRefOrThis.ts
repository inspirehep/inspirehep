import { useRef } from 'react';

export default function useRefOrThis(aRef: $TSFixMe) {
  const ref = useRef();
  return aRef || ref;
}
