import { createFileRoute } from "@tanstack/react-router";
import commingSoonImg from "@/assets/commingsoon.png";
import { useEffect, useState, useMemo, useRef } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { products as initialProducts, Product, Review, syncLocalProducts, useProducts, invalidateProductsCache } from "@/lib/products";
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
  Loader2,
  FileSpreadsheet,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Percent,
  DollarSign,
  SlidersHorizontal,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadImage } from "@/lib/api/upload.functions";
import { saveProductDb, deleteProductDb, bulkDeleteProductsDb, bulkSaveProductsDb, getAllProductsAdminDb, deleteAllProductsDb } from "@/lib/api/products.functions";

export const Route = createFileRoute("/admin/products")({
  component: ProductsManager,
});

const CATEGORIES = [
  "Automation",
  "Blowers",
  "Chlorine Feeders",
  "Cleaners",
  "Filters",
  "Heaters",
  "Lights",
  "Pumps",
  "Salt Systems",
  "Skid Systems",
  "Bulk",
  "Motors",
  "Plumbing",
  "Pool Kits",
  "Algaecides",
  "Balancers",
  "Cal-Hypo",
  "Dichlor",
  "Deck Products",
  "Maintenance",
  "Plaster",
  "Ladders & Rails",
  "Pool Pumps",
  "Pool Heaters",
  "Pool Lights",
  "Pool Filters",
  "Pool Cleaners",
  "Automation Systems",
  "Electric Heat Pumps"
];

export function generateSampleCSV(): string {
  const headers = [
    "Category",
    "Sub Category",
    "Manufacturer",
    "Name",
    "Display Name",
    "SKU",
    "Price",
    "Qty Available",
    "Details",
    "Image Link",
    "SEO Keywords",
    "Product Description",
    "Specifications",
    "5-Star Review 1",
    "5-Star Review 2"
  ].join(",");

  const row1 = [
    '"Pool & Spa"',
    '"Pumps"',
    '"Pentair"',
    '"SuperFlo VS 1.5 HP Variable Speed Pump"',
    '"Pentair SuperFlo VS 1.5 HP Energy Efficient Pump"',
    '"011533"',
    '1249.99',
    '35',
    '"1.5 HP, 115V/230V, Variable Speed, Ultra Quiet"',
    `"${commingSoonImg}"`,
    '"pentair, pool pump, superflo, variable speed, energy star"',
    '"The Pentair SuperFlo VS Pump brings the energy savings of variable speed technology to standard pool applications at an affordable price."',
    '"Warranty: 2 Years Limited; Volts: 115V/230V; Horsepower: 1.5 HP; Port Size: 1.5 inch"',
    '"Extremely quiet operation and reduced our electric bill by nearly 65% in the first month!"',
    '"Commercial grade durability. Easy installation for pool technicians."'
  ].join(",");

  const row2 = [
    '"Pool & Spa"',
    '"Heaters"',
    '"Hayward"',
    '"Universal H-Series 400K BTU Natural Gas Heater"',
    '"Hayward Universal H-Series 400,000 BTU Gas Pool Heater"',
    '"H400FDN"',
    '2899.00',
    '18',
    '"400K BTU, Natural Gas, Cupro Nickel Heat Exchanger, Low NOx"',
    `"${commingSoonImg}"`,
    '"hayward, pool heater, h-series, 400k btu, natural gas"',
    '"Hayward Universal H-Series heaters represent the executive standard of high efficiency performance for in-ground pools and spas."',
    '"Warranty: 3 Years Limited; Fuel: Natural Gas; Heating Capacity: 400000 BTU; Heat Exchanger: Cupro Nickel"',
    '"Heats our 25,000 gallon pool in under 4 hours. Unmatched heating performance!"',
    '"Solid construction and straightforward digital LED interface."'
  ].join(",");

  return `${headers}\n${row1}\n${row2}`;
}

export function parseCSV(text: string): Product[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
  if (lines.length < 2) return [];

  // Parse header line handling quotes
  const parseRow = (rowStr: string): string[] => {
    const arr: string[] = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === '\t' || char === ';') && !inQuotes) {
        arr.push(field.trim().replace(/^["']|["']$/g, ""));
        field = "";
      } else {
        field += char;
      }
    }
    arr.push(field.trim().replace(/^["']|["']$/g, ""));
    return arr;
  };

  const headers = parseRow(lines[0]).map(h => h.toLowerCase().trim());

  const findIdx = (keywords: string[]) => {
    return headers.findIndex(h => keywords.some(k => h.includes(k)));
  };

  const catIdx = findIdx(["category", "cat", "parent category"]);
  const subCatIdx = findIdx(["sub category", "subcategory", "sub-category"]);
  const mfrIdx = findIdx(["manufacturer", "brand", "make", "mfr"]);
  const nameIdx = headers.findIndex(h => h === "name" || h === "product name") !== -1
    ? headers.findIndex(h => h === "name" || h === "product name")
    : findIdx(["name", "title"]);
  const dispNameIdx = findIdx(["display name", "displayname", "public name"]);
  const skuIdx = findIdx(["sku", "code", "part number"]);
  const priceIdx = findIdx(["price", "wholesale", "cost"]);
  const qtyIdx = findIdx(["qty available", "qty", "quantity", "stock"]);
  const detailsIdx = findIdx(["details", "highlights", "short description"]);
  const imgIdx = findIdx(["image link", "image url", "image", "img", "photo"]);
  const seoIdx = findIdx(["seo keywords", "keywords", "tags", "seo"]);
  const descIdx = findIdx(["product description", "description", "desc", "full description"]);
  const specsIdx = findIdx(["specifications", "specs", "technical specs"]);
  const r1Idx = findIdx(["5-star review 1", "review 1", "review1"]);
  const r2Idx = findIdx(["5-star review 2", "review 2", "review2"]);

  const parsed: Product[] = [];
  const timestamp = Date.now();

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length === 0 || !row.some(c => c.length > 0)) continue;

    const rowName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : "";
    const rowDispName = dispNameIdx !== -1 && row[dispNameIdx] ? row[dispNameIdx] : "";
    const pName = rowDispName || rowName || `Product ${i}`;
    if (!pName || pName.toLowerCase() === "name" || pName.toLowerCase() === "display name") continue;

    const pCat = catIdx !== -1 && row[catIdx] ? row[catIdx] : "Pool & Spa";
    const pSubCat = subCatIdx !== -1 && row[subCatIdx] ? row[subCatIdx] : "Pool Pumps";
    const pBrand = mfrIdx !== -1 && row[mfrIdx] ? row[mfrIdx] : "Pentair";
    const pSku = skuIdx !== -1 && row[skuIdx] ? row[skuIdx] : `SKU-${timestamp}-${i}`;
    const pPrice = priceIdx !== -1 ? Math.max(0.01, parseFloat(row[priceIdx].replace(/[^0-9.]/g, "")) || 199.99) : 199.99;
    const pStock = qtyIdx !== -1 ? Math.max(0, parseInt(row[qtyIdx].replace(/[^0-9]/g, ""), 10) || 20) : 20;
    const pDetails = detailsIdx !== -1 && row[detailsIdx] ? row[detailsIdx] : "";
    const pImg = imgIdx !== -1 && row[imgIdx] ? row[imgIdx] : "";
    const pSeo = seoIdx !== -1 && row[seoIdx] ? row[seoIdx] : "";
    const pDesc = descIdx !== -1 && row[descIdx] ? row[descIdx] : `${pName} manufactured by ${pBrand}. Commercial pool grade equipment.`;
    const pSpecsRaw = specsIdx !== -1 && row[specsIdx] ? row[specsIdx] : "";
    const r1Raw = r1Idx !== -1 && row[r1Idx] ? row[r1Idx] : "";
    const r2Raw = r2Idx !== -1 && row[r2Idx] ? row[r2Idx] : "";

    // Parse specifications string into object
    const specsMap: Record<string, string> = { Warranty: "2 Years Limited Warranty" };
    if (pSpecsRaw) {
      const parts = pSpecsRaw.split(/;|\||\n/);
      parts.forEach(part => {
        const colon = part.indexOf(":");
        if (colon !== -1) {
          const k = part.substring(0, colon).trim();
          const v = part.substring(colon + 1).trim();
          if (k && v) specsMap[k] = v;
        } else if (part.trim()) {
          specsMap[`Spec ${Object.keys(specsMap).length + 1}`] = part.trim();
        }
      });
    }

    // Parse 5-Star Reviews
    const reviewsArr: Review[] = [];
    if (r1Raw) {
      reviewsArr.push({
        id: `rev-${i}-1`,
        author: "Verified Commercial Buyer",
        rating: 5,
        date: "Recently Verified",
        title: "Top Quality Equipment",
        content: r1Raw
      });
    }
    if (r2Raw) {
      reviewsArr.push({
        id: `rev-${i}-2`,
        author: "Verified Trade Pro",
        rating: 5,
        date: "Recently Verified",
        title: "Highly Recommended",
        content: r2Raw
      });
    }

    parsed.push({
      id: `p-${pSku.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${timestamp}-${i}`,
      name: pName,
      displayName: rowDispName || pName,
      brand: pBrand,
      category: pSubCat || pCat,
      parentCategory: pCat,
      subCategory: pSubCat,
      price: pPrice,
      msrp: pPrice,
      rating: 5.0,
      img: pImg || commingSoonImg,
      sku: pSku,
      stock: pStock,
      details: pDetails,
      description: pDesc,
      seoKeywords: pSeo,
      specs: specsMap,
      reviews: reviewsArr
    });
  }

  return parsed;
}

export function parseJSONRows(rows: any[]): Product[] {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const parsed: Product[] = [];
  const timestamp = Date.now();

  rows.forEach((row, i) => {
    if (!row || typeof row !== "object") return;
    const values = Object.values(row).map(v => String(v ?? "").trim());
    if (values.every(v => v === "")) return;

    const getVal = (keywords: string[]) => {
      for (const k of Object.keys(row)) {
        const cleanK = k.toLowerCase().trim();
        if (keywords.some(key => cleanK.includes(key))) {
          return String(row[k] ?? "").trim();
        }
      }
      return "";
    };

    const rowName = getVal(["display name", "displayname", "name", "title", "product name", "product"]);
    const rowDispName = getVal(["display name", "displayname", "public name"]);
    const pName = rowDispName || rowName;

    if (!pName || pName.toLowerCase() === "name" || pName.toLowerCase() === "display name") return;

    const pCat = getVal(["category", "cat", "parent category"]) || "Pool & Spa";
    const pSubCat = getVal(["sub category", "subcategory", "sub-category"]) || "Pool Pumps";
    const pBrand = getVal(["manufacturer", "brand", "make", "mfr"]) || "Pentair";
    const pSku = getVal(["sku", "code", "part number"]) || `SKU-${timestamp}-${i + 1}`;
    
    const priceRaw = getVal(["price", "wholesale", "cost"]);
    const pPrice = priceRaw ? Math.max(0.01, parseFloat(priceRaw.replace(/[^0-9.]/g, "")) || 199.99) : 199.99;

    const stockRaw = getVal(["qty available", "qty", "quantity", "stock"]);
    const pStock = stockRaw ? Math.max(0, parseInt(stockRaw.replace(/[^0-9]/g, ""), 10) || 20) : 20;

    const pDetails = getVal(["details", "highlights", "short description"]);
    const pImg = getVal(["image link", "image url", "image", "img", "photo"]);
    const pSeo = getVal(["seo keywords", "keywords", "tags", "seo"]);
    const pDesc = getVal(["product description", "description", "desc", "full description"]) || `${pName} by ${pBrand}. Commercial pool grade equipment.`;
    const pSpecsRaw = getVal(["specifications", "specs", "technical specs"]);
    const r1Raw = getVal(["5-star review 1", "review 1", "review1"]);
    const r2Raw = getVal(["5-star review 2", "review 2", "review2"]);

    // Specifications Map
    const specsMap: Record<string, string> = { Warranty: "2 Years Limited Warranty" };
    if (pSpecsRaw) {
      const parts = pSpecsRaw.split(/;|\||\n/);
      parts.forEach(part => {
        const colon = part.indexOf(":");
        if (colon !== -1) {
          const k = part.substring(0, colon).trim();
          const v = part.substring(colon + 1).trim();
          if (k && v) specsMap[k] = v;
        } else if (part.trim()) {
          specsMap[`Spec ${Object.keys(specsMap).length + 1}`] = part.trim();
        }
      });
    }

    // Reviews
    const reviewsArr: Review[] = [];
    if (r1Raw) {
      reviewsArr.push({
        id: `rev-${i}-1`,
        author: "Verified Commercial Buyer",
        rating: 5,
        date: "Recently Verified",
        title: "Top Quality Equipment",
        content: r1Raw
      });
    }
    if (r2Raw) {
      reviewsArr.push({
        id: `rev-${i}-2`,
        author: "Verified Trade Pro",
        rating: 5,
        date: "Recently Verified",
        title: "Highly Recommended",
        content: r2Raw
      });
    }

    parsed.push({
      id: `p-${pSku.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${timestamp}-${i + 1}`,
      name: pName,
      displayName: rowDispName || pName,
      brand: pBrand,
      category: pSubCat || pCat,
      parentCategory: pCat,
      subCategory: pSubCat,
      price: pPrice,
      msrp: pPrice,
      rating: 5.0,
      img: pImg || commingSoonImg,
      sku: pSku,
      stock: pStock,
      details: pDetails,
      description: pDesc,
      seoKeywords: pSeo,
      specs: specsMap,
      reviews: reviewsArr
    });
  });

  return parsed;
}

export async function parseExcelOrCSV(file: File): Promise<Product[]> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".json")) {
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      const list = Array.isArray(json) ? json : json.products || [];
      return list;
    } catch {
      return [];
    }
  }

  if (name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".txt")) {
    const text = await file.text();
    return parseCSV(text);
  }

  // Load SheetJS dynamically in browser for .xlsx and .xls files
  let XLSX = (typeof window !== "undefined" ? (window as any).XLSX : null);
  if (!XLSX && typeof document !== "undefined") {
    try {
      XLSX = await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
        script.onload = () => resolve((window as any).XLSX);
        script.onerror = () => reject(new Error("Failed to load Excel library"));
        document.head.appendChild(script);
      });
    } catch (err) {
      console.error("CDN XLSX load failed, falling back to text parse", err);
    }
  }

  if (XLSX) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    const worksheet = workbook.Sheets[sheetName];
    
    // Parse directly from SheetJS JSON rows
    const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    if (Array.isArray(jsonRows) && jsonRows.length > 0) {
      return parseJSONRows(jsonRows);
    }

    const csvText = XLSX.utils.sheet_to_csv(worksheet);
    return parseCSV(csvText);
  }

  // Fallback text parsing
  const text = await file.text();
  return parseCSV(text);
}

function ProductsManager() {
  const queryClient = useQueryClient();
  const { products: defaultProductsList } = useProducts();

  // Query ALL products from database for admin dashboard
  const { data: dbAdminProducts } = useQuery({
    queryKey: ["admin_all_products"],
    queryFn: async () => {
      try {
        const res = await getAllProductsAdminDb();
        if (res.success && Array.isArray(res.products)) {
          return res.products;
        }
      } catch (e) {
        console.error("Failed to query admin products:", e);
      }
      return defaultProductsList;
    },
    staleTime: 0,
  });

  const productsList = dbAdminProducts || defaultProductsList;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Table Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Selection & Bulk Delete State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<{ current: number; total: number } | null>(null);

  // Bulk Price Adjuster State
  const [priceAdjustModalOpen, setPriceAdjustModalOpen] = useState(false);
  const [adjustScope, setAdjustScope] = useState<"all" | "category" | "selected">("all");
  const [adjustCategory, setAdjustCategory] = useState(CATEGORIES[0] || "Pool Pumps");
  const [adjustMode, setAdjustMode] = useState<"percent_increase" | "percent_decrease" | "fixed_increase" | "fixed_decrease">("percent_increase");
  const [adjustValue, setAdjustValue] = useState<number>(10);
  const [adjustMsrp, setAdjustMsrp] = useState(true);
  const [isAdjustingPrices, setIsAdjustingPrices] = useState(false);

  // Affected products for bulk price adjust
  const affectedProducts = useMemo(() => {
    if (adjustScope === "selected") {
      const selectedSet = new Set(selectedIds);
      return productsList.filter(p => selectedSet.has(p.id));
    }
    if (adjustScope === "category") {
      return productsList.filter(p => p.category.toLowerCase() === adjustCategory.toLowerCase());
    }
    return productsList;
  }, [productsList, adjustScope, adjustCategory, selectedIds]);

  // Preview updated price for a single product (exact math)
  const calculateAdjustedPrices = (p: Product) => {
    const currentPrice = Number(p.price) || 0;
    const currentMsrp = Number(p.msrp || p.price) || currentPrice;
    const val = Math.max(0, Number(adjustValue) || 0);

    let newPrice = currentPrice;
    let newMsrp = currentMsrp;

    if (adjustMode === "percent_increase") {
      newPrice = currentPrice * (1 + val / 100);
      newMsrp = currentMsrp * (1 + val / 100);
    } else if (adjustMode === "percent_decrease") {
      newPrice = Math.max(0.01, currentPrice * (1 - val / 100));
      newMsrp = Math.max(0.01, currentMsrp * (1 - val / 100));
    } else if (adjustMode === "fixed_increase") {
      newPrice = currentPrice + val;
      newMsrp = currentMsrp + val;
    } else if (adjustMode === "fixed_decrease") {
      newPrice = Math.max(0.01, currentPrice - val);
      newMsrp = Math.max(0.01, currentMsrp - val);
    }

    // Exact math rounded to 2 decimal places ($100 + 10% = $110, $100 - 10% = $90)
    newPrice = Math.round(newPrice * 100) / 100;
    newMsrp = Math.round(newMsrp * 100) / 100;

    return {
      price: newPrice,
      msrp: adjustMsrp ? newMsrp : currentMsrp
    };
  };

  const handleApplyPriceAdjustment = async () => {
    if (affectedProducts.length === 0) return;
    setIsAdjustingPrices(true);

    const affectedSet = new Set(affectedProducts.map(p => p.id));
    const updatedList = productsList.map(p => {
      if (!affectedSet.has(p.id)) return p;
      const { price: newPrice, msrp: newMsrp } = calculateAdjustedPrices(p);
      return {
        ...p,
        price: newPrice,
        msrp: newMsrp
      };
    });

    const modifiedItems = updatedList.filter(p => affectedSet.has(p.id));

    syncLocalProducts(updatedList);
    queryClient.setQueryData(["admin_all_products"], updatedList);
    queryClient.setQueryData(["products"], updatedList);

    try {
      await bulkSaveProductsDb({ data: { products: modifiedItems } });
      invalidateProductsCache(queryClient);
      queryClient.invalidateQueries({ queryKey: ["admin_all_products"] });
      queryClient.invalidateQueries({ queryKey: ["all_products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });

      const desc = adjustMode === "percent_increase" ? `+${adjustValue}%` :
                   adjustMode === "percent_decrease" ? `-${adjustValue}%` :
                   adjustMode === "fixed_increase" ? `+$${adjustValue}` : `-$${adjustValue}`;

      triggerToast(`🎉 Price adjustment (${desc}) applied to ${modifiedItems.length} products!`);
      setPriceAdjustModalOpen(false);
    } catch (err) {
      console.error("Failed to apply bulk price adjustment:", err);
      triggerToast("Error saving price adjustments to database.");
    } finally {
      setIsAdjustingPrices(false);
    }
  };

  // Bulk Import CSV/Excel State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single Add / Edit Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Notification State
  const [toast, setToast] = useState("");

  // Form Fields State for all 15 Schema Attributes
  const [parentCategory, setParentCategory] = useState("Pool & Spa");
  const [subCategory, setSubCategory] = useState("Pool Pumps");
  const [brand, setBrand] = useState("Pentair");
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState(299.99);
  const [stock, setStock] = useState(25);
  const [details, setDetails] = useState("");
  const [img, setImg] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [review1, setReview1] = useState("");
  const [review2, setReview2] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };


  // Derive categories dynamically from loaded products (reflects actual DB values)
  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    productsList.forEach(p => {
      if (p.category) cats.add(p.category);
      if (p.parentCategory) cats.add(p.parentCategory);
      if (p.subCategory) cats.add(p.subCategory);
    });
    return Array.from(cats).sort();
  }, [productsList]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return productsList.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === "all" || [
        (p.category || "").toLowerCase(),
        (p.parentCategory || "").toLowerCase(),
        (p.subCategory || "").toLowerCase(),
      ].includes(selectedCategory.toLowerCase());
      return matchSearch && matchCat;
    });
  }, [productsList, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);

    const total = selectedIds.length;
    const idsToDelete = [...selectedIds];
    setDeleteProgress({ current: 0, total });

    const batchSize = 100;
    for (let i = 0; i < idsToDelete.length; i += batchSize) {
      const batch = idsToDelete.slice(i, i + batchSize);
      try {
        await bulkDeleteProductsDb({ data: { ids: batch } });
      } catch (err) {
        console.error("Failed batch delete:", err);
      }
      const current = Math.min(i + batchSize, total);
      setDeleteProgress({ current, total });
    }

    const deleteSet = new Set(idsToDelete);
    const updated = productsList.filter(p => !deleteSet.has(p.id));
    syncLocalProducts(updated);

    setSelectedIds([]);
    setShowBulkDeleteModal(false);
    setIsBulkDeleting(false);
    setDeleteProgress(null);
    triggerToast(`Successfully deleted ${total} product${total > 1 ? "s" : ""} from database.`);

    invalidateProductsCache(queryClient);
    queryClient.invalidateQueries({ queryKey: ["admin_all_products"] });
  };

  const deleteProduct = async () => {
    if (!deleteId) return;
    const item = productsList.find(p => p.id === deleteId);
    const updated = productsList.filter(p => p.id !== deleteId);
    syncLocalProducts(updated);
    queryClient.setQueryData(["admin_all_products"], updated);
    queryClient.setQueryData(["products"], updated);
    triggerToast(`Product '${item?.name}' removed from catalog.`);
    setDeleteId(null);

    try {
      await deleteProductDb({ data: { id: deleteId } });
      invalidateProductsCache(queryClient);
      queryClient.invalidateQueries({ queryKey: ["admin_all_products"] });
      queryClient.invalidateQueries({ queryKey: ["all_products"] });
    } catch (err) {
      console.error("Failed to delete product from DB:", err);
    }
  };

  const handleDeleteAllProducts = async () => {
    if (!confirm("Are you sure you want to PERMANENTLY remove ALL products from both the website and the database?")) return;
    setIsBulkDeleting(true);
    try {
      await deleteAllProductsDb();
      syncLocalProducts([]);
      setSelectedIds([]);
      queryClient.setQueryData(["admin_all_products"], []);
      queryClient.setQueryData(["products"], []);
      triggerToast("All products removed from website and database.");
      invalidateProductsCache(queryClient);
      queryClient.invalidateQueries({ queryKey: ["admin_all_products"] });
      queryClient.invalidateQueries({ queryKey: ["all_products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      console.error("Failed to delete all products:", err);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Native Excel (.xlsx) & CSV Template Downloader
  const downloadSampleExcel = async () => {
    let XLSX = (typeof window !== "undefined" ? (window as any).XLSX : null);
    if (!XLSX && typeof document !== "undefined") {
      try {
        XLSX = await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
          script.onload = () => resolve((window as any).XLSX);
          script.onerror = () => reject(new Error("Failed to load Excel library"));
          document.head.appendChild(script);
        });
      } catch (err) {
        console.error("Failed to load XLSX for template download", err);
      }
    }

    const sampleData = [
      {
        "Category": "Pool & Spa",
        "Sub Category": "Pumps",
        "Manufacturer": "Pentair",
        "Name": "SuperFlo VS 1.5 HP Variable Speed Pump",
        "Display Name": "Pentair SuperFlo VS 1.5 HP Energy Efficient Pump",
        "SKU": "011533",
        "Price": 1249.99,
        "Qty Available": 35,
        "Details": "1.5 HP, 115V/230V, Variable Speed, Ultra Quiet",
        "Image Link": commingSoonImg,
        "SEO Keywords": "pentair, pool pump, superflo, variable speed, energy star",
        "Product Description": "The Pentair SuperFlo VS Pump brings the energy savings of variable speed technology to standard pool applications at an affordable price.",
        "Specifications": "Warranty: 2 Years Limited; Volts: 115V/230V; Horsepower: 1.5 HP; Port Size: 1.5 inch",
        "5-Star Review 1": "Extremely quiet operation and reduced our electric bill by nearly 65% in the first month!",
        "5-Star Review 2": "Commercial grade durability. Easy installation for pool technicians."
      },
      {
        "Category": "Pool & Spa",
        "Sub Category": "Heaters",
        "Manufacturer": "Hayward",
        "Name": "Universal H-Series 400K BTU Natural Gas Heater",
        "Display Name": "Hayward Universal H-Series 400,000 BTU Gas Pool Heater",
        "SKU": "H400FDN",
        "Price": 2899.00,
        "Qty Available": 18,
        "Details": "400K BTU, Natural Gas, Cupro Nickel Heat Exchanger, Low NOx",
        "Image Link": commingSoonImg,
        "SEO Keywords": "hayward, pool heater, h-series, 400k btu, natural gas",
        "Product Description": "Hayward Universal H-Series heaters represent the executive standard of high efficiency performance for in-ground pools and spas.",
        "Specifications": "Warranty: 3 Years Limited; Fuel: Natural Gas; Heating Capacity: 400000 BTU; Heat Exchanger: Cupro Nickel",
        "5-Star Review 1": "Heats our 25,000 gallon pool in under 4 hours. Unmatched heating performance!",
        "5-Star Review 2": "Solid construction and straightforward digital LED interface."
      },
      {
        "Category": "Pool & Spa",
        "Sub Category": "Salt Systems",
        "Manufacturer": "Jandy",
        "Name": "TruClear Salt Chlorinator System 30k",
        "Display Name": "Jandy TruClear Compact Salt Water Chlorination Generator",
        "SKU": "TRU30K",
        "Price": 849.50,
        "Qty Available": 22,
        "Details": "30,000 Gallon Capacity, Transparent Cell Window, Self-Cleaning",
        "Image Link": commingSoonImg,
        "SEO Keywords": "jandy, salt system, truclear, chlorinator, saltwater pool",
        "Product Description": "Compact salt chlorination generator designed for easy installation and crystal clear pool water.",
        "Specifications": "Warranty: 2 Years Limited; Pool Size: Up to 30000 Gallons; Output: 0.93 lbs/day",
        "5-Star Review 1": "Water feels smooth as silk and no harsh chlorine odor. Fantastic unit!",
        "5-Star Review 2": "Easy to inspect cell window and very reliable control panel."
      }
    ];

    if (XLSX) {
      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products Template");
      XLSX.writeFile(workbook, "poolsby_product_import_template.xlsx");
      triggerToast("Downloaded native Excel (.xlsx) product import template!");
    } else {
      const csvContent = generateSampleCSV();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "poolsby_product_import_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast("Downloaded CSV product import template!");
    }
  };

  // Handle File Selection (XLSX, XLS, CSV, or JSON)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    try {
      const items = await parseExcelOrCSV(file);
      if (items.length === 0) {
        triggerToast("Could not parse products. Please check file headers or formatting.");
      } else {
        setParsedProducts(items);
        triggerToast(`🎉 Ready to import ${items.length} products from ${file.name}`);
      }
    } catch (err) {
      console.error("Error reading spreadsheet file:", err);
      triggerToast("Error reading file. Please ensure it is a valid CSV, XLSX, or XLS file.");
    }
  };

  // Execute Bulk Upload to MongoDB & Local Cache
  const executeBulkImport = async () => {
    if (parsedProducts.length === 0) return;
    setIsImporting(true);

    const total = parsedProducts.length;
    setImportProgress({ current: 0, total });

    const batchSize = 100;
    let hasError = false;

    for (let i = 0; i < total; i += batchSize) {
      const batch = parsedProducts.slice(i, i + batchSize);
      try {
        await bulkSaveProductsDb({ data: { products: batch } });
      } catch (err) {
        console.error("Bulk save error in batch:", err);
        hasError = true;
      }
      const current = Math.min(i + batchSize, total);
      setImportProgress({ current, total });
    }

    if (!hasError) {
      const combined = [...productsList, ...parsedProducts];
      syncLocalProducts(combined);
      queryClient.setQueryData(["admin_all_products"], combined);
      queryClient.setQueryData(["products"], combined);
      
      invalidateProductsCache(queryClient);
      queryClient.invalidateQueries({ queryKey: ["admin_all_products"] });
      queryClient.invalidateQueries({ queryKey: ["all_products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      
      triggerToast(`🎉 Successfully imported ${total} products to catalog & database!`);
      setImportModalOpen(false);
      setParsedProducts([]);
      setFileName("");
    } else {
      triggerToast("Error saving some products to database.");
    }

    setIsImporting(false);
    setImportProgress(null);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setParentCategory("Pool & Spa");
    setSubCategory("Pool Pumps");
    setBrand("Pentair");
    setName("");
    setDisplayName("");
    setSku("");
    setPrice(299.99);
    setStock(25);
    setDetails("");
    setImg("");
    setSeoKeywords("");
    setDescription("");
    setSpecifications("Warranty: 2 Years Limited; Volts: 115V/230V");
    setReview1("");
    setReview2("");
    setFormOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setParentCategory(p.parentCategory || "Pool & Spa");
    setSubCategory(p.subCategory || p.category || "Pool Pumps");
    setBrand(p.brand || "Pentair");
    setName(p.name || "");
    setDisplayName(p.displayName || p.name || "");
    setSku(p.sku || "");
    setPrice(p.price || 0);
    setStock(p.stock || 0);
    setDetails(p.details || "");
    setImg(p.img || "");
    setSeoKeywords(p.seoKeywords || "");
    setDescription(p.description || "");

    const specStr = p.specs
      ? Object.entries(p.specs)
          .map(([k, v]) => `${k}: ${v}`)
          .join("; ")
      : "";
    setSpecifications(specStr);

    setReview1(p.reviews && p.reviews[0] ? p.reviews[0].content : "");
    setReview2(p.reviews && p.reviews[1] ? p.reviews[1].content : "");

    setFormOpen(true);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !sku.trim()) {
      triggerToast("Please fill in required fields (Name, Brand/Manufacturer, SKU).");
      return;
    }

    // Parse specifications string into key-value map
    const specsMap: Record<string, string> = { Warranty: "2 Years Limited Warranty" };
    if (specifications.trim()) {
      const parts = specifications.split(/;|\||\n/);
      parts.forEach((part) => {
        const colon = part.indexOf(":");
        if (colon !== -1) {
          const k = part.substring(0, colon).trim();
          const v = part.substring(colon + 1).trim();
          if (k && v) specsMap[k] = v;
        } else if (part.trim()) {
          specsMap[`Spec ${Object.keys(specsMap).length + 1}`] = part.trim();
        }
      });
    }

    // Construct 5-star customer reviews
    const reviewsArr: Review[] = [];
    if (review1.trim()) {
      reviewsArr.push({
        id: `rev-${Date.now()}-1`,
        author: "Verified Commercial Buyer",
        rating: 5,
        date: "Recently Verified",
        title: "Top Quality Equipment",
        content: review1.trim(),
      });
    }
    if (review2.trim()) {
      reviewsArr.push({
        id: `rev-${Date.now()}-2`,
        author: "Verified Trade Pro",
        rating: 5,
        date: "Recently Verified",
        title: "Highly Recommended",
        content: review2.trim(),
      });
    }

    const finalImg = img.trim() !== "" ? img.trim() : commingSoonImg;
    const finalName = displayName.trim() || name.trim();
    const finalCat = subCategory.trim() || parentCategory.trim() || "Pool Pumps";

    if (editingProduct) {
      const updatedProduct: Product = {
        ...editingProduct,
        name: finalName,
        displayName: displayName.trim() || name.trim(),
        brand: brand.trim(),
        category: finalCat,
        parentCategory: parentCategory.trim(),
        subCategory: subCategory.trim(),
        price: Number(price),
        msrp: Number(price),
        sku: sku.trim(),
        stock: Number(stock),
        details: details.trim(),
        description: description.trim(),
        seoKeywords: seoKeywords.trim(),
        img: finalImg,
        specs: specsMap,
        reviews: reviewsArr.length > 0 ? reviewsArr : editingProduct.reviews || [],
      };

      const updated = productsList.map((p) => (p.id === editingProduct.id ? updatedProduct : p));
      syncLocalProducts(updated);
      queryClient.setQueryData(["admin_all_products"], updated);
      queryClient.setQueryData(["products"], updated);
      triggerToast(`Product '${finalName}' updated successfully.`);

      try {
        await saveProductDb({ data: { product: updatedProduct } });
        invalidateProductsCache(queryClient);
        queryClient.invalidateQueries({ queryKey: ["admin_all_products"] });
        queryClient.invalidateQueries({ queryKey: ["all_products"] });
      } catch (err) {
        console.error("Failed to sync updated product to DB:", err);
      }
    } else {
      const newId = `p-${sku.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
      const newProduct: Product = {
        id: newId,
        name: finalName,
        displayName: displayName.trim() || name.trim(),
        brand: brand.trim(),
        category: finalCat,
        parentCategory: parentCategory.trim(),
        subCategory: subCategory.trim(),
        price: Number(price),
        msrp: Number(price),
        rating: 5.0,
        img: finalImg,
        sku: sku.trim(),
        stock: Number(stock),
        details: details.trim(),
        description: description.trim(),
        seoKeywords: seoKeywords.trim(),
        specs: specsMap,
        reviews: reviewsArr,
      };

      const updated = [...productsList, newProduct];
      syncLocalProducts(updated);
      queryClient.setQueryData(["admin_all_products"], updated);
      queryClient.setQueryData(["products"], updated);
      triggerToast(`Product '${finalName}' added to catalog.`);

      try {
        await saveProductDb({ data: { product: newProduct } });
        invalidateProductsCache(queryClient);
        queryClient.invalidateQueries({ queryKey: ["admin_all_products"] });
        queryClient.invalidateQueries({ queryKey: ["all_products"] });
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Products Catalog
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
              {searchTerm || selectedCategory !== "all" 
                ? `${filteredProducts.length} / ${productsList.length} items` 
                : `${productsList.length} items`
              }
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage wholesale products, inventories, and pricing metrics.</p>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 flex-wrap shrink-0">
          {productsList.length > 0 && (
            <button
              onClick={handleDeleteAllProducts}
              className="py-2.5 px-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white font-extrabold text-xs shadow-xs hover:shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Trash2 className="size-3.5" /> Delete All Products
            </button>
          )}
          <button
            onClick={() => setPriceAdjustModalOpen(true)}
            className="py-2.5 px-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white font-extrabold text-xs shadow-xs hover:shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <TrendingUp className="size-3.5" /> Bulk Price Adjust
          </button>
          <button
            onClick={() => setImportModalOpen(true)}
            className="py-2.5 px-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white font-extrabold text-xs shadow-xs hover:shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="size-3.5" /> Import Excel / CSV
          </button>
          <button
            onClick={openAddModal}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xs shadow-md hover:shadow-lg hover:brightness-110 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-cyan-400/40"
          >
            <Plus className="size-4" /> Add New Product
          </button>
        </div>
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
          <option value="all">All Categories ({productsList.length})</option>
          {dynamicCategories.map(cat => {
            const count = productsList.filter(p =>
              (p.category || "").toLowerCase() === cat.toLowerCase() ||
              (p.parentCategory || "").toLowerCase() === cat.toLowerCase() ||
              (p.subCategory || "").toLowerCase() === cat.toLowerCase()
            ).length;
            return (
              <option key={cat} value={cat}>{cat} ({count})</option>
            );
          })}
        </select>
      </div>

      {/* Bulk Action Toolbar Banner */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900 text-white px-6 py-4 rounded-[1.5rem] flex items-center justify-between shadow-xl border border-slate-800 flex-wrap gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="size-7 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs grid place-items-center border border-rose-500/30">
                {selectedIds.length}
              </span>
              <span className="text-xs font-bold text-slate-200">
                {selectedIds.length} product{selectedIds.length > 1 ? "s" : ""} selected for bulk actions
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds([])}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Deselect All
              </button>
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
              >
                <Trash2 className="size-4" /> Delete Selected ({selectedIds.length})
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Table */}
      <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="size-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                    title="Select All Products"
                  />
                </th>
                <th className="p-4 font-bold">Image</th>
                <th className="p-4 font-bold">Product Name</th>
                <th className="p-4 font-bold">SKU</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold text-right">Price</th>
                <th className="p-4 font-bold text-center">Stock</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => {
                  const isLow = p.stock < 10;
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors group ${isSelected ? "bg-amber-50/50" : ""}`}>
                      <td className="p-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(p.id, e.target.checked)}
                          className="size-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                        />
                      </td>
                      <td className="p-4">
                        <div className="size-12 rounded-xl bg-slate-100/80 border border-slate-200/50 flex items-center justify-center overflow-hidden">
                          {p.img ? (
                            <img src={p.img} alt={p.name} referrerPolicy="no-referrer" className="size-full object-contain p-1" onError={(e) => { if (!e.currentTarget.src.endsWith('/assets/commingsoon.png')) e.currentTarget.src = "/assets/commingsoon.png"; }} />
                          ) : (
                            <Package className="size-5 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 max-w-[280px]">
                        <div className="font-bold text-slate-900 truncate capitalize">{p.name}</div>
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
                            className="size-8 rounded-lg hover:bg-slate-100 text-blue-600 grid place-items-center transition cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="size-8 rounded-lg hover:bg-slate-100 text-rose-600 grid place-items-center transition cursor-pointer"
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
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-semibold">
                    No products matching search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50/50">
            <span className="text-[11px] text-slate-400 font-semibold">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} products
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="size-8 rounded-lg hover:bg-slate-200 disabled:opacity-30 grid place-items-center transition cursor-pointer"
              >
                <ChevronLeft className="size-4 text-slate-600" />
              </button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let page = i + 1;
                if (totalPages > 7) {
                  if (currentPage <= 4) page = i + 1;
                  else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                  else page = currentPage - 3 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`size-8 rounded-lg text-[11px] font-bold transition cursor-pointer ${page === currentPage ? "bg-slate-900 text-white" : "hover:bg-slate-200 text-slate-600"}`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="size-8 rounded-lg hover:bg-slate-200 disabled:opacity-30 grid place-items-center transition cursor-pointer"
              >
                <ChevronRight className="size-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Import Excel / CSV Modal */}
      <AnimatePresence>
        {importModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => !isImporting && setImportModalOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-2xl bg-white rounded-[2rem] border border-slate-200/60 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0">
                    <FileSpreadsheet className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">Bulk Import Products (Excel / CSV)</h3>
                    <p className="text-xs text-slate-500">Upload your product list CSV or Excel export to import into database.</p>
                  </div>
                </div>
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="size-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 grid place-items-center transition cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Sample Template Download Bar */}
              <div className="bg-emerald-50/70 border border-emerald-200/60 p-3.5 rounded-2xl flex items-center justify-between gap-4">
                <div className="text-xs">
                  <span className="font-bold text-emerald-900 block">Need a sample format?</span>
                  <span className="text-emerald-700 text-[11px]">Download our 15-column sample template formatted with: Category, Sub Category, Manufacturer, Name, Display Name, SKU, Price, Qty Available, Details, Image Link, SEO Keywords, Product Description, Specifications, 5-Star Review 1, 5-Star Review 2.</span>
                </div>
                <button
                  onClick={downloadSampleExcel}
                  className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 hover:bg-emerald-100/50 transition shrink-0 cursor-pointer"
                >
                  <Download className="size-4" /> Download Excel Template (.xlsx)
                </button>
              </div>

              {/* Dropzone File Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/30 p-6 rounded-2xl text-center cursor-pointer transition-all space-y-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="size-10 text-emerald-600 mx-auto" />
                <div className="text-xs font-bold text-slate-700">
                  {fileName ? (
                    <span className="text-emerald-700 font-extrabold">{fileName}</span>
                  ) : (
                    "Click to select or drag & drop your Excel (.csv, .xlsx, .json) file here"
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-semibold">Supports CSV (UTF-8), Excel CSV, or JSON exports</p>
              </div>

              {/* Parsed Products Preview Table */}
              {parsedProducts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
                    <span>Parsed Catalog Preview</span>
                    <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {parsedProducts.length} items ready to import
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs text-slate-700 bg-white">
                    {parsedProducts.slice(0, 6).map((p, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-400">{p.brand} • {p.category}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-emerald-700">${p.price}</div>
                          <div className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</div>
                        </div>
                      </div>
                    ))}
                    {parsedProducts.length > 6 && (
                      <div className="p-2 text-center text-[11px] font-bold text-slate-400 bg-slate-50">
                        ...and {parsedProducts.length - 6} more products
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {isImporting && importProgress && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Importing products...</span>
                    <span>{importProgress.current} / {importProgress.total}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Import Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => { setImportModalOpen(false); setParsedProducts([]); setFileName(""); }}
                  disabled={isImporting}
                  className="px-5 py-2.5 rounded-full hover:bg-slate-100 font-semibold text-xs text-slate-500 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeBulkImport}
                  disabled={parsedProducts.length === 0 || isImporting}
                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isImporting ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  Import {parsedProducts.length > 0 ? `${parsedProducts.length} Products` : "File"} to Database
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setFormOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-51 w-full max-w-2xl bg-white rounded-[2rem] border border-slate-200/60 p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h3 className="font-extrabold text-lg text-slate-900">
                  {editingProduct ? "Edit Wholesale Product" : "Add New Wholesale Product"}
                </h3>
                <button
                  onClick={() => setFormOpen(false)}
                  className="size-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 grid place-items-center transition cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={saveProduct} className="space-y-4">
                {/* Section 1: Classification */}
                <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl space-y-3">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">1. Categorization & Brand</span>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <label className="block">
                      <span className="block text-[10px] font-bold text-slate-600 mb-1">Parent Category</span>
                      <select
                        value={parentCategory} onChange={(e) => setParentCategory(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                      >
                        <option value="Pool & Spa">Pool & Spa</option>
                        <option value="Parts & Hardware">Parts & Hardware</option>
                        <option value="Chemicals">Chemicals</option>
                        <option value="Maintenance & Cleaning">Maintenance & Cleaning</option>
                        <option value="Safety & Accessibility">Safety & Accessibility</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="block text-[10px] font-bold text-slate-600 mb-1">Sub Category</span>
                      <select
                        value={subCategory} onChange={(e) => setSubCategory(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="block text-[10px] font-bold text-slate-600 mb-1">Manufacturer (Brand)</span>
                      <input
                        type="text" required value={brand} onChange={(e) => setBrand(e.target.value)}
                        placeholder="e.g. Pentair, Hayward, Jandy"
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:border-indigo-500 transition"
                      />
                    </label>
                  </div>
                </div>

                {/* Section 2: Product Titles & Identifiers */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="block sm:col-span-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">System Name</span>
                    <input
                      type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Pentair SuperFlo VS 1.5HP"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-indigo-500 transition"
                    />
                  </label>

                  <label className="block sm:col-span-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Display Name (Public)</span>
                    <input
                      type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. SuperFlo VS Energy Efficient Pump"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-indigo-500 transition"
                    />
                  </label>

                  <label className="block sm:col-span-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">SKU Code</span>
                    <input
                      type="text" required value={sku} onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. 011533"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 transition"
                    />
                  </label>
                </div>

                {/* Section 3: Pricing & Stock */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Wholesale Price ($)</span>
                    <input
                      type="number" required min={0.01} step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-extrabold focus:outline-none focus:border-indigo-500 transition"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Qty Available (Stock)</span>
                    <input
                      type="number" required min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-extrabold focus:outline-none focus:border-indigo-500 transition"
                    />
                  </label>
                </div>

                {/* Section 4: Details & Image */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Feature Details / Short Summary</span>
                    <input
                      type="text" value={details} onChange={(e) => setDetails(e.target.value)}
                      placeholder="e.g. 1.5 HP, 115V/230V, Variable Speed, Ultra Quiet"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-indigo-500 transition"
                    />
                  </label>

                  <div className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Image Link (URL)</span>
                    <div className="flex gap-2">
                      <input
                        type="url" value={img} onChange={(e) => setImg(e.target.value)}
                        placeholder="https://... or upload image"
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-indigo-500 transition"
                      />
                      <label className="h-9 px-3 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition">
                        {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
                        <span>Upload</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 5: SEO Keywords & Specs */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">SEO Keywords</span>
                    <input
                      type="text" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="e.g. pentair, pool pump, superflo, variable speed"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-indigo-500 transition"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Specifications</span>
                    <input
                      type="text" value={specifications} onChange={(e) => setSpecifications(e.target.value)}
                      placeholder="e.g. Warranty: 2 Years; Volts: 115V/230V; HP: 1.5 HP"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-indigo-500 transition"
                    />
                  </label>
                </div>

                {/* Section 6: Product Description */}
                <label className="block">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Product Description</span>
                  <textarea
                    required rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter full commercial product description, features, and specs..."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                </label>

                {/* Section 7: 5-Star Customer Reviews */}
                <div className="bg-amber-50/60 border border-amber-200/70 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="size-4 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900">5-Star Verified Customer Reviews</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="block text-[10px] font-bold text-amber-800 mb-1">5-Star Review 1</span>
                      <textarea
                        rows={2} value={review1} onChange={(e) => setReview1(e.target.value)}
                        placeholder="e.g. Extremely quiet operation and reduced our electric bill by 65%!"
                        className="w-full p-2.5 rounded-xl border border-amber-200 bg-white text-xs focus:outline-none focus:border-amber-500 transition resize-none"
                      />
                    </label>

                    <label className="block">
                      <span className="block text-[10px] font-bold text-amber-800 mb-1">5-Star Review 2</span>
                      <textarea
                        rows={2} value={review2} onChange={(e) => setReview2(e.target.value)}
                        placeholder="e.g. Commercial grade durability and easy installation for technicians."
                        className="w-full p-2.5 rounded-xl border border-amber-200 bg-white text-xs focus:outline-none focus:border-amber-500 transition resize-none"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button" onClick={() => setFormOpen(false)}
                    className="px-5 py-2.5 rounded-full hover:bg-slate-100 font-semibold text-xs text-slate-500 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-6 py-2.5 rounded-full bg-gradient-ocean text-white font-semibold text-xs hover:opacity-95 transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {editingProduct ? "Save Changes" : "Create Product"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Single Delete Confirmation Modal */}
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
                  className="px-5 py-2.5 rounded-full hover:bg-slate-100 font-semibold text-xs text-slate-500 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteProduct}
                  className="px-5 py-2.5 rounded-full bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition cursor-pointer"
                >
                  Delete Item
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bulk Delete Modal */}
      <AnimatePresence>
        {showBulkDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => !isBulkDeleting && setShowBulkDeleteModal(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-md bg-white rounded-[2rem] border border-slate-200/60 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-rose-100 text-rose-600 grid place-items-center shrink-0">
                  <Trash2 className="size-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Delete {selectedIds.length} Products?</h3>
                  <p className="text-xs text-slate-500 mt-0.5">This will permanently remove the selected items from database & catalog.</p>
                </div>
              </div>

              <div className="max-h-44 overflow-y-auto bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs space-y-1 text-left scrollbar-thin">
                {productsList
                  .filter(p => selectedIds.includes(p.id))
                  .slice(0, 6)
                  .map(p => (
                    <div key={p.id} className="font-semibold text-slate-700 truncate">• {p.name} <span className="text-[10px] text-slate-400">({p.sku})</span></div>
                  ))}
                {selectedIds.length > 6 && (
                  <div className="text-slate-400 font-bold pt-1 text-[11px]">...and {selectedIds.length - 6} more items</div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  disabled={isBulkDeleting}
                  className="px-5 py-2.5 rounded-full hover:bg-slate-100 font-semibold text-xs text-slate-500 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeBulkDelete}
                  disabled={isBulkDeleting}
                  className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isBulkDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Confirm Bulk Delete ({selectedIds.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Bulk Price Adjustment Modal */}
      <AnimatePresence>
        {priceAdjustModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => !isAdjustingPrices && setPriceAdjustModalOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-xl bg-white rounded-[2.5rem] border border-slate-200/80 p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-indigo-100 text-indigo-600 grid place-items-center shrink-0">
                    <TrendingUp className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Bulk Price Adjuster</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Adjust pricing across catalog by percentage or fixed dollar amounts</p>
                  </div>
                </div>
                <button
                  onClick={() => setPriceAdjustModalOpen(false)}
                  className="size-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="size-4 text-slate-500" />
                </button>
              </div>

              {/* Step 1: Target Scope */}
              <div className="space-y-2">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">1. Target Scope</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "all", label: "All Products", count: productsList.length },
                    { id: "category", label: "By Category", count: affectedProducts.length },
                    { id: "selected", label: "Selected Only", count: selectedIds.length },
                  ].map((s) => {
                    const active = adjustScope === s.id;
                    const disabled = s.id === "selected" && selectedIds.length === 0;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setAdjustScope(s.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs"
                            : disabled
                            ? "opacity-40 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium"
                        }`}
                      >
                        <div className="text-xs font-bold">{s.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{s.count} items</div>
                      </button>
                    );
                  })}
                </div>

                {/* Category Dropdown when Category scope is active */}
                {adjustScope === "category" && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Target Category:</label>
                    <select
                      value={adjustCategory}
                      onChange={(e) => setAdjustCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:outline-none focus:border-indigo-500"
                    >
                      {CATEGORIES.map((cat) => {
                        const count = productsList.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
                        return (
                          <option key={cat} value={cat}>
                            {cat} ({count} products)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              {/* Step 2: Adjustment Mode */}
              <div className="space-y-2">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">2. Adjustment Method</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "percent_increase", label: "+ % Increase", sub: "e.g. +10%" },
                    { id: "percent_decrease", label: "- % Decrease", sub: "e.g. -5%" },
                    { id: "fixed_increase", label: "+ $ Fixed", sub: "e.g. +$25" },
                    { id: "fixed_decrease", label: "- $ Fixed", sub: "e.g. -$10" },
                  ].map((m) => {
                    const active = adjustMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setAdjustMode(m.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          active
                            ? "border-indigo-600 bg-indigo-600 text-white font-bold shadow-xs"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                        }`}
                      >
                        <div className="text-xs">{m.label}</div>
                        <div className={`text-[10px] ${active ? "text-indigo-100" : "text-slate-400"}`}>{m.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Value Input & Presets */}
              <div className="space-y-2">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  3. Enter {adjustMode.startsWith("percent") ? "Percentage Value (%)" : "Dollar Amount ($)"}
                </span>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-3 text-slate-400 font-extrabold text-sm">
                      {adjustMode.startsWith("percent") ? "%" : "$"}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step={adjustMode.startsWith("percent") ? "1" : "0.5"}
                      value={adjustValue}
                      onChange={(e) => setAdjustValue(Math.max(0, Number(e.target.value)))}
                      className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 font-black text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  {/* Dynamic Preset Buttons for % and $ (Increase & Decrease) */}
                  <div className="flex gap-1">
                    {(adjustMode.startsWith("percent") ? [5, 10, 15, 20, 25] : [5, 10, 25, 50, 100]).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAdjustValue(val)}
                        className={`px-2.5 py-2 rounded-lg border text-xs font-extrabold transition cursor-pointer ${
                          adjustValue === val ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {adjustMode.includes("decrease") ? "-" : "+"}
                        {adjustMode.startsWith("percent") ? `${val}%` : `$${val}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 4: Options */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adjustMsrp}
                    onChange={(e) => setAdjustMsrp(e.target.checked)}
                    className="size-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Proportionally Adjust MSRP Retail Price</div>
                    <div className="text-[11px] text-slate-500">Applies the same percentage or fixed delta to manufacturer list price</div>
                  </div>
                </label>
              </div>

              {/* Step 5: Live Sample Calculation Preview */}
              {affectedProducts.length > 0 && (
                <div className="border border-indigo-100 bg-indigo-50/50 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900">
                      Live Sample Preview ({affectedProducts.length} items affected)
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs scrollbar-thin">
                    {affectedProducts.slice(0, 3).map((p) => {
                      const { price: newP } = calculateAdjustedPrices(p);
                      const diff = newP - p.price;
                      return (
                        <div key={p.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-indigo-100">
                          <div className="truncate font-semibold text-slate-700 max-w-[220px]">
                            {p.name} <span className="text-[10px] text-slate-400">({p.sku})</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="line-through text-slate-400 text-[11px] mr-1.5">${p.price.toFixed(2)}</span>
                            <span className="font-extrabold text-indigo-700">${newP.toFixed(2)}</span>
                            <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${diff >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                              {diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setPriceAdjustModalOpen(false)}
                  disabled={isAdjustingPrices}
                  className="px-5 py-2.5 rounded-full hover:bg-slate-100 font-semibold text-xs text-slate-500 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyPriceAdjustment}
                  disabled={isAdjustingPrices || affectedProducts.length === 0}
                  className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition disabled:opacity-50 cursor-pointer active:scale-97"
                >
                  {isAdjustingPrices ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="size-4" /> Apply to {affectedProducts.length} Products
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
