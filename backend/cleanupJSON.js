const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'product.json');
const content = fs.readFileSync(filePath, 'utf8');

let products = [];

try {
    // This is a very loose way to handle the user's messy file
    // We'll strip the variable declaration and try to parse it as an array
    const cleanContent = content
        .replace(/const\s+mobileProducts\s*=\s*/, '')
        .replace(/];[\s\S]*/, ']')
        .trim();

    // Using eval is risky but here it's the easiest way to handle JS object literals (unquoted keys)
    products = eval(cleanContent);
} catch (e) {
    console.log('Regex cleanup failed, trying line by line or object by object');
}

// If the above failed or we missed the trailing objects
if (products.length === 0 || content.includes('};')) {
    // Try to find all objects {}
    const objectMatches = content.matchAll(/\{[\s\S]*?\}/g);
    for (const match of objectMatches) {
        try {
            const obj = eval('(' + match[0] + ')');
            // Basic validation it's a product
            if (obj.title) {
                products.push(obj);
            }
        } catch (e) {
            // Skip invalid objects
        }
    }
}

// Deduplicate by slug if necessary
const uniqueProducts = [];
const seenSlugs = new Set();
for (const p of products) {
    if (!seenSlugs.has(p.slug)) {
        uniqueProducts.push(p);
        seenSlugs.add(p.slug);
    }
}

fs.writeFileSync(filePath, JSON.stringify(uniqueProducts, null, 2));
console.log(`Successfully cleaned up product.json. Found ${uniqueProducts.length} unique products.`);
