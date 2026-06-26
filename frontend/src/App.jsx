import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { parseTableFromLocation } from './config';
import { CartProvider } from './context/CartContext';
import { MenuProvider } from './context/MenuContext';
import { TableProvider } from './context/TableContext';
import MenuView from './views/MenuView';
import AdminView from './views/AdminView';

export default function App() {
  useEffect(() => {
    const table = parseTableFromLocation();
    if (table) {
      localStorage.setItem('selected_table', table);
      console.log(`Вы вошли со стола №${table}.`);
    }
  }, []);

  return (
    <MenuProvider>
      <CartProvider>
        <TableProvider>
          <Routes>
            <Route path="/" element={<MenuView />} />
            <Route path="/admin" element={<AdminView />} />
          </Routes>
        </TableProvider>
      </CartProvider>
    </MenuProvider>
  );
}
