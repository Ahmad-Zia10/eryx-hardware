'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import ProductEditModal from './ProductEditModal';
import AddProductModal from './AddProductModal';

export default function ProductsTable({ products }: { products: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.item_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name or code..."
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm pl-10 pr-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-4 py-2.5 text-sm transition duration-200 ease-in-out rounded-sm"
        >
          Add Product
        </button>
      </div>

      <div className="w-full border border-[#2A2A2A] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#2A2A2A]">
            <thead className="bg-[#1A1A1A] border-b border-[#2A2A2A]">
              <tr>
                <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Product</th>
                <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Code</th>
                <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Price</th>
                <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Status</th>
                <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Tags</th>
              </tr>
            </thead>
            <tbody className="bg-[#0A0A0A] divide-y divide-[#2A2A2A]">
              {filteredProducts.map((product) => (
                <tr 
                  key={product.id} 
                  className="hover:bg-[#1A1A1A] transition duration-150 ease-in-out cursor-pointer"
                  onClick={() => { setSelectedProduct(product); setIsEditModalOpen(true); }}
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-[#F5F5F5]">{product.name}</div>
                    <div className="text-xs text-[#9A9A9A] mt-0.5">{product.category}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[#9A9A9A]">
                    {product.item_code}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {product.mrp ? (
                      <div className="text-sm text-[#F5F5F5]">
                        ₹{product.mrp.toLocaleString('en-IN')}
                        {product.is_on_sale && (
                          <span className="ml-2 text-xs text-[#D4A017] font-medium">
                            (Sale: ₹{product.discount_price?.toLocaleString('en-IN')})
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-[#555555]">POA</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${product.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {product.is_featured && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-sm bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/30">
                        Featured
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#9A9A9A]">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && selectedProduct && (
        <ProductEditModal 
          product={selectedProduct} 
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      {isAddModalOpen && (
        <AddProductModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
