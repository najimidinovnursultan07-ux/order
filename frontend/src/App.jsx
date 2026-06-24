import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { MenuProvider } from './context/MenuContext';
import { TableProvider } from './context/TableContext';
import MenuView from './views/MenuView';
import AdminView from './views/AdminView';

export default function App() {
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
