import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  AlertTriangle,
  Search,
  Filter,
} from "lucide-react";
import { Product, ProductVariant } from "../types/groupbuy";
import { ImageUploadZone } from "./ImageUploadZone";

interface ProductManagerProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  onUpdateProducts,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for add/edit product
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("甜點／伴手禮");
  const [description, setDescription] = useState("");
  const [sellingPointsText, setSellingPointsText] = useState("");
  const [specsText, setSpecsText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [originalPrice, setOriginalPrice] = useState(500);
  const [groupPrice, setGroupPrice] = useState(399);
  const [tag, setTag] = useState("熱銷推薦");

  // Variants in modal
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: "var-new-1",
      name: "單件嚐鮮組",
      sku: "SKU-001",
      originalPrice: 500,
      groupPrice: 399,
      stock: 50,
      soldCount: 0,
    },
    {
      id: "var-new-2",
      name: "雙件免運特惠組",
      sku: "SKU-002",
      originalPrice: 1000,
      groupPrice: 750,
      stock: 30,
      soldCount: 0,
    },
  ]);

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setBrand("日光選物");
    setCategory("甜點／伴手禮");
    setDescription("");
    setSellingPointsText("新鮮手作\n減糖低卡\n無防腐劑添加");
    setSpecsText("冷藏保存 7 天\n單盒 6 入裝");
    setImageUrl("https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80");
    setOriginalPrice(600);
    setGroupPrice(480);
    setTag("團長新品");
    setVariants([
      {
        id: `var-${Date.now()}-1`,
        name: "單入標準規格",
        sku: "PROD-01",
        originalPrice: 600,
        groupPrice: 480,
        stock: 50,
        soldCount: 0,
      },
      {
        id: `var-${Date.now()}-2`,
        name: "3 入超值免運組",
        sku: "PROD-03",
        originalPrice: 1800,
        groupPrice: 1350,
        stock: 20,
        soldCount: 0,
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setBrand(prod.brand);
    setCategory(prod.category);
    setDescription(prod.description);
    setSellingPointsText(prod.sellingPoints.join("\n"));
    setSpecsText(prod.specs.join("\n"));
    setImageUrl(prod.imageUrl);
    setOriginalPrice(prod.originalPrice);
    setGroupPrice(prod.groupPrice);
    setTag(prod.tag || "");
    setVariants([...prod.variants]);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name,
              brand,
              category,
              description,
              sellingPoints: sellingPointsText.split("\n").filter(Boolean),
              specs: specsText.split("\n").filter(Boolean),
              imageUrl: imageUrl || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
              originalPrice,
              groupPrice,
              tag,
              variants,
            }
          : p
      );
      onUpdateProducts(updated);
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name,
        brand,
        category,
        description,
        sellingPoints: sellingPointsText.split("\n").filter(Boolean),
        specs: specsText.split("\n").filter(Boolean),
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
        originalPrice,
        groupPrice,
        status: "active",
        tag,
        createdAt: new Date().toISOString(),
        variants,
      };
      onUpdateProducts([newProduct, ...products]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("確定要刪除此商品嗎？")) {
      onUpdateProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleQuickRestock = (prodId: string, varId: string, amount: number) => {
    const updated = products.map((p) => {
      if (p.id === prodId) {
        return {
          ...p,
          variants: p.variants.map((v) => (v.id === varId ? { ...v, stock: v.stock + amount } : v)),
        };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        id: `var-${Date.now()}`,
        name: `新規格方案 ${variants.length + 1}`,
        sku: `SKU-${Date.now().toString().slice(-4)}`,
        originalPrice: groupPrice,
        groupPrice: groupPrice,
        stock: 20,
        soldCount: 0,
      },
    ]);
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-6 bg-blue-600 rounded-full" />
            <h2 className="text-xl font-bold text-slate-900">商品庫與多規格 (SKU) 管理</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            解決繁雜商品種類管理難題：多階梯規格、即時庫存預警與快速調價上架。
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          新增團購商品
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="搜尋商品名稱或品牌..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-700"
          >
            <option value="all">所有商品分類</option>
            {categories
              .filter((c) => c !== "all")
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Product List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProducts.map((product) => {
          const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
          const totalSold = product.variants.reduce((acc, v) => acc + v.soldCount, 0);
          const isLowStock = product.variants.some((v) => v.stock <= 10);

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div>
                {/* Header: Tag & Actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                      {product.category}
                    </span>
                    {product.tag && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center">
                        <Tag className="w-3 h-3 mr-1 text-amber-600" />
                        {product.tag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                      title="編輯商品"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                      title="刪除商品"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Product Info & Image */}
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400">{product.brand}</div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="mt-1 flex items-baseline space-x-2">
                      <span className="text-base sm:text-lg font-black text-rose-600">
                        NT$ {product.groupPrice}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        NT$ {product.originalPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selling Points Preview */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                  {product.sellingPoints.slice(0, 2).map((sp, idx) => (
                    <div key={idx} className="flex items-center truncate">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 shrink-0" />
                      <span className="truncate">{sp}</span>
                    </div>
                  ))}
                </div>

                {/* Variants & Stock Table */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>規格方案 ({product.variants.length} 種，庫存: {totalStock} 件)</span>
                    <span className="text-slate-500 text-[11px]">
                      累計已售: <strong className="text-slate-800">{totalSold}</strong> 件
                    </span>
                  </div>

                  {product.variants.map((v) => (
                    <div
                      key={v.id}
                      className="p-2 rounded-lg bg-slate-50/80 border border-slate-200/60 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-slate-800 truncate block">
                          {v.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {v.sku} ‧ 團購價 ${v.groupPrice}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                            v.stock <= 10
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          剩餘: {v.stock}
                        </span>
                        <button
                          onClick={() => handleQuickRestock(product.id, v.id, 20)}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-[10px] font-semibold"
                          title="一鍵補貨 20 件"
                        >
                          +20 補貨
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Alert Footer */}
              {isLowStock && (
                <div className="pt-2 border-t border-slate-100 flex items-center text-xs text-amber-700 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  部分規格庫存告急，建議點擊補貨或啟動催單話術！
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Add or Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              {editingProduct ? "編輯團購商品" : "新增團購商品"}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pm-prod-name" className="block font-semibold text-slate-700 mb-1">商品名稱 *</label>
                  <input
                    id="pm-prod-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="pm-prod-brand" className="block font-semibold text-slate-700 mb-1">品牌名稱</label>
                  <input
                    id="pm-prod-brand"
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="pm-prod-cat" className="block font-semibold text-slate-700 mb-1">商品分類</label>
                  <input
                    id="pm-prod-cat"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="pm-prod-orig-price" className="block font-semibold text-slate-700 mb-1">原價 (NT$)</label>
                  <input
                    id="pm-prod-orig-price"
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="pm-prod-group-price" className="block font-semibold text-rose-600 mb-1">團購價 (NT$)</label>
                  <input
                    id="pm-prod-group-price"
                    type="number"
                    value={groupPrice}
                    onChange={(e) => setGroupPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-rose-300 bg-rose-50/30 rounded-xl font-bold text-rose-900 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pm-prod-desc" className="block font-semibold text-slate-700 mb-1">商品詳細介紹</label>
                <textarea
                  id="pm-prod-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <ImageUploadZone
                  value={imageUrl}
                  onChange={setImageUrl}
                  label="商品照片 (支援電腦/手機相簿上傳或圖片網址)"
                  helperText="支援拖曳、點擊挑選或貼上圖片連結，即時預覽"
                  aspectRatio="video"
                />
              </div>

              {/* Variants Editor in Modal */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">多規格方案配置 (SKU)</span>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    + 新增一組規格
                  </button>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {variants.map((v, idx) => (
                    <div
                      key={v.id}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center text-xs"
                    >
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="規格名稱 (例如: 2盒分享組)"
                          value={v.name}
                          onChange={(e) => {
                            const newVars = [...variants];
                            newVars[idx].name = e.target.value;
                            setVariants(newVars);
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded-md"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="團購價"
                          value={v.groupPrice}
                          onChange={(e) => {
                            const newVars = [...variants];
                            newVars[idx].groupPrice = Number(e.target.value);
                            setVariants(newVars);
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded-md font-bold text-rose-600"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="庫存量"
                          value={v.stock}
                          onChange={(e) => {
                            const newVars = [...variants];
                            newVars[idx].stock = Number(e.target.value);
                            setVariants(newVars);
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded-md"
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(v.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                >
                  確認儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
