// /pages/components/Modal.js
// v1 - 21/05/2025
// Componente modale base generica per popup (riusabile ovunque)
// Autore: ChatGPT + Giancarlo
// Minimal design, pronto per custom Schüco

import React from "react";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[350px] max-w-[90vw] relative">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
}
