import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [newTag, setNewTag] = React.useState('');

  const handleSubmit = () => {
    if (newTag.trim()) {
      onConfirm(newTag.trim());
      setNewTag('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity/25 z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">เพิ่มประเภท</h2>
        <input
          type="text"
          placeholder="กรอกชื่อแท็ก"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded-md mb-4"
        />
        <div className="flex justify-between">
          <button onClick={onClose} className="text-gray-500">
            ยกเลิก
          </button>
          <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded-md">
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
