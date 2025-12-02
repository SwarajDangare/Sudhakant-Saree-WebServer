'use client';

import Link from 'next/link';
import Image from 'next/image';

interface StockItem {
  productId: string;
  productName: string;
  colorName: string;
  colorCode: string;
  stock: number;
  imageUrl: string | null;
}

interface StockLevelWidgetProps {
  lowStockItems: StockItem[];
}

export default function StockLevelWidget({ lowStockItems }: StockLevelWidgetProps) {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', className: 'badge-danger' };
    if (stock <= 5) return { label: 'Critical', className: 'badge-warning' };
    return { label: 'Low', className: 'badge-info' };
  };

  return (
    <div className="soft-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Stock Levels</h3>
          <p className="text-xs text-gray-500 mt-0.5">Color variants running low</p>
        </div>
        <Link
          href="/admin/products"
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {lowStockItems.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <div className="text-2xl mb-1">✓</div>
            <p className="text-xs">All products are well stocked</p>
          </div>
        ) : (
          lowStockItems.map((item, index) => {
            const status = getStockStatus(item.stock);
            return (
              <div
                key={`${item.productId}-${item.colorName}-${index}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Product Image */}
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      📦
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {item.productName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: item.colorCode }}
                    />
                    <span className="text-[10px] text-gray-500">{item.colorName}</span>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">{item.stock}</p>
                  <span className={`soft-pill ${status.className} text-[10px]`}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
