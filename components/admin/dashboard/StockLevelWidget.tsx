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
    <div className="soft-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Stock Levels</h3>
          <p className="text-sm text-gray-500 mt-1">Color variants running low</p>
        </div>
        <Link
          href="/admin/products"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {lowStockItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">✓</div>
            <p className="text-sm">All products are well stocked</p>
          </div>
        ) : (
          lowStockItems.map((item, index) => {
            const status = getStockStatus(item.stock);
            return (
              <div
                key={`${item.productId}-${item.colorName}-${index}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {/* Product Image */}
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      📦
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.productName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: item.colorCode }}
                    />
                    <span className="text-xs text-gray-500">{item.colorName}</span>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{item.stock}</p>
                  <span className={`soft-pill ${status.className} text-xs`}>
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
