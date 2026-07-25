import zipfile
import xml.etree.ElementTree as ET
import json
import os
import re

xlsx_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'pools.xlsx')
out_json_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'catalog-products.json')

print(f"Opening Excel file {xlsx_path}...")

with zipfile.ZipFile(xlsx_path, 'r') as z:
    # 1. Read shared strings
    strings_xml = z.read('xl/sharedStrings.xml')
    tree = ET.fromstring(strings_xml)
    shared_strings = []
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    for si in tree.findall('ns:si', ns):
        # Join all text elements inside si
        text_parts = [t.text or '' for t in si.findall('.//ns:t', ns)]
        shared_strings.append(''.join(text_parts))

    print(f"Loaded {len(shared_strings)} shared strings.")

    # 2. Read sheet1.xml
    sheet_xml = z.read('xl/worksheets/sheet1.xml')
    sheet_tree = ET.fromstring(sheet_xml)
    
    rows_data = []
    sheet_data = sheet_tree.find('ns:sheetData', ns)
    
    for row in sheet_data.findall('ns:row', ns):
        row_cells = {}
        for cell in row.findall('ns:c', ns):
            cell_ref = cell.attrib.get('r', '')
            col_letter = re.sub(r'[0-9]', '', cell_ref)
            cell_type = cell.attrib.get('t', '')
            val_elem = cell.find('ns:v', ns)
            val = val_elem.text if val_elem is not None else ''
            
            if cell_type == 's' and val != '':
                val = shared_strings[int(val)]
            row_cells[col_letter] = val
        rows_data.append(row_cells)

print(f"Total rows extracted from sheet1: {len(rows_data)}")

# Map header
header_row = rows_data[0]
print("Header columns:", header_row)

# Headers in pools.xlsx:
# A: Category, B: Sub Category, C: Manufacturer, D: Name, E: Display Name, F: SKU, G: Price, H: Qty Available, I: Details, J: Image Link, K: SEO Keywords, L: Product Description, M: Specifications, N: 5-Star Review 1, O: 5-Star Review 2

products = []

for idx, r in enumerate(rows_data[1:]):
    cat = (r.get('A') or 'POOL & SPA').strip()
    sub_cat = (r.get('B') or 'Automation').strip()
    manufacturer = (r.get('C') or 'Generic').strip()
    name = (r.get('E') or r.get('D') or f'Pool Product {idx+1}').strip()
    sku = (r.get('F') or f'PSW-{idx+1}').strip()

    price_raw = re.sub(r'[^0-9.]', '', str(r.get('G') or '199.99'))
    try:
        price = float(price_raw) if price_raw else 199.99
    except:
        price = 199.99

    msrp = round(price * 1.25, 2)

    stock_raw = re.sub(r'[^0-9]', '', str(r.get('H') or '10'))
    try:
        stock = int(stock_raw) if stock_raw else 10
    except:
        stock = 10

    details = (r.get('I') or '').strip()
    img_raw = (r.get('J') or '').strip()
    
    # Clean image link and encode spaces
    if img_raw and img_raw.startswith('http'):
        img = img_raw.replace(' ', '%20')
    else:
        img = '/assets/commingsoon.png'

    seo_keywords = (r.get('K') or '').strip()
    description = (r.get('L') or details or f"{name} by {manufacturer}. Commercial grade pool and spa equipment.").strip()
    specs_raw = (r.get('M') or '').strip()
    rev1 = (r.get('N') or '').strip()
    rev2 = (r.get('O') or '').strip()

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

print(f"Successfully processed {len(products)} products from pools.xlsx.")

with open(out_json_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2)

print(f"✅ Updated {out_json_path} from src/assets/pools.xlsx!")
