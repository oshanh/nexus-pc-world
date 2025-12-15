
import type { Product } from './types';

export const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Custom Builds', href: '/custom-build' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Wishlist', href: '/wishlist', icon: 'wishlist' },
  { name: 'Cart', href: '/cart', icon: 'cart' },
];

export const PROMOTION_IMAGES = [
  { src: 'https://img.freepik.com/premium-psd/gaming-computer-sale-promotion-social-media-post_931687-137.jpg', alt: 'Promotion: Up to 30% off on select laptops.' },
  { src: 'https://img.freepik.com/premium-psd/black-friday-sale-post_252779-886.jpg?semt=ais_hybrid&w=740&q=80', alt: 'Promotion: New arrivals of high-end gaming desktops.' },
  { src: 'https://img.freepik.com/premium-vector/red-gaming-pc-computer-sale-promotion-social-media-post_252779-444.jpg', alt: 'Promotion: Free worldwide shipping on all orders.' },
  { src: 'https://img.freepik.com/premium-vector/social-media-post-promoting-sale-gaming-pc-computer_1113360-89.jpg', alt: 'Promotion: Special bundles on PC components.' },
  { src: 'https://img.pikbest.com/origin/06/28/85/14YpIkbEsTyrA.jpg!bw700', alt: 'Promotion: Customize your dream PC with our AI builder.' },
];


export const CPU_MODELS = [
    { name: "Intel Core i5-14600K", socket: "LGA 1700" },
    { name: "Intel Core i7-14700K", socket: "LGA 1700" },
    { name: "Intel Core i9-14900K", socket: "LGA 1700" },
    { name: "AMD Ryzen 5 7600X", socket: "AM5" },
    { name: "AMD Ryzen 7 7800X3D", socket: "AM5" },
    { name: "AMD Ryzen 9 7950X", socket: "AM5" },
];

export const MOTHERBOARD_MODELS = [
    // LGA 1700
    { name: "MSI PRO Z790-A WIFI", socket: "LGA 1700", chipset: "Z790" },
    { name: "Gigabyte B760M AORUS ELITE AX", socket: "LGA 1700", chipset: "B760" },
    { name: "ASRock Z790 Steel Legend WiFi", socket: "LGA 1700", chipset: "Z790" },
    { name: "ASUS ROG Strix B760-I Gaming WiFi", socket: "LGA 1700", chipset: "B760" },
    // AM5
    { name: "Gigabyte B650 AORUS ELITE AX", socket: "AM5", chipset: "B650" },
    { name: "ASRock X670E Steel Legend", socket: "AM5", chipset: "X670E" },
    { name: "MSI MAG B650 TOMAHAWK WIFI", socket: "AM5", chipset: "B650" },
    { name: "ASUS ROG STRIX X670E-F GAMING WIFI", socket: "AM5", chipset: "X670E" },
];

export const GPU_MODELS = [
    "NVIDIA GeForce RTX 4060",
    "NVIDIA GeForce RTX 4070 Super",
    "NVIDIA GeForce RTX 4080 Super",
    "NVIDIA GeForce RTX 4090",
    "AMD Radeon RX 7700 XT",
    "AMD Radeon RX 7800 XT",
    "AMD Radeon RX 7900 XTX",
];

export const COOLER_MODELS = [
    "Thermalright Phantom Spirit 120 SE (Air)",
    "Noctua NH-D15 (Air)",
    "Arctic Liquid Freezer III 240 (AIO)",
    "Lian Li Galahad II 360 (AIO)",
];

export const CASE_MODELS = [
    "Fractal Design North (Minimalist)",
    "NZXT H5 Flow (Minimalist)",
    "Lian Li Lancool 216 (RGB Airflow)",
    "Hyte Y60 (RGB Airflow)",
    "Lian Li O11 Vision (Showcase)",
    "NZXT H9 Elite (Showcase)",
];


export const PRODUCTS = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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
    id: '5',
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
    id: '6',
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
    id: '7',
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
    id: '8',
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
    id: '9',
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
    id: '10',
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
        { name: 'Display', value: '23.8 inches' },
        { name: 'Resoution', value: '1920x1080 (Full HD)' },
        { name: 'Refresh rate', value: '180Hz' },
         { name: 'Ports', value: 'Display Port, HDMI Port' },
    ],
  },
  {
    id: 11,
    name: 'CORSAIR VENGEANCE RGB DDR5 RAM 32GB (2x16GB) 6400MHz',
    category: 'Accessory',
    subCategory: 'Ram',
    shortDescription: 'Sleek, lightweight, and perfect for everyday productivity.',
    description: 'CORSAIR VENGEANCE RGB DDR5 RAM 32GB (2x16GB) 6400MHz',
    price: 'Rs 33,000',
    stock: 40,
    imageUrls: [
        'https://m.media-amazon.com/images/I/61D2DDpDITL._AC_SL1500_.jpg',
    ],
    specs: [
        
        { name: 'RAM', value: '32GB DDR5 (16x2)' },
    ],
  },
  {
    id: 12,
    name: 'Intel Core i9-14900K Processor',
    category: 'Accessory',
    subCategory: 'Cpu',
    shortDescription: 'The ultimate desktop processor for gaming and creation.',
    description: 'Experience unparalleled performance with the Intel Core i9-14900K. With 24 cores, 32 threads, and clock speeds up to 6.0 GHz, it\'s engineered to handle the most demanding games and creative workloads without breaking a sweat.',
    price: 'Rs 199,700',
    stock: 6,
    imageUrls: [
        'https://i0.wp.com/cyberdeals.lk/wp-content/uploads/2024/09/2-94-8.jpg?fit=600%2C600&ssl=1',
        'https://cdn-reichelt.de/bilder/web/artikel_ws/E910%2FINTEL_14TH_04.jpg?type=Product&',
        'https://cdn.mos.cms.futurecdn.net/v2/t:0,l:562,cw:1500,ch:1125,q:80,w:1500/3Yoky7L8hgBx4gXBfBo9YF.jpg',
        'https://s.alicdn.com/@sc04/kf/H7fb9cbda3e4f47bf930114f3a6f36142O.png'
    ],
    specs: [
        { name: 'Cores', value: '24 (8P + 16E)' },
        { name: 'Threads', value: '32' },
        { name: 'Max Turbo Frequency', value: '6.0 GHz' },
        { name: 'Cache', value: '36 MB Intel Smart Cache' },
        { name: 'Socket', value: 'LGA 1700' },
    ],
  },
  {
    id: 13,
    name: 'G.Skill Trident Z5 RGB 32GB Kit',
    category: 'Accessory',
    subCategory: 'Ram',
    shortDescription: 'Blazing fast DDR5 memory with stunning RGB lighting.',
    description: 'Elevate your system\'s performance and aesthetics with the G.Skill Trident Z5 RGB series. This 32GB (2x16GB) kit delivers extreme DDR5-6000 speeds, perfect for high-end gaming rigs and workstations.',
    price: 'Rs 79,700',
    stock: 22,
    imageUrls: [
        'https://picsum.photos/seed/tridentz5/600/400',
        'https://picsum.photos/seed/tridentz5-2/600/400',
        'https://picsum.photos/seed/tridentz5-3/600/400',
        'https://picsum.photos/seed/tridentz5-4/600/400'
    ],
    specs: [
        { name: 'Type', value: 'DDR5' },
        { name: 'Capacity', value: '32GB (2 x 16GB)' },
        { name: 'Speed', value: '6000MHz' },
        { name: 'CAS Latency', value: 'CL30' },
        { name: 'Lighting', value: 'RGB' },
    ],
  },
  {
    id: 14,
    name: 'Samsung 990 Pro 1TB NVMe SSD',
    category: 'Accessory',
    subCategory: 'Storage',
    shortDescription: 'Experience lightning-fast load times with this top-tier SSD.',
    description: 'The Samsung 990 Pro offers the ultimate in storage performance. With sequential read/write speeds up to 7,450/6,900 MB/s, this 2TB NVMe M.2 SSD dramatically reduces load times in games and speeds up file transfers for content creators.',
    price: 'Rs 69,700',
    stock: 28,
    imageUrls: [
        'https://redtech.lk/wp-content/uploads/2023/09/Order-Now-1TB-SAMSUNG-990-PRO-PCIe-4.0-NVME-SSD.png',
        'https://cdn.sanity.io/images/yqd1zell/production/ac3b6d2e76e2e440eb74ba7d1c2616ba19304658-512x512.png',
        'https://sm.pcmag.com/pcmag_au/review/s/samsung-ss/samsung-ssd-980-pro_4v9c.jpg',
        'https://m.media-amazon.com/images/I/71bvF9MNa4S._AC_UF1000,1000_QL80_.jpg'
    ],
    specs: [
        { name: 'Interface', value: 'PCIe 4.0 NVMe' },
        { name: 'Capacity', value: '2TB' },
        { name: 'Read Speed', value: 'Up to 7,450 MB/s' },
        { name: 'Write Speed', value: 'Up to 6,900 MB/s' },
        { name: 'Form Factor', value: 'M.2 (2280)' },
    ],
  },
  {
    id: 15,
    name: 'NVIDIA GeForce RTX 4080 Super',
    category: 'Accessory',
    subCategory: 'VGA',
    shortDescription: 'More cores and faster memory for supercharged gaming.',
    description: 'The GeForce RTX 4080 SUPER is the ultimate choice for 4K gaming and demanding creative applications. Powered by the NVIDIA Ada Lovelace architecture, it delivers a quantum leap in performance with AI-powered DLSS 3 and lifelike virtual worlds with full ray tracing.',
    price: 'Rs 449,700',
    stock: 4,
    imageUrls: [
        'https://picsum.photos/seed/rtx4080s/600/400',
        'https://picsum.photos/seed/rtx4080s-2/600/400',
        'https://picsum.photos/seed/rtx4080s-3/600/400',
        'https://picsum.photos/seed/rtx4080s-4/600/400'
    ],
    specs: [
        { name: 'CUDA Cores', value: '10240' },
        { name: 'Boost Clock', value: '2.55 GHz' },
        { name: 'Memory', value: '16 GB GDDR6X' },
        { name: 'Memory Interface', value: '256-bit' },
        { name: 'Outputs', value: 'HDMI 2.1, 3x DisplayPort 1.4a' },
    ],
  },
];
