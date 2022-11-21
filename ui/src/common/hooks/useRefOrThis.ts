import { ForwardedRef, useRef } from 'react';

export default function useRefOrThis(aRef: ForwardedRef<any>) {
  const ref = useRef();
  return aRef || ref;
}
