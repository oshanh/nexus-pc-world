const dotenv = require('dotenv');
const connectDB = require('../config/mongodb');
const Product = require('../models/Product');

dotenv.config();

const products = [
  {
    name: 'Asus TUF A16',
    category: 'Laptop',
    subCategory: 'Gaming Lap',
    shortDescription: 'Top-tier performance with RTX 4070 and Ryzen 9 processor.',
    description: 'The Helios Prime is our flagship gaming desktop, engineered for the enthusiast who demands nothing but the best. Experience breathtaking 4K gaming, seamless streaming, and lightning-fast content creation, all powered by the latest generation of components.',
    price: 'Rs 1,049,700',
    stock: 5,
    imageUrls: [
        'https://dlcdnwebimgs.asus.com/gain/8b25250f-bf55-425f-93bd-b5d8e2744b3e/',
        'https://dlcdnwebimgs.asus.com/gain/e411d52d-eede-4cce-aaec-b2740146271d/',
        'https://dlcdnwebimgs.asus.com/gain/8a6388fe-5564-490a-985e-9cc41c6f9a79/',
        'https://dlcdnwebimgs.asus.com/gain/f2a9834c-500a-4a26-939c-0fee52f24936/'
    ],
    specs: [
        { name: 'CPU', value: ' Ryzen 9 8945H' },
        { name: 'GPU', value: 'NVIDIA GeForce RTX 4070' },
        { name: 'RAM', value: '16GB DDR5 5600MHz' },
        { name: 'Storage', value: '512Gb NVMe SSD' },
        { name: 'OS', value: 'Windows 11 Home' },
   
    ],
  },
  {
    name: 'Lenovo LOQ',
    category: 'Laptop',
    subCategory: 'Middle-End Lap',
    shortDescription: 'Push the limits with expertly overclocked components.',
    description: 'Built for those who live on the edge, the Orion X-Treme comes professionally overclocked and stress-tested for maximum stable performance. Squeeze every last frame out of your favorite titles with this finely-tuned beast.',
    price: 'Rs 839,700',
    stock: 8,
    imageUrls: [
        'https://p1-ofp.static.pub//fes/cms/2024/05/20/2adx3swjr6461psulmwqrx6l0bkaab759083.png',
        'https://p4-ofp.static.pub/ShareResource/na/products/legion/560x450/lenovo-loq-15-v3.png',
        'https://suhadha.lk/wp-content/uploads/2025/04/laptop-i7-lenovo-loq-15irh8-82xv007aax-13th-gen-16gb-ram-512gb-nvme-156-144hz-vga-6gb.png-1.webp',
        'https://p4-ofp.static.pub/ShareResource/na/products/loq/lenovo-loq-16inch-amd-white-backlit-03.png'
    ],
    specs: [
        { name: 'CPU', value: 'Intel Core i7' },
        { name: 'GPU', value: 'NVIDIA GeForce RTX 4050' },
        { name: 'RAM', value: '16GB DDR5 6200MHz' },
        { name: 'Storage', value: '2TB NVMe SSD' },
        { name: 'Display', value: '240mm AIO Liquid Cooler' },
        { name: 'OS', value: 'Windows 11 Home' },
    ],
  },
  {
    name: 'NVIDIA GeForce RTX 4070',
    category: 'Accessory',
    subCategory: 'VGA',
    shortDescription: 'High-performance 1440p gaming with DLSS 3 technology.',
    description: 'The GeForce RTX 4070 is a quantum leap in performance for 1440p gaming. Powered by the NVIDIA Ada Lovelace architecture, it brings new levels of visual fidelity with AI-powered DLSS 3 and full ray tracing capabilities for the most immersive worlds.',
    price: 'Rs 219,700',
    stock: 15,
    imageUrls: [
        'https://gamersnexus.net/u/2024-01/vlcsnap-2024-01-25-16h12m35s203.jpg',
        'https://asset.msi.com/resize/image/global/product/product_16812916502ca0a14b6dfb5319c99da1d4ffb3a8ad.png62405b38c58fe0f07fcef2367d8a9ba1/1024.png',
        'https://asset.msi.com/resize/image/global/product/product_167273450141f27b1624d8e599cc1b00b918e4ff34.png62405b38c58fe0f07fcef2367d8a9ba1/1024.png',
        'https://asset.msi.com/resize/image/global/product/product_170470382559f1f767464fa75e443c3140418a3427.png62405b38c58fe0f07fcef2367d8a9ba1/1024.png'
    ],
    specs: [
        { name: 'CUDA Cores', value: '5888' },
        { name: 'Boost Clock', value: '2.48 GHz' },
        { name: 'Memory', value: '12 GB GDDR6X' },
        { name: 'Memory Interface', value: '192-bit' },
        { name: 'Outputs', value: 'HDMI 2.1, 3x DisplayPort 1.4a' },
    ],
  },
  {
    name: 'i5 12th Gen Gaming Desktop',
    category: 'Desktop',
    subCategory: 'High-End PC',
    shortDescription: 'Desktop-grade power in a sleek, portable design.',
    description: 'Who says you can\'t take it with you? The Blade Pro packs the punch of a full-sized desktop into a stunning, thin-and-light chassis. Its high-refresh-rate QHD display brings games to life wherever you are.',
    price: 'Rs 749,700',
    stock: 3,
    imageUrls: [
        'https://static.vecteezy.com/system/resources/thumbnails/054/720/484/small/gaming-pc-on-white-background-on-transparent-background-png.png',
        'https://static.vecteezy.com/system/resources/thumbnails/053/348/112/small/gaming-pc-with-rgb-blue-led-lights-isolated-on-transparent-background-png.png',
        'https://assets.corsair.com/image/upload/f_auto,q_auto/products/Systems/a7500/CS-9050135-NA/CORSAIR_VENGEANCE_a7500_NAUTILUS_RENDER_01.png',
        'https://static.vecteezy.com/system/resources/thumbnails/048/384/219/small/a-computer-case-with-purple-lights-on-it-on-transparent-background-png.png'
    ],
    specs: [
        { name: 'CPU', value: 'Intel Core i5-12th Gen' },
        { name: 'GPU', value: 'NVIDIA GeForce RTX 4070'},
        { name: 'RAM', value: '32GB DDR5' },
        { name: 'Liquid Cooling', value: 'Master Liquid 360L Core White' },
        { name: 'Storage', value: '256GB NVMe SSD + 2Tb HDD' },
        { name: 'OS', value: 'Windows 11 Home' },
    ],
  },
  {
    name: 'MSI Thing',
    category: 'Laptop',
    subCategory: 'Gaming Lap',
    shortDescription: 'Thin, light, and powerful for gaming on the go.',
    description: 'The StealthBook Ultra is the ultimate travel companion for the discerning gamer. It combines a vibrant OLED display with an efficient yet powerful component selection to deliver an incredible gaming experience in an unbelievably portable package.',
    price: 'Rs 569,700',
    stock: 12,
    imageUrls: [
        'https://my-store.msi.com/cdn/shop/files/Thin15B12UX_3.png?v=1749804463&width=1214',
        'https://pc-samenstellen.nl/files/file_system/file/file/9048/05.%20MSI%20Thin%2015%20B12UC-1253NL.png',
        'https://storage-asset.msi.com/global/picture/product/product_1713258973d44808928894d813ac11d5dab9009029.png',
        'https://my-store.msi.com/cdn/shop/files/Thin15B12UX_1.png?v=1749804463&width=1000'
    ],
    specs: [
        { name: 'CPU', value: 'AMD Ryzen 9 8945HS' },
        { name: 'GPU', value: 'NVIDIA GeForce RTX 4070 Laptop' },
        { name: 'RAM', value: '16GB DDR5' },
        { name: 'Display', value: '14" OLED (2880x1800) 120Hz' },
        { name: 'Storage', 'value': '1TB NVMe SSD' },
        { name: 'OS', value: 'Windows 11 Home' },
    ],
  },
  {
    name: 'Redragon K633CGO Mechanical Gaming Keyboard',
    category: 'Accessory',
    subCategory: 'Keyboard',
    shortDescription: 'Mechanical keys with customizable per-key RGB lighting.',
    description: 'Gain a competitive edge with the CyberMech keyboard. Featuring tactile mechanical switches for lightning-fast response, a durable aluminum frame, and brilliant, fully customizable per-key RGB lighting to match your setup.',
    price: 'Rs 44,700',
    stock: 25,
    imageUrls: [
        'https://redragon.com/cdn/shop/files/RedragonK633CGO-RGB68-KeyCompactMechanicalGamingKeyboard_1_1_-Photoroom.png?v=1725356340',
        'https://redragon.com/cdn/shop/files/RedragonK633CGO-RGB68-KeyCompactMechanicalGamingKeyboard_4_1_-Photoroom.png?v=1725356340&width=1600',
        'https://www.redragonzone.com/cdn/shop/products/RedragonK644SE65_3-ModeWirelessRGBGamingKeyboard_1_450x450.png?v=1678159260',
        'https://redragon.com/cdn/shop/files/K633CGO-RGB-GermanLayout_5.png?v=1742376296&width=800'
    ],
    specs: [
        { name: 'Switch Type', value: 'Tactile Mechanical' },
        { name: 'Layout', value: 'Full-size with Numpad' },
        { name: 'Backlighting', value: 'Per-key RGB Chroma' },
        { name: 'Connectivity', value: 'Wired USB-C' },
        { name: 'Features', value: 'Programmable Macro Keys' }
    ],
  },
  {
    name: 'BAVIN HB-BH62 RGB Wired Gaming Over-Ear Headphones',
    category: 'Accessory',
    subCategory: 'Headset',
    shortDescription: 'Crystal-clear 7.1 surround sound with zero lag.',
    description: 'Immerse yourself in the game with the Void Wireless Headset. Pinpoint enemy locations with virtual 7.1 surround sound, communicate clearly with a broadcast-quality microphone, and enjoy lag-free audio for hours on a single charge.',
    price: 'Rs 38,700',
    stock: 30,
    imageUrls: [
        'https://bavin.ph/cdn/shop/files/4_52847082-21e4-426d-9e8f-82ccba991286.png?v=1753076193&width=493',
        'https://bavin.ph/cdn/shop/files/4_16703eea-3824-4806-871a-359415be2999.png?v=1753076193&width=493',
        'https://bavin.ph/cdn/shop/files/5_64182dba-0ad0-46d7-9797-f0ea323f7d07.png?v=1753076193&width=493',
        'https://bavin.ph/cdn/shop/files/7_be9bbff2-197b-492e-807b-11bc8ddcf717.png?v=1753076193&width=493'
    ],
    specs: [
        { name: 'Audio', value: '7.1 Surround Sound' },
        { name: 'Connectivity', value: '2.4GHz Wireless / 3.5mm' },
        { name: 'Microphone', value: 'Noise-cancelling, flip-to-mute' },
        { name: 'Battery Life', value: 'Up to 20 hours' },
        { name: 'Compatibility', value: 'PC, PS5, Switch' }
    ],
  },
  {
    name: 'Meetion M990 Gaming Mouse',
    category: 'Accessory',
    subCategory: 'Mouse',
    shortDescription: 'Lightweight design with a high-precision 25K DPI sensor.',
    description: 'Experience flawless tracking and feather-light control with the Photon Pro. Its ergonomic, aultra-lightweight design reduces fatigue, while the state-of-the-art optical sensor ensures every movement translates to perfect in-game precision.',
    price: 'Rs 26,700',
    stock: 45,
    imageUrls: [
        'https://www.meetion.com/lifisher-1658459652651/jpg80-t3-scale100.webp',
        'https://www.meetion.com/lifisher-1658459694707/jpg80-t3-scale100.webp',
        'https://www.meetion.com/lifisher-1660726549301.png',
        'https://img.yfisher.com/1658460162347.png'
    ],
    specs: [
        { name: 'Sensor', value: '25,600 DPI Optical' },
        { name: 'Weight', value: '63 grams' },
        { name: 'Buttons', value: '6 Programmable Buttons' },
        { name: 'Connectivity', value: 'Wired, low-drag cable' },
        { name: 'Feet', value: '100% PTFE' }
    ],
  },
  {
    name: 'Hp Computer',
    category: 'Desktop',
    subCategory: 'Normal PC',
    shortDescription: 'Your perfect entry into high-FPS 1080p gaming.',
    description: 'The Vanguard is the ideal starting point for serious PC gaming. It delivers excellent performance in the most popular esports and AAA titles at 1080p resolution, with a clear upgrade path for the future.',
    price: 'Rs 399,700',
    stock: 10,
    imageUrls: [
        'https://5.imimg.com/data5/SELLER/Default/2025/8/540230892/FT/QT/YV/251969637/desktop-pc-png-pic-background-png-500x500.png',
        'https://picsum.photos/seed/hpcomp-2/600/400',
        'https://picsum.photos/seed/hpcomp-3/600/400',
        'https://picsum.photos/seed/hpcomp-4/600/400'
    ],
    specs: [
        { name: 'CPU', value: 'Intel Core i5-14400F' },
        { name: 'GPU', value: 'NVIDIA GeForce RTX 4060' },
        { name: 'RAM', value: '16GB DDR5 5200MHz' },
        { name: 'Storage', value: '1TB NVMe SSD' },
        { name: 'Cooling', value: 'Stock Air Cooler' },
        { name: 'OS', value: 'Windows 11 Home' },
    ],
  },
  {
    name: 'Asus Tuf 23.8 180Hz ',
    category: 'Accessory',
    subCategory: 'Monitors',
    shortDescription: 'Dominate the battlefield with smooth 1440p performance.',
    description: 'Step up your game with the Aegis Sentinel. This build is perfectly balanced for high-refresh-rate gaming at 1440p, providing a competitive edge with stunning visual fidelity and responsive gameplay.',
    price: 'Rs 66,500',
    stock: 18,
    imageUrls: [
        'https://cdn.sanity.io/images/yqd1zell/production/f384a62bb0e81f2fb3a0e3e2e8db563207f33ec6-500x500.png',
        'https://cdn.sanity.io/images/yqd1zell/production/50f1e775bdcdf29885ab08d1381a1c41c8f89a0d-500x500.png',
        'https://cdn.sanity.io/images/yqd1zell/production/c1214cc1fbe16357380933e87db4feef47551cbd-500x500.png',
        'https://cdn.sanity.io/images/yqd1zell/production/e45bee02dd1be5d705a6c304d03405d0f968d4ab-500x500.png'
    ],
    specs: [
        { name: 'Resolution', value: '2560 x 1440 (QHD)' },
        { name: 'Refresh Rate', value: '165Hz' },
        { name: 'Panel Type', value: 'IPS' },
        { name: 'Response Time', value: '1ms (GtG)' },
        { name: 'HDR', value: 'HDR10 Support' }
    ]
  }
];

const seedDB = async () => {
  try {
    await connectDB();

    // Upsert products: do not delete existing products; avoid duplicates by product name
    const ops = products.map(p => ({
      updateOne: {
        filter: { name: p.name },
        update: { $setOnInsert: p },
        upsert: true
      }
    }));

    const result = await Product.bulkWrite(ops);
    console.log(`Products upsert result: inserted ${result.upsertedCount || 0}, modified ${result.modifiedCount || 0}, matched ${result.matchedCount || 0}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
