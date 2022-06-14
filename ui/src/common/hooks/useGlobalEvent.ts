import { useEffect, useRef } from 'react';

export function useGlobalEvent(eventName: $TSFixMe, callback: $TSFixMe) {
  const callbackRef = useRef();
  callbackRef.current = callback;
  useEffect(
    () => {
      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
      const eventCallback = (event: $TSFixMe) => callbackRef.current(event);
      window.addEventListener(eventName, eventCallback);

      return () => {
        window.removeEventListener(eventName, eventCallback);
      };
    },
    [eventName]
  );
}
