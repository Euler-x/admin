import { useState, useCallback } from "react";

export default function usePagination(initialPage = 1, initialPageSize = 20) {
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);

  const reset = useCallback(() => setPage(1), []);

  return { page, pageSize, setPage, reset };
}
