import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { parseTableFromPath } from './config';
import { CartProvider } from './context/CartContext';
import { MenuProvider } from './context/MenuContext';
import { TableProvider } from './context/TableContext';
import MenuView from './views/MenuView';
import AdminView from './views/AdminView';

export default function App() {
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const tableIndex = pathParts.indexOf('table');
    if (tableIndex !== -1 && pathParts[tableIndex + 1]) {
      const tableId = pathParts[tableIndex + 1].trim();
      localStorage.setItem('selected_table', tableId);
      console.log('Успешно зафиксирован Стол №:', tableId);
      return;
    }

    const table = parseTableFromPath();
    if (table) {
      localStorage.setItem('selected_table', table);
      console.log('Успешно зафиксирован Стол №:', table);
    }
  }, []);

  return (
    <MenuProvider>
      <CartProvider>
        <TableProvider>
          <Routes>
            <Route path="/" element={<MenuView />} />
            <Route path="/table/:tableId" element={<MenuView />} />
            <Route path="/admin" element={<AdminView />} />
          </Routes>
        </TableProvider>
      </CartProvider>
    </MenuProvider>
  );
}
