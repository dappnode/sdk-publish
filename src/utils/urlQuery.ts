/**
 * Parses url params into an object
 * Sample params:
 * - timeapp.public.dappnode.eth
 * - 0.1.16
 * - /ipfs/QmSDgpiHco5yXdyVTfhKxr3aiJ82ynz8V14QcGKicM3rVh
 * @param params
 * @returns
 */
export const parseUrlQuery = (params = "") =>
  params.split("&").reduce((obj: { [key: string]: string }, pair) => {
    const [key, value] = pair.split("=");
    obj[key] = decodeURIComponent(value);
    return obj;
  }, {});

/**
 * Reverse of parseUrlQuery, such that:
 *   params = stringifyUrlQuery(parseUrlQuery(params))
 * @param obj
 * @returns params
 */
export const stringifyUrlQuery = (obj: { [key: string]: string }) =>
  Object.keys(obj)
    .map((key) => `${key}=${encodeURIComponent(obj[key])}`)
    .join("&");
