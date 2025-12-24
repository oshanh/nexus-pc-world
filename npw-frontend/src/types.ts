
export interface Product {
  id: string;
  code?: string;
  name: string;
  category: 'Desktop' | 'Laptop' | 'Accessory';
  subCategory?: 'Normal PC' | 'Middle-End PC' | 'High-End PC' | 'Normal Lap' | 'Middle-End Lap' | 'Gaming Lap' | 'Cpu' | 'Ram' | 'Storage' | 'VGA' | 'Keyboard' | 'Mouse' | 'Headset' | 'Monitors' | 'Mouse Pads' | 'HDMI Cables';
  shortDescription: string;
  description: string;
  price: number;
  stock: number;
  imageUrls: string[];
  specs: { name: string; value: string; }[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface BuildComponent {
    name: string;
    reason: string;
    price?: string;
}

export interface BuildRecommendation {
    cpu: BuildComponent;
    gpu: BuildComponent;
    ram: BuildComponent;
    storage: BuildComponent;
    motherboard: BuildComponent;
    psu: BuildComponent;
    case: BuildComponent;
    cooler: BuildComponent;
    summary: string;
}

export interface BuildPreferences {
    cpuModel: string;
    gpuModel: string;
    motherboardModel: string;
    ramCapacity: string;
    caseModel: string;
    coolerModel: string;
}

export interface StockInRecord {
  date: string;
  quantity: number;
  buyingUnitPrice?: number;
  sellingUnitPrice: number;
}

export interface StockInPayload {
  date?: string;
  quantity: number;
  buyingUnitPrice?: number;
  sellingUnitPrice: number;
}
