import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

import { parseTableFromPath } from '../config';

const TABLE_STORAGE_KEY = 'selected_table';

const TableContext = createContext(null);

function readStoredTable() {
  try {
    return localStorage.getItem(TABLE_STORAGE_KEY)?.trim() || '';
  } catch {
    return '';
  }
}

function persistTable(value) {
  try {
    const next = String(value ?? '').trim();
    if (next) {
      localStorage.setItem(TABLE_STORAGE_KEY, next);
    } else {
      localStorage.removeItem(TABLE_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function TableProvider({ children }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlTable =
    parseTableFromPath(location.pathname) ||
    searchParams.get('table')?.trim() ||
    null;

  const [manualTable, setManualTable] = useState(() => readStoredTable());

  useEffect(() => {
    if (urlTable) {
      persistTable(urlTable);
    }
  }, [urlTable]);

  const setTableNumber = useCallback((value) => {
    const next = String(value ?? '').trim();
    setManualTable(next);
    persistTable(next);
  }, []);

  const tableNumber = urlTable || manualTable;
  const isFromUrl = Boolean(urlTable);
  const isTableSelected = Boolean(tableNumber);

  const value = useMemo(
    () => ({
      tableNumber,
      setTableNumber,
      isFromUrl,
      isTableSelected,
      tableParam: urlTable,
    }),
    [tableNumber, setTableNumber, isFromUrl, isTableSelected, urlTable],
  );

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}

export function useTable() {
  const ctx = useContext(TableContext);
  if (!ctx) throw new Error('useTable must be used within TableProvider');
  return ctx;
}
