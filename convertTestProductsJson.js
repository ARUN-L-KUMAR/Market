const fs = require('fs');

const USD_TO_INR = 83;
const file = './backend/public/test.products.json';

// Read the JSON file
const data = JSON.parse(fs.readFileSync(file, 'utf-8'));

data.forEach(product => {
  if (typeof product.price === 'number') product.price = Math.round(product.price * USD_TO_INR);
  if (typeof product.comparePrice === 'number') product.comparePrice = Math.round(product.comparePrice * USD_TO_INR);
  if (typeof product.costPrice === 'number') product.costPrice = Math.round(product.costPrice * USD_TO_INR);
  product.currency = 'INR';
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('All product prices converted to INR and currency field set in test.products.json.');