import { useState, useEffect } from "react";

export const useArray = (storageKey) => {
  const [items, setItems] = useState(() =>
    JSON.parse(localStorage.getItem(storageKey) || "[]")
  );

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  function add(item) {
    setItems((items) => [...items, item]);
  }

  function remove(index) {
    setItems((items) => items.filter((item, i) => i !== index));
  }

  return { items, add, remove };
};
