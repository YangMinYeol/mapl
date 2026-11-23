import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useErrorHandler } from "./useErrorHandler";

// A mutation can finish after the user has moved to a different date or account.
export function usePlannerList(query) {
  const current = useRef(null);
  const sequence = useRef(0);
  const handleError = useErrorHandler();
  const [result, setResult] = useState(null);

  useLayoutEffect(() => {
    current.current = { query, handleError };
    return () => { current.current = null; };
  }, [query, handleError]);

  const reload = useCallback(async () => {
    const request = current.current?.query;
    if (!request) return;
    const id = ++sequence.current;
    setResult((previous) => ({
      query: request,
      items: previous?.query === request ? previous.items : [],
      pending: true,
    }));
    const stillCurrent = () => current.current?.query === request && sequence.current === id;
    try {
      const items = await request();
      if (stillCurrent()) setResult({ query: request, items, pending: false });
    } catch (error) {
      if (stillCurrent()) {
        setResult((previous) => ({ ...previous, pending: false }));
        current.current.handleError(error);
      }
    }
  }, []);

  useEffect(() => {
    reload();
    return () => { sequence.current++; };
  }, [query, reload]);

  const matchesQuery = result?.query === query;
  return [matchesQuery ? result.items : [], reload, Boolean(query && (!matchesQuery || result.pending))];
}
