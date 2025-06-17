// Placeholder for PublishOrderForm.tsx
import React, { useState } from 'react';
import type { PublishOrderData, PublishFormat } from '../../services/api'; // To be updated in api.ts

interface PublishOrderFormProps {
  onSubmit: (formData: Omit<PublishOrderData, 'memoirId'>) => Promise<void>;
  isSubmitting: boolean;
  memoirTitle: string; // To display which memoir is being published
}

const PublishOrderForm: React.FC<PublishOrderFormProps> = ({ onSubmit, isSubmitting, memoirTitle }) => {
  const [format, setFormat] = useState<PublishFormat>('ebook');
  const [quantity, setQuantity] = useState<number>(1);
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value as PublishFormat;
    setFormat(newFormat);
    // Reset quantity and shipping for ebook as they might not be relevant
    if (newFormat === 'ebook') {
      setQuantity(1); // Typically 1 for ebook
      setShippingAddress('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (quantity < 1 && format !== 'ebook') {
      setFormError('实体书的数量必须至少为1本。');
      return;
    }
    if ((format === 'paperback' || format === 'hardcover') && !shippingAddress.trim()) {
      setFormError('实体书需要提供收货地址。');
      return;
    }

    const formData: Omit<PublishOrderData, 'memoirId'> = {
      format,
      quantity: format === 'ebook' ? 1 : quantity, // Ebook quantity is typically 1
      shippingAddress: (format === 'paperback' || format === 'hardcover') ? shippingAddress : undefined,
      notes: notes || undefined,
    };

    try {
      await onSubmit(formData);
      // Form reset can be handled by parent page on success if it unmounts/hides this form
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "订单提交失败，请重试。");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <p className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{formError}</p>}

      <p className="text-sm text-gray-600">您正在为回忆录创建出版订单: <strong>{memoirTitle}</strong></p>

      <div>
        <label htmlFor="publishFormat" className="block text-sm font-medium text-gray-700">
          出版格式
        </label>
        <select
          id="publishFormat"
          value={format}
          onChange={handleFormatChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        >
          <option value="ebook">电子书</option>
          <option value="paperback">平装本</option>
          <option value="hardcover">精装本</option>
        </select>
      </div>

      {(format === 'paperback' || format === 'hardcover') && (
        <>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              数量
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
              min="1"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700">
              收货地址
            </label>
            <textarea
              id="shippingAddress"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="请输入物理副本的完整收货地址"
              disabled={isSubmitting}
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          附加说明（可选）
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="订单的特殊要求或说明"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isSubmitting ? '提交订单中...' : '提交出版订单'}
        </button>
      </div>
    </form>
  );
};

export default PublishOrderForm;
