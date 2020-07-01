export function getEventTitle(seminar) {
  const seminarTitle = seminar.getIn(['title', 'title']);
  const speakers = seminar.get('speakers');
  const speaker = speakers.get(0);
  return `${speaker.get('first_name')} ${speaker.get('last_name')} ${
    speakers.size > 1 ? ' et al. ' : ''
  } — ${seminarTitle}`;
}
