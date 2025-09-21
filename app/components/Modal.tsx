"use client";
import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md max-w-lg w-full">
        <button onClick={onClose} className="float-right">Close</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
