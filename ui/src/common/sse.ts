const SSE_DATA_PREFIX = 'data: ';
const SSE_EVENT_SEPARATOR = '\n\n';

export interface ServerSentEvent {
  type: string;
  [key: string]: any;
}

function streamingError(status: number, data: any) {
  const error: any = new Error(`Request failed with status code ${status}`);
  error.response = { status, data };
  return error;
}

function parseEvent(rawEvent: string): ServerSentEvent | null {
  const data = rawEvent
    .split('\n')
    .filter((line) => line.startsWith(SSE_DATA_PREFIX))
    .map((line) => line.slice(SSE_DATA_PREFIX.length))
    .join('');

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function postForServerSentEvents(
  url: string,
  body: unknown,
  onEvent: (event: ServerSentEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw streamingError(response.status, data);
  }
  if (!response.body) {
    throw streamingError(response.status, {
      message: 'This browser cannot read streaming responses.',
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const rawEvents = buffer.split(SSE_EVENT_SEPARATOR);
    buffer = rawEvents.pop() ?? '';

    rawEvents.forEach((rawEvent) => {
      const event = parseEvent(rawEvent);
      if (event) {
        onEvent(event);
      }
    });
  }
}
