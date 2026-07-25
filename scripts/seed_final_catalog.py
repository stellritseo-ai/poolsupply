import csv
import os
import re
import json
from pymongo import MongoClient

# Load .env
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                os.environ[key.strip()] = val.strip().strip("'").strip('"')

uri = os.environ.get("MONGODB_URI")
if not uri:
    print("ERROR: MONGODB_URI environment variable is not defined.")
    sys.exit(1)

csv_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'SwimmingPoolDistributors_Final_Catalog.xlsx - Sheet1.csv')

print(f"Connecting to MongoDB Atlas at {uri[:30]}...")
client = MongoClient(uri)
db = client.aquapro
products_col = db.products

print(f"Reading catalog CSV from {csv_path}...")

products = []
with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
    reader = csv.DictReader(f)
    for idx, row in enumerate(reader):
        cat = row.get('Category', '').strip() or 'POOL & SPA'
        sub_cat = row.get('Sub Category', '').strip() or 'Automation'
        manufacturer = row.get('Manufacturer', '').strip() or 'Generic'
        name = row.get('Display Name', '').strip() or row.get('Name', '').strip() or f'Pool Equipment {idx+1}'
        sku = row.get('SKU', '').strip() or f'PSW-{idx+1}'
        
        price_str = re.sub(r'[^0-9.]', '', row.get('Price', '199.99'))
        try:
            price = float(price_str) if price_str else 199.99
        except:
            price = 199.99
            
        msrp = round(price * 1.25, 2)
        
        stock_str = re.sub(r'[^0-9]', '', row.get('Qty Available', '10'))
        try:
            stock = int(stock_str) if stock_str else 10
        except:
            stock = 10
            
        details = row.get('Details', '').strip()
        img_raw = row.get('Image Link', '').strip()
        img = img_raw if img_raw.startswith('http') else '/assets/commingsoon.png'
        seo_keywords = row.get('SEO Keywords', '').strip()
        description = row.get('Product Description', '').strip() or details or f'{name} by {manufacturer}. Commercial grade pool and spa equipment.'
        specs_raw = row.get('Specifications', '').strip()
        rev1 = row.get('5-Star Review 1', '').strip()
        rev2 = row.get('5-Star Review 2', '').strip()

        # Parse Specs
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
                    k, v = line.split(':', 1)
                    if k.strip() and v.strip():
                        specs[k.strip()] = v.strip()

        # Parse 2 Reviews
        reviews = []
        if rev1:
            reviews.append({
                "id": f"rev-1-{sku.lower()}",
                "author": "Verified Buyer",
                "rating": 5,
                "date": "2026-06-15",
                "title": "Outstanding Performance & Durability",
                "content": rev1
            })
        if rev2:
            reviews.append({
                "id": f"rev-2-{sku.lower()}",
                "author": "Certified Pool Technician",
                "rating": 5,
                "date": "2026-07-02",
                "title": "Highly Recommended Equipment",
                "content": rev2
            })

        product_id = f"p-{re.sub(r'[^a-z0-9]', '-', sku.lower())}"

        doc = {
            "_id": product_id,
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

print(f"Parsed {len(products)} products from CSV catalog.")

# Perform bulk upsert in MongoDB
from pymongo import ReplaceOne

bulk_ops = [ReplaceOne({'_id': p['_id']}, p, upsert=True) for p in products]

batch_size = 1000
for i in range(0, len(bulk_ops), batch_size):
    batch = bulk_ops[i:i + batch_size]
    res = products_col.bulk_write(batch)
    print(f"Batch {i//batch_size + 1}/{len(bulk_ops)//batch_size + 1} completed. Upserted: {res.upserted_count}, Modified: {res.modified_count}")

print("✅ MongoDB Atlas seeding complete!")
