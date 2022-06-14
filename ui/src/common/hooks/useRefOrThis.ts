import { useRef } from 'react';

export default function useRefOrThis(aRef: any) {
  const ref = useRef();
  return aRef || ref;
}
