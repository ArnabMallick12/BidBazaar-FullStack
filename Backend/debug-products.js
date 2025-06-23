const mongoose = require('mongoose');
const Product = require('./models/product.model');
const User = require('./models/user.model');

// Connect to MongoDB (update with your connection string)
mongoose.connect('mongodb://localhost:27017/bidbazaar', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function debugProducts() {
    try {
        const products = await Product.find({}).populate('user_id', 'username');
        const now = new Date();
        
        console.log(`\n=== Product Debug Report (Current time: ${now}) ===\n`);
        
        products.forEach((product, index) => {
            console.log(`${index + 1}. Product: ${product.title}`);
            console.log(`   Owner: ${product.user_id?.username || 'Unknown'}`);
            console.log(`   Start Date: ${product.start_date}`);
            console.log(`   End Date: ${product.end_date}`);
            console.log(`   Is Listed: ${product.is_listed}`);
            console.log(`   Sold: ${product.sold}`);
            console.log(`   Is Active: ${product.isActive()}`);
            
            if (!product.isActive()) {
                if (!product.is_listed) console.log(`   ❌ Reason: Product is not listed`);
                else if (product.sold) console.log(`   ❌ Reason: Product is already sold`);
                else if (now < product.start_date) console.log(`   ❌ Reason: Auction hasn't started yet`);
                else if (now > product.end_date) console.log(`   ❌ Reason: Auction has already ended`);
            } else {
                console.log(`   ✅ Product is available for bidding`);
            }
            console.log('');
        });
        
        console.log(`\nTotal products: ${products.length}`);
        console.log(`Active products: ${products.filter(p => p.isActive()).length}`);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

debugProducts(); 