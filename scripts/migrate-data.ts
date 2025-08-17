import { promises as fs } from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://ecommerce-mongodb:27017/easyshop';
const scriptDir = path.resolve(path.dirname(''));

/* PRODUCT SCHEMA */
const productSchema = new mongoose.Schema({
  _id: { type: String }, /* ALLOW STRING IDS */
  originalId: { type: String }, /* STORE THE ORIGINAL ID */
  title: { type: String, required: true }, 
  description: String,
  price: { type: Number, required: true },
  oldPrice: Number,
  categories: [String],
  image: [String],
  rating: { type: Number, default: 0 },
  amount: { type: Number, required: true },
  shop_category: { type: String, required: true },
  unit_of_measure: String,
  colors: [String],
  sizes: [String]
}, {
  timestamps: true,
  _id: false /* DISABLE AUTO-GENERATED OBJECTID */
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

/* FUNCTION TO GET CORRECT IMAGE PATH BASED ON SHOP CATEGORY */
function getImagePath(originalPath: string, shopCategory: string): string {
  const fileName = path.basename(originalPath);
  const categoryMap: { [key: string]: string } = {
    electronics: 'gadgetsImages',
    medicine: 'medicineImages',
    grocery: 'groceryImages',
    clothing: 'clothingImages',
    furniture: 'furnitureImages',
    books: 'books',
    beauty: 'makeupImages',
    snacks: 'groceryImages',
    bakery: 'bakeryImages',
    bags: 'bagsImages'
  };
  
  const imageDir = categoryMap[shopCategory] || shopCategory + 'Images';
  return `/${imageDir}/${fileName}`;
}

async function migrateData() {
  try {
    console.log('ATTEMPTING TO CONNECT TO MONGODB AT:', MONGODB_URI);
    
    /* CONNECT TO MONGODB WITH OPTIONS */
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, /* TIMEOUT AFTER 5S INSTEAD OF 30S */
      socketTimeoutMS: 45000, /* CLOSE SOCKETS AFTER 45S */
    });
    
    console.log('SUCCESSFULLY CONNECTED TO MONGODB');

    /* GET THE PROJECT ROOT DIRECTORY (ONE LEVEL UP FROM SCRIPTS) */
    const projectRoot = path.resolve(__dirname, '..');
    
    /* READ THE JSON FILE FROM THE PROJECT ROOT */
    const jsonData = await fs.readFile(
      path.join(projectRoot, '.db', 'db.json'),
      'utf-8'
    );
    const data = JSON.parse(jsonData);

    /* CLEAR EXISTING PRODUCTS */
    await Product.deleteMany({});
    console.log('CLEARED EXISTING PRODUCTS');

    /* CREATE A MAP TO TRACK USED IDS */
    const usedIds = new Set<string>();

    /* PREPARE PRODUCTS FOR INSERTION WITH UNIQUE IDS */
    const products = data.products.map((product: any) => {
      /* ENSURE ID IS UNIQUE AND PADDED */
      let paddedId = product.id.padStart(10, '0');
      while (usedIds.has(paddedId)) {
        const num = parseInt(paddedId);
        paddedId = (num + 1).toString().padStart(10, '0');
      }
      usedIds.add(paddedId);

      /* FIX IMAGE PATHS */
      const fixedImages = product.image.map((img: string) => 
        getImagePath(img, product.shop_category)
      );

      return {
        _id: paddedId,
        originalId: paddedId,
        ...product,
        image: fixedImages
      };
    });

    /* INSERT PRODUCTS */
    await Product.insertMany(products);
    console.log(`MIGRATED ${products.length} PRODUCTS`);

    console.log('MIGRATION COMPLETED SUCCESSFULLY');
  } catch (error) {
    console.error('MIGRATION FAILED:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateData();
