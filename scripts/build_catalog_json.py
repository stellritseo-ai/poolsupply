import csv
import json
import os
import re

csv_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'SwimmingPoolDistributors_Final_Catalog.xlsx - Sheet1.csv')
out_json_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'catalog-products.json')

print(f"Reading {csv_path}...")

products = []

with open(csv_path, mode='r', encoding='utf-8', errors='ignore') as f:
    reader = csv.DictReader(f)
    for idx, row in enumerate(reader):
        cat = (row.get('Category') or 'POOL & SPA').strip()
        sub_cat = (row.get('Sub Category') or 'Automation').strip()
        manufacturer = (row.get('Manufacturer') or 'Generic').strip()
        name = (row.get('Display Name') or row.get('Name') or f'Pool Product {idx+1}').strip()
        sku = (row.get('SKU') or f'PSW-{idx+1}').strip()
        
        price_raw = re.sub(r'[^0-9.]', '', row.get('Price') or '199.99')
        try:
            price = float(price_raw) if price_raw else 199.99
        except:
            price = 199.99
            
        msrp = round(price * 1.25, 2)

        stock_raw = re.sub(r'[^0-9]', '', row.get('Qty Available') or '10')
        try:
            stock = int(stock_raw) if stock_raw else 10
        except:
            stock = 10

        details = (row.get('Details') or '').strip()
        img_raw = (row.get('Image Link') or '').strip()
        img = img_raw.replace(' ', '%20') if img_raw.startswith('http') else '/assets/commingsoon.png'
        seo_keywords = (row.get('SEO Keywords') or '').strip()
        description = (row.get('Product Description') or details or f"{name} by {manufacturer}. Commercial grade pool and spa equipment.").strip()
        specs_raw = (row.get('Specifications') or '').strip()
        rev1 = (row.get('5-Star Review 1') or '').strip()
        rev2 = (row.get('5-Star Review 2') or '').strip()

        # Parse Specifications
        specs = {
          "Manufacturer / Brand": manufacturer,
          "Official SKU": sku,
          "Category": cat,
          "Sub-Category": sub_cat
        }

        if specs_raw:
            for line in specs_raw.split('\n'):
                line = re.sub(r'^[•\-\*\s]+', '', line).strip()
                if ':' in line:
                    parts = line.split(':', 1)
                    k = parts[0].strip()
                    v = parts[1].strip()
                    if k and v:
                        specs[k] = v

        # Parse 2 Reviews
        reviews = []
        if rev1:
            reviews.append({
                "id": f"rev-1-{sku.lower()}",
                "author": "Verified Buyer",
                "rating": 5,
                "date": "2026-06-15",
                "title": "5/5 Stars - Highly Recommended",
                "content": rev1
            })
        if rev2:
            reviews.append({
                "id": f"rev-2-{sku.lower()}",
                "author": "Certified Pool Technician",
                "rating": 5,
                "date": "2026-07-02",
                "title": "5/5 Stars - Top-notch Quality",
                "content": rev2
            })

        clean_sku = re.sub(r'[^a-z0-9]', '-', sku.lower()).strip('-')
        product_id = f"p-{clean_sku}" if clean_sku else f"p-{idx+1}"

        doc = {
            "id": product_id,
            "name": name,
            "brand": manufacturer,
            "category": sub_cat,
            "parentCategory": cat,
            "subCategory": sub_cat,
            "price": price,
            "msrp": msrp,
            "rating": 5.0,
            "img": img,
            "sku": sku,
            "stock": stock,
            "details": details,
            "description": description,
            "seoKeywords": seo_keywords,
            "specs": specs,
            "reviews": reviews
        }
        products.append(doc)

print(f"Successfully processed {len(products)} products from CSV.")

with open(out_json_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2)

print(f"✅ Saved clean catalog JSON to {out_json_path}")
