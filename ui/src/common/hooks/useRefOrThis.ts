import { useRef } from 'react';

export default function useRefOrThis(aRef) {
  const ref = useRef();
  return aRef || ref;
}
