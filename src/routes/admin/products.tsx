import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { products as initialProducts, Product } from "@/lib/products";
import { formatUSD } from "@/components/site/cart-context";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  AlertTriangle,
  CheckCircle,
  FileText,
  ShoppingBag,
  Package,
  UploadCloud,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadImage } from "@/lib/api/upload.functions";
import { saveProductDb, deleteProductDb } from "@/lib/api/products.functions";

export const Route = createFileRoute("/admin/products")({
  component: ProductsManager,
});

const CATEGORIES = [
  "Pool Pumps",
  "Pool Heaters",
  "Pool Lights",
  "Pool Filters",
  "Pool Cleaners",
  "Automation Systems",
  "Electric Heat Pumps"
];

function ProductsManager() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Notification State
  const [toast, setToast] = useState("");

  // Form Fields State
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Pool Pumps");
  const [price, setPrice] = useState(0);
  const [msrp, setMsrp] = useState(0);
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState(0);
  const [description, setDescription] = useState("");
  const [img, setImg] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("aquapro_db_products");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setProductsList(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse products database", e);
      }
    }
    setProductsList(initialProducts);
    localStorage.setItem("aquapro_db_products", JSON.stringify(initialProducts));
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return productsList.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [productsList, searchTerm, selectedCategory]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setBrand("");
    setCategory("Pool Pumps");
    setPrice(100);
    setMsrp(150);
    setSku("");
    setStock(10);
    setDescription("");
    setImg("");
    setFormOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBrand(p.brand);
    setCategory(p.category);
    setPrice(p.price);
    setMsrp(p.msrp || p.price + 50);
    setSku(p.sku);
    setStock(p.stock);
    setDescription(p.description);
    setImg(p.img || "");
    setFormOpen(true);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !sku.trim() || !description.trim()) {
      triggerToast("Please fill in all required fields.");
      return;
    }

    if (editingProduct) {
      // Edit mode
      const updatedProduct: Product = {
        ...editingProduct,
        name,
        brand,
        category,
        price: Number(price),
        msrp: Number(msrp),
        sku,
        stock: Number(stock),
        description,
        img
      };

      const updated = productsList.map(p => {
        if (p.id === editingProduct.id) {
          return updatedProduct;
        }
        return p;
      });
      setProductsList(updated);
      localStorage.setItem("aquapro_db_products", JSON.stringify(updated));
      triggerToast(`Product '${name}' updated successfully.`);

      try {
        await saveProductDb({ data: { product: updatedProduct } });
      } catch (err) {
        console.error("Failed to sync updated product to DB:", err);
      }
    } else {
      // Add mode
      const newId = `p-${brand.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
      const fallbackImg = productsList[0]?.img || ""; 
      const finalImg = img.trim() !== "" ? img : fallbackImg;
      
      const newProduct: Product = {
        id: newId,
        name,
        brand,
        category,
        price: Number(price),
        msrp: Number(msrp),
        rating: 5.0,
        img: finalImg,
        sku,
        stock: Number(stock),
        description,
        specs: {
          "Warranty": "2 Years Limited Warranty",
          "Voltage": "230V"
        },
        reviews: []
      };
      
      const updated = [...productsList, newProduct];
      setProductsList(updated);
      localStorage.setItem("aquapro_db_products", JSON.stringify(updated));
      triggerToast(`Product '${name}' added to catalog.`);

      try {
        await saveProductDb({ data: { product: newProduct } });
      } catch (err) {
        console.error("Failed to sync new product to DB:", err);
      }
    }

    setFormOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      triggerToast("Image must be smaller than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await uploadImage({
          data: {
            filename: file.name,
            base64: base64String
          }
        });

        if (res.success && res.url) {
          setImg(res.url);
          triggerToast("Image uploaded successfully!");
        } else {
          triggerToast(res.error || "Failed to upload image.");
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      triggerToast("Error reading file.");
      setIsUploading(false);
    }
  };

  const deleteProduct = async () => {
    if (!deleteId) return;
    const item = productsList.find(p => p.id === deleteId);
    const updated = productsList.filter(p => p.id !== deleteId);
    setProductsList(updated);
    localStorage.setItem("aquapro_db_products", JSON.stringify(updated));
    triggerToast(`Product '${item?.name}' removed from catalog.`);
    setDeleteId(null);

    try {
      await deleteProductDb({ data: { id: deleteId } });
    } catch (err) {
      console.error("Failed to delete product from DB:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg text-xs font-bold"
          >
            <CheckCircle className="size-4.5 text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-slate-500 text-sm mt-1">Manage wholesale products, inventories, and pricing metrics.</p>
        </div>
        <button
          onClick={openAddModal}
          className="py-3 px-6 rounded-full bg-gradient-ocean text-white font-bold text-sm shadow-md flex items-center gap-2 active:scale-97 transition-all"
        >
          <Plus className="size-5" /> Add New Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid sm:grid-cols-[1fr_200px] gap-4 bg-white border border-slate-200/60 p-4 rounded-[2rem] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SKU, brand, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 h-11 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-11 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold focus:outline-none focus:border-primary focus:bg-white cursor-pointer"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 uppercase tracking-wider">
                <th className="p-4 font-bold">Image</th>
                <th className="p-4 font-bold">Product Name</th>
                <th className="p-4 font-bold">SKU</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold text-right">Wholesale / MSRP</th>
                <th className="p-4 font-bold text-center">Stock</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const isLow = p.stock < 10;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="size-12 rounded-xl bg-slate-100/80 border border-slate-200/50 flex items-center justify-center overflow-hidden">
                          {p.img ? (
                            <img src={p.img} alt={p.name} className="size-full object-contain p-1 mix-blend-multiply" />
                          ) : (
                            <Package className="size-5 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 max-w-[280px]">
                        <div className="font-bold text-slate-900 truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.brand}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-800 font-mono">{p.sku}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-bold text-slate-900">{formatUSD(p.price)}</div>
                        <div className="text-[10px] text-slate-400 line-through">MSRP {formatUSD(p.msrp || p.price + 50)}</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isLow && <AlertTriangle className="size-3.5 text-rose-500 animate-pulse" />}
                          <span className={isLow ? "text-rose-600 font-bold" : "text-slate-800"}>
                            {p.stock} units
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="size-8 rounded-lg hover:bg-slate-100 text-blue-600 grid place-items-center transition"
                            title="Edit Product"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="size-8 rounded-lg hover:bg-slate-100 text-rose-600 grid place-items-center transition"
                            title="Delete Product"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-semibold">
                    No products matching search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setFormOpen(false)}
              className="fixed inset-0 z-[60] bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-xl bg-white rounded-[2rem] border border-slate-200/60 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <h3 className="font-extrabold text-lg text-slate-900">
                  {editingProduct ? `Edit Product: ${editingProduct.brand}` : "Add New Product"}
                </h3>
                <button
                  onClick={() => setFormOpen(false)}
                  className="size-8 rounded-full bg-slate-100 grid place-items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="size-4.5" />
                </button>
              </div>

              <form onSubmit={saveProduct} className="space-y-4 text-left">
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Brand</span>
                    <input
                      type="text" required value={brand} onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Pentair"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-primary transition"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">SKU</span>
                    <input
                      type="text" required value={sku} onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. PEN-VS-101"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:outline-none focus:border-primary transition uppercase"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product Name</span>
                  <input
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. SuperMax VS Variable Speed Pump"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-primary transition"
                  />
                </label>

                <div className="block">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product Image</span>
                  
                  <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/50 bg-slate-50 transition-colors group">
                    <input
                      type="file" 
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                    />
                    
                    <div className="p-4 flex items-center justify-center gap-4">
                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center text-slate-400 py-2">
                          <Loader2 className="size-6 animate-spin mb-2 text-primary" />
                          <span className="text-xs font-semibold">Uploading securely...</span>
                        </div>
                      ) : img ? (
                        <div className="flex items-center gap-4 w-full">
                          <div className="size-16 rounded-lg bg-white border border-slate-200 p-1 shrink-0 shadow-sm">
                            <img src={img} alt="Preview" className="size-full object-contain mix-blend-multiply" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                              <CheckCircle className="size-3.5" /> Image uploaded
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5" title={img}>{img}</div>
                            <div className="text-[10px] text-primary font-bold mt-1 group-hover:underline cursor-pointer relative z-20 pointer-events-none">
                              Click to replace image
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 py-3">
                          <UploadCloud className="size-6 mb-2 group-hover:text-primary transition-colors" />
                          <span className="text-xs font-semibold text-slate-500">Drag & drop or click to upload</span>
                          <span className="text-[10px]">PNG, JPG, or WEBP up to 5MB</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</span>
                    <select
                      value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:outline-none focus:border-primary transition cursor-pointer"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Stock Count</span>
                    <input
                      type="number" required min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-primary transition"
                    />
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Wholesale Price ($)</span>
                    <input
                      type="number" required min={1} value={price} onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-primary transition"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">MSRP Compare Price ($)</span>
                    <input
                      type="number" required min={1} value={msrp} onChange={(e) => setMsrp(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-primary transition"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</span>
                  <textarea
                    required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter full product details and key highlights..."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-primary transition resize-none"
                  />
                </label>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button" onClick={() => setFormOpen(false)}
                    className="px-5 py-2.5 rounded-full hover:bg-slate-100 font-semibold text-xs text-slate-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-6 py-2.5 rounded-full bg-gradient-ocean text-white font-semibold text-xs hover:opacity-95 transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingProduct ? "Save Changes" : "Create Product"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="fixed inset-0 z-[60] bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-sm bg-white rounded-[2rem] border border-slate-200/60 p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
            >
              <AlertTriangle className="size-12 text-rose-500 mx-auto animate-bounce mb-3" />
              <h3 className="font-extrabold text-base text-slate-900">Delete Product</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Are you sure you want to delete this product? This will remove the item from active consumer catalog grids. This action cannot be undone.
              </p>
              
              <div className="flex gap-3 mt-6 justify-center">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-5 py-2.5 rounded-full hover:bg-slate-100 font-semibold text-xs text-slate-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteProduct}
                  className="px-5 py-2.5 rounded-full bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition"
                >
                  Delete Item
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
