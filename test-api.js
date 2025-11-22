async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');
    
    // Test receipts
    console.log('1. Testing GET /api/receipts');
    const receiptsResponse = await fetch('http://localhost:5000/api/receipts');
    const receipts = await receiptsResponse.json();
    console.log(`   ✓ Success! Found ${receipts.length} receipts`);
    if (receipts.length > 0) {
      console.log('   First receipt:', JSON.stringify(receipts[0], null, 2));
    }
    console.log('');
    
    // Test deliveries
    console.log('2. Testing GET /api/deliveries');
    const deliveriesResponse = await fetch('http://localhost:5000/api/deliveries');
    const deliveries = await deliveriesResponse.json();
    console.log(`   ✓ Success! Found ${deliveries.length} deliveries`);
    if (deliveries.length > 0) {
      console.log('   First delivery:', JSON.stringify(deliveries[0], null, 2));
    }
    console.log('');
    
    // Test products
    console.log('3. Testing GET /api/products');
    const productsResponse = await fetch('http://localhost:5000/api/products');
    const products = await productsResponse.json();
    console.log(`   ✓ Success! Found ${products.length} products`);
    if (products.length > 0) {
      console.log('   First product:', JSON.stringify(products[0], null, 2));
    }
    
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

testAPI();
