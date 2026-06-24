const DB_NAME = 'qr-menu-offline';
const DB_VERSION = 1;
const STORE_ORDERS = 'pending_orders';
const STORE_MENU = 'menu_cache';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_ORDERS)) {
        db.createObjectStore(STORE_ORDERS, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_MENU)) {
        db.createObjectStore(STORE_MENU, { keyPath: 'key' });
      }
    };
  });
}

async function withStore(storeName, mode, callback) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = callback(store);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
}

export async function savePendingOrder(payload) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ORDERS, 'readwrite');
    const store = tx.objectStore(STORE_ORDERS);
    const record = {
      payload,
      createdAt: new Date().toISOString(),
      synced: false,
    };
    const request = store.add(record);
    request.onsuccess = () => {
      resolve({ ...record, id: request.result, offline: true });
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingOrders() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ORDERS, 'readonly');
    const store = tx.objectStore(STORE_ORDERS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removePendingOrder(id) {
  await withStore(STORE_ORDERS, 'readwrite', (store) => store.delete(id));
}

export async function cacheMenuData(categories, products) {
  await withStore(STORE_MENU, 'readwrite', (store) => {
    store.put({ key: 'categories', data: categories, cachedAt: Date.now() });
    store.put({ key: 'products', data: products, cachedAt: Date.now() });
  });
}

export async function getCachedMenuData() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MENU, 'readonly');
    const store = tx.objectStore(STORE_MENU);
    const categoriesReq = store.get('categories');
    const productsReq = store.get('products');

    let categories = null;
    let products = null;

    categoriesReq.onsuccess = () => {
      categories = categoriesReq.result?.data ?? null;
    };
    productsReq.onsuccess = () => {
      products = productsReq.result?.data ?? null;
    };

    tx.oncomplete = () => resolve({ categories, products });
    tx.onerror = () => reject(tx.error);
  });
}

export function getPendingCount() {
  return getPendingOrders().then((orders) => orders.length);
}
