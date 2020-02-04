import { replace } from "connected-react-router"

export function setHash(hash) {
  return (dispatch, getState) => {
    const { router } = getState();
    const newLocation = { ...router.location, hash }
    dispatch(replace(newLocation));
  }
}
