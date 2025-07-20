# API Endpoints for Adding Products

## 1. Create a Single Product
**POST** `http://localhost:3000/api/products`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (JSON):**
```json
{
  "title": "Apple Watch Series 8",
  "description": "Advanced health and fitness features with ECG and blood oxygen monitoring",
  "shortDescription": "Smart watch with health monitoring",
  "price": 399,
  "comparePrice": 449,
  "stock": 30,
  "sku": "APPLE-WATCH-S8-001",
  "brand": "Apple",
  "category": "CATEGORY_ID_HERE",
  "images": [
    {
      "url": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500",
      "alt": "Apple Watch Series 8",
      "isPrimary": true
    }
  ],
  "colors": [
    { "name": "Midnight", "hexCode": "#000000", "stock": 15 },
    { "name": "Starlight", "hexCode": "#F5F5DC", "stock": 15 }
  ],
  "sizes": [
    { "name": "41mm", "stock": 15 },
    { "name": "45mm", "stock": 15 }
  ],
  "tags": ["smartwatch", "apple", "health", "fitness"],
  "isFeatured": true,
  "isActive": true
}
```

## 2. Bulk Create Products
**POST** `http://localhost:3000/api/products/bulk`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (JSON):**
```json
{
  "products": [
    {
      "title": "Product 1",
      "price": 99.99,
      "stock": 50,
      "sku": "PROD-001"
    },
    {
      "title": "Product 2",
      "price": 149.99,
      "stock": 30,
      "sku": "PROD-002"
    }
  ]
}
```

## 3. Using cURL Commands

### Add a single product:
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Wireless Bluetooth Earbuds",
    "description": "High-quality wireless earbuds with active noise cancellation",
    "price": 129.99,
    "stock": 100,
    "sku": "EARBUDS-001",
    "brand": "TechBrand"
  }'
```

### Get your admin token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_admin_password"
  }'
```
