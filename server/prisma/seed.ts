import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting VELORA database seeding...');

  // Clean existing data
  await prisma.inventoryLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Velora Admin',
      email: 'admin@velora.com',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@velora.com',
      password: userPassword,
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    },
  });

  console.log('✅ Users created: Admin (admin@velora.com / admin123)');

  // Create Categories
  const categoriesData = [
    { name: 'Men\'s Fashion', slug: 'mens-clothing', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800', description: 'Premium menswear, jackets, and accessories.' },
    { name: 'Women\'s Fashion', slug: 'womens-clothing', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800', description: 'Elegant dresses, tops, and styling pieces.' },
    { name: 'Mobile Phones', slug: 'mobile-phones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', description: 'Latest smartphones from top global brands.' },
    { name: 'Laptops & Computers', slug: 'laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', description: 'High-performance laptops for work and gaming.' },
    { name: 'Audio & Headphones', slug: 'headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', description: 'Premium audio gear and true wireless earbuds.' },
    { name: 'Home Appliances', slug: 'home-appliances', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800', description: 'Smart and essential home appliances.' },
    { name: 'Watches', slug: 'watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', description: 'Classic and smartwatches.' },
    { name: 'Footwear', slug: 'footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', description: 'Sneakers, boots, and formal shoes.' }
  ];

  const categoriesMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoriesMap.set(cat.slug, created.id);
  }

  console.log('✅ Categories created');

  // Helper for generating products with INR prices
  const productsList = [
    // Mens Fashion
    { name: 'Hugo Boss Tailored Wool Suit', price: 45500, originalPrice: 55000, categorySlug: 'mens-clothing', isFeatured: true, isNew: true, stock: 15, sku: 'MEN-001', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800', desc: 'Premium Italian wool tailored suit by Hugo Boss, perfect for formal occasions.' },
    { name: 'Levi\'s 501 Original Fit Jeans', price: 4299, originalPrice: 5299, categorySlug: 'mens-clothing', isFeatured: false, isNew: false, stock: 85, sku: 'MEN-002', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800', desc: 'The classic Levi\'s 501 straight leg denim jeans.' },
    { name: 'Ralph Lauren Cotton Polo', price: 4999, originalPrice: 5999, categorySlug: 'mens-clothing', isFeatured: false, isNew: true, stock: 120, sku: 'MEN-003', img: 'https://images.unsplash.com/photo-1571512702755-d6c5dfd4c5d8?w=800', desc: 'Iconic Ralph Lauren mesh cotton polo shirt.' },
    { name: 'Calvin Klein Classic Underwear Pack', price: 2999, originalPrice: null, categorySlug: 'mens-clothing', isFeatured: false, isNew: false, stock: 200, sku: 'MEN-004', img: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800', desc: '3-pack of Calvin Klein classic cotton trunks.' },

    // Womens Fashion
    { name: 'Zara Floral Summer Maxi Dress', price: 3899, originalPrice: 4499, categorySlug: 'womens-clothing', isFeatured: true, isNew: true, stock: 45, sku: 'WOM-001', img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800', desc: 'Lightweight chiffon floral maxi dress from Zara.' },
    { name: 'H&M Oversized Beige Blazer', price: 3299, originalPrice: null, categorySlug: 'womens-clothing', isFeatured: false, isNew: false, stock: 55, sku: 'WOM-002', img: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800', desc: 'Structured oversized blazer in beige.' },
    { name: 'Gucci GG Marmont Leather Belt', price: 28500, originalPrice: 32000, categorySlug: 'womens-clothing', isFeatured: true, isNew: false, stock: 12, sku: 'WOM-003', img: 'https://images.unsplash.com/photo-1627885721855-528ea56fdbcf?w=800', desc: 'Authentic Gucci GG Marmont belt in black leather.' },

    // Mobile Phones
    { name: 'Apple iPhone 15 Pro Max', price: 159900, originalPrice: 169900, categorySlug: 'mobile-phones', isFeatured: true, isNew: true, stock: 25, sku: 'MOB-001', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', desc: 'Titanium design with A17 Pro chip and 48MP camera system.' },
    { name: 'Samsung Galaxy S24 Ultra', price: 129999, originalPrice: 139999, categorySlug: 'mobile-phones', isFeatured: true, isNew: true, stock: 30, sku: 'MOB-002', img: 'https://images.unsplash.com/photo-1598327105666-5b89351cb31b?w=800', desc: 'Galaxy AI is here. S Pen included, 200MP camera.' },
    { name: 'Google Pixel 8 Pro', price: 106999, originalPrice: null, categorySlug: 'mobile-phones', isFeatured: false, isNew: true, stock: 40, sku: 'MOB-003', img: 'https://images.unsplash.com/photo-1598327105666-5b89351cb31b?w=800', desc: 'The most capable Pixel yet, powered by Google Tensor G3.' },
    { name: 'OnePlus 12 5G', price: 64999, originalPrice: 69999, categorySlug: 'mobile-phones', isFeatured: false, isNew: false, stock: 60, sku: 'MOB-004', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', desc: 'Hasselblad Camera for Mobile and Snapdragon 8 Gen 3.' },

    // Laptops
    { name: 'Apple MacBook Pro 16" (M3 Max)', price: 349900, originalPrice: null, categorySlug: 'laptops', isFeatured: true, isNew: true, stock: 10, sku: 'LAP-001', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', desc: 'Mind-blowing performance with the M3 Max chip and Liquid Retina XDR display.' },
    { name: 'Dell XPS 15', price: 185000, originalPrice: 195000, categorySlug: 'laptops', isFeatured: false, isNew: false, stock: 18, sku: 'LAP-002', img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', desc: 'Stunning 4K OLED display and Intel Core i9 processor.' },
    { name: 'ASUS ROG Zephyrus G14', price: 145999, originalPrice: 155999, categorySlug: 'laptops', isFeatured: true, isNew: false, stock: 22, sku: 'LAP-003', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800', desc: 'High performance gaming laptop with RTX 4070 in a 14-inch chassis.' },

    // Headphones
    { name: 'Sony WH-1000XM5 ANC Headphones', price: 29990, originalPrice: 34990, categorySlug: 'headphones', isFeatured: true, isNew: false, stock: 45, sku: 'AUD-001', img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800', desc: 'Industry-leading noise cancellation and exceptional sound quality.' },
    { name: 'Apple AirPods Pro (2nd Gen)', price: 24900, originalPrice: null, categorySlug: 'headphones', isFeatured: true, isNew: true, stock: 85, sku: 'AUD-002', img: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800', desc: 'True wireless earbuds with up to 2x more Active Noise Cancellation.' },
    { name: 'Bose QuietComfort Ultra', price: 35900, originalPrice: null, categorySlug: 'headphones', isFeatured: false, isNew: true, stock: 30, sku: 'AUD-003', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', desc: 'Spatial audio and world-class noise cancellation from Bose.' },

    // Footwear
    { name: 'Nike Air Jordan 1 Retro High', price: 16995, originalPrice: null, categorySlug: 'footwear', isFeatured: true, isNew: true, stock: 50, sku: 'FTW-001', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', desc: 'The iconic Air Jordan 1 in classic Chicago colorway.' },
    { name: 'Adidas Ultraboost Light', price: 15999, originalPrice: 18999, categorySlug: 'footwear', isFeatured: false, isNew: false, stock: 65, sku: 'FTW-002', img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800', desc: 'The lightest Ultraboost ever made for endless energy.' },
    { name: 'New Balance 550', price: 11999, originalPrice: null, categorySlug: 'footwear', isFeatured: true, isNew: false, stock: 40, sku: 'FTW-003', img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800', desc: 'Retro basketball silhouette with premium leather upper.' },
    { name: 'Dr. Martens 1460 Leather Boots', price: 14500, originalPrice: null, categorySlug: 'footwear', isFeatured: false, isNew: false, stock: 35, sku: 'FTW-004', img: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800', desc: 'Classic 8-eye boot crafted from smooth leather.' },

    // Watches
    { name: 'Rolex Submariner Date', price: 950000, originalPrice: null, categorySlug: 'watches', isFeatured: true, isNew: true, stock: 2, sku: 'WTC-001', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', desc: 'Oyster, 41 mm, Oystersteel and yellow gold.' },
    { name: 'Apple Watch Ultra 2', price: 89900, originalPrice: null, categorySlug: 'watches', isFeatured: true, isNew: true, stock: 25, sku: 'WTC-002', img: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800', desc: 'The most rugged and capable Apple Watch. Titanium case.' },
    { name: 'Seiko 5 Sports Automatic', price: 24900, originalPrice: 28900, categorySlug: 'watches', isFeatured: false, isNew: false, stock: 40, sku: 'WTC-003', img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800', desc: 'Reliable automatic mechanical movement with day-date display.' },

    // Home Appliances
    { name: 'Dyson V15 Detect Absolute', price: 65900, originalPrice: 74900, categorySlug: 'home-appliances', isFeatured: true, isNew: true, stock: 15, sku: 'HOM-001', img: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800', desc: 'Laser reveals microscopic dust. Powerful and intelligent cordless vacuum.' },
    { name: 'LG 65" OLED evo C4 TV', price: 189999, originalPrice: 249999, categorySlug: 'home-appliances', isFeatured: true, isNew: false, stock: 12, sku: 'HOM-002', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', desc: 'Brilliant picture quality with infinite contrast and 144Hz refresh rate.' },
    { name: 'Nespresso Vertuo Next', price: 18999, originalPrice: 21999, categorySlug: 'home-appliances', isFeatured: false, isNew: false, stock: 35, sku: 'HOM-003', img: 'https://images.unsplash.com/photo-1517701550927-30cfcb070387?w=800', desc: 'Brews a wide range of coffees at the touch of a button.' },
  ];

  for (const item of productsList) {
    const categoryId = categoriesMap.get(item.categorySlug)!;
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug,
        description: item.desc,
        price: item.price,
        originalPrice: item.originalPrice,
        stock: item.stock,
        sku: item.sku,
        isFeatured: item.isFeatured,
        isNew: item.isNew,
        rating: 4.5 + Math.round(Math.random() * 5) / 10,
        reviewCount: Math.floor(10 + Math.random() * 40),
        categoryId,
        images: {
          create: [
            { url: item.img, isPrimary: true },
            { url: item.img.replace('w=800', 'w=801'), isPrimary: false },
          ],
        },
      },
    });

    await prisma.inventoryLog.create({
      data: {
        productId: product.id,
        changeType: 'RESTOCK',
        quantityChange: item.stock,
        previousStock: 0,
        newStock: item.stock,
        reason: 'Initial catalog seed',
        createdBy: admin.id,
      },
    });
  }

  console.log(`✅ ${productsList.length} Products created`);

  // Create sample orders for customers
  const sampleProducts = await prisma.product.findMany({ take: 3 });

  if (sampleProducts.length >= 2) {
    await prisma.order.create({
      data: {
        orderNumber: 'VL-202608-1001',
        userId: customer1.id,
        customerName: customer1.name,
        customerEmail: customer1.email,
        shippingAddress: JSON.stringify({
          addressLine1: 'Level 4, Velora HQ',
          city: 'Mumbai',
          state: 'MH',
          postalCode: '400001',
          country: 'India',
        }),
        totalAmount: sampleProducts[0].price * 1 + sampleProducts[1].price * 1,
        status: 'DELIVERED',
        paymentMethod: 'stripe',
        paymentStatus: 'paid',
        stripePaymentIntentId: 'pi_test_seed_001',
        items: {
          create: [
            { productId: sampleProducts[0].id, price: sampleProducts[0].price, quantity: 1 },
            { productId: sampleProducts[1].id, price: sampleProducts[1].price, quantity: 1 },
          ],
        },
      },
    });
  }

  console.log('✅ Sample orders created');
  console.log('🚀 VELORA Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
