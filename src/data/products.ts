// Single source of product facts for the Hardware pages, homepage and docs.
// Sources (checked 2026-10-01): inhandgo.com product pages, inhand.com product
// pages, github.com/inhandnet/Mo62A README. Update here, never in page code.

export type Spec = {label: string; value: string};
export type SpecGroup = {title: string; rows: Spec[]};
export type Variant = {sku: string; ram: string; price: number};
export type KeySpec = {icon: string; value: string; label: string};
export type Feature = {title: string; subtitle: string; body: string; image: string; points?: string[]};

export type Product = {
  id: 'mo-62a' | 'mo-68a';
  name: string;
  tops: number;
  tagline: string;
  summary: string;
  tier: string;
  image: string;
  shopUrl: string;
  productPageUrl: string;
  resourcesUrl: string;
  githubUrl: string | null;
  datasheetUrl: string | null;
  variants: Variant[];
  highlights: string[];
  keySpecs: KeySpec[];
  features: Feature[];
  specs: SpecGroup[];
};

const SHOP = 'https://inhandgo.com/products';

export const products: Product[] = [
  {
    id: 'mo-62a',
    name: 'Mo 62A',
    tops: 2,
    tagline: 'Edge AI, where the camera is.',
    summary:
      'TI AM62A vision processor with a C7x DSP and matrix accelerator, an on-chip ISP and an 85 × 56 mm board with a 40-pin header. Built for single-camera, low-power vision AI.',
    tier: 'Entry · single camera · low power',
    image: '/img/boards/mo-62a.png',
    shopUrl: `${SHOP}/mo-62a-single-board-computer-2-tops-open-source-ai-sbc-for-lightweight-edge-inference`,
    productPageUrl: 'https://www.inhand.com/en/products/ai-edge-computers/mo-62a',
    resourcesUrl:
      'https://www.inhand.com/en/resources-center/#/IndustrialDigitalization/AISingleBoardComputer/MO62A',
    githubUrl: 'https://github.com/inhandnet/Mo62A',
    // Obtain the English datasheet through resourcesUrl; do not embed an
    // expiring signed download URL or fall back to the superseded PDF.
    datasheetUrl: null,
    variants: [
      {sku: 'Mo-62A-2G', ram: '2 GB', price: 169},
      {sku: 'Mo-62A-4G', ram: '4 GB', price: 249},
      {sku: 'Mo-62A-8G', ram: '8 GB', price: 339},
    ],
    highlights: [
      '2 TOPS C7x DSP + MMA deep-learning accelerator',
      'On-chip ISP + VPAC: WDR, lens distortion correction, RGB-IR',
      'Wi-Fi 5 and BLE 4.2 on board',
      '40-pin HAT-compatible header, 85 × 56 mm',
    ],
    keySpecs: [
      {icon: 'SoC', value: 'TI AM62A74', label: '4 × Cortex-A53 @ 1.4 GHz'},
      {icon: 'NPU', value: '2 TOPS', label: 'C7x DSP + MMA'},
      {icon: 'ISP', value: 'On-chip ISP', label: 'WDR · LDC · RGB-IR'},
      {icon: 'RAM', value: '2 / 4 / 8 GB', label: 'LPDDR4'},
      {icon: 'Wi-Fi', value: 'Wi-Fi 5 / BLE 4.2', label: 'Dual-band, on board'},
    ],
    features: [
      {
        title: '2 TOPS of edge AI, where the camera is',
        subtitle: 'Detection, classification and segmentation run on the board — no cloud round-trips, no bandwidth bills.',
        body: 'A C7x DSP with a Matrix Multiply Accelerator runs your models on-device. TI TIDL deploys existing TFLite and ONNX models, and the image ships with 11 pre-compiled models ready to try.',
        image: '/img/products/mo-62a/edge-ai.jpg',
      },
      {
        title: 'A vision processor, not just an SBC',
        subtitle: 'The on-chip ISP fixes the frame before your model sees it.',
        body: 'Backlit entrances, high-contrast sites and low-light scenes are handled in silicon by the ISP and VPAC, lifting real-world detection accuracy.',
        image: '/img/products/mo-62a/isp.jpg',
        points: ['Hardware WDR', 'Lens distortion correction', 'RGB-IR support'],
      },
      {
        title: '85 × 56 mm form factor, industrial AI core',
        subtitle: '85 × 56 mm with a 40-pin HAT-compatible header.',
        body: 'A 40-pin header exposes 3.3 V signals for expansion. Verify each HAT’s pin mapping, power needs and driver support; a similar footprint does not guarantee electrical or enclosure compatibility.',
        image: '/img/products/mo-62a/form-factor.jpg',
      },
      {
        title: 'Built for developers',
        subtitle: 'Debian, Python, C/C++, OpenCV and GStreamer — no proprietary runtime in the way.',
        body: 'Flash the image, log in over SSH and run your first inference in minutes. System images, the SDK, AI examples and documentation are open on GitHub.',
        image: '/img/products/mo-62a/developers.jpg',
      },
      {
        title: 'Connectivity for real deployments',
        subtitle: 'Everything an edge vision terminal needs, nothing it doesn\'t.',
        body: 'Gigabit Ethernet, four USB 2.0 ports, micro HDMI, dual-band Wi-Fi 5 and BLE 4.2, and a 4-lane MIPI CSI-2 camera connector.',
        image: '/img/products/mo-62a/interfaces.jpg',
      },
      {
        title: 'Secure by design',
        subtitle: 'Protect firmware, models and data on unattended devices.',
        body: 'The SoC provides security building blocks, but production protection depends on device configuration, key management and validation. Board secure-boot provisioning has not been validated in these guides.',
        image: '/img/products/mo-62a/security.jpg',
      },
      {
        title: 'From prototype to production',
        subtitle: 'Validate on one board, deploy on the same platform and software.',
        body: 'USB-C 5 V / 5 A power, 25 W maximum and three memory options (2 / 4 / 8 GB) to match cost to workload — with InHand support from prototype to production.',
        image: '/img/products/mo-62a/production.jpg',
      },
    ],
    specs: [
      {
        title: 'Hardware',
        rows: [
          {label: 'Processor', value: 'TI AM62A74, 4 × Arm Cortex-A53 up to 1.4 GHz; MCU Cortex-R5F + Device Manager Cortex-R5F (reserved)'},
          {label: 'AI accelerator', value: 'C7x DSP + Matrix Multiply Accelerator (MMA), 2 TOPS'},
          {label: 'ISP / vision', value: 'On-chip ISP + VPAC (RGB-IR, WDR, LDC)'},
          {label: 'Memory', value: 'LPDDR4, 2 / 4 / 8 GB'},
          {label: 'Storage', value: 'microSD card'},
          {label: 'Ethernet', value: '1 × Gigabit Ethernet'},
          {label: 'USB', value: '4 × USB 2.0 Type-A'},
          {label: 'Display', value: '1 × micro HDMI'},
          {label: 'Camera', value: '1 × 4-lane MIPI CSI-2, 22-pin / 0.5 mm FPC; verify cable pinout and contact orientation'},
          {label: 'Audio', value: '3.5 mm jack; PCM via 40-pin header'},
          {label: 'Expansion', value: '40-pin header: GPIO / I²C / SPI / UART / PWM / PCM, 3.3 V logic'},
          {label: 'Debug', value: '1 × TTL UART console (115200 8N1)'},
          {label: 'Fan', value: '1 × 4-pin fan header'},
          {label: 'RTC', value: 'External RTC and battery connector; battery retention not tested'},
        ],
      },
      {
        title: 'Wireless',
        rows: [
          {label: 'Wi-Fi', value: 'Wi-Fi 5 (802.11ac), dual-band'},
          {label: 'Bluetooth', value: 'BLE 4.2'},
          {label: 'Antenna', value: 'On-board snap-on antenna'},
        ],
      },
      {
        title: 'Power & mechanical',
        rows: [
          {label: 'Power input', value: 'USB Type-C, 5 V / 5 A'},
          {label: 'Power consumption', value: '25 W maximum rating (not measured workload power)'},
          {label: 'Dimensions / weight', value: '85 × 56 mm, 47 g'},
          {label: 'Operating temperature', value: '0 – 50 °C'},
        ],
      },
      {
        title: 'Software',
        rows: [
          {label: 'Operating system', value: 'Debian 13 (Trixie), Linux kernel 6.12'},
          {label: 'AI runtime', value: 'TI TIDL with ONNX Runtime / TFLite'},
          {label: 'Development', value: 'Python, C/C++, OpenCV, GStreamer, NumPy, apt'},
          {label: 'Security', value: 'SoC security capabilities; board secure-boot provisioning not validated'},
        ],
      },
    ],
  },
  {
    id: 'mo-68a',
    name: 'Mo 68A',
    tops: 8,
    tagline: 'Multi-camera vision AI.',
    summary:
      'TI AM68A with two C7x DSPs, two 4-lane camera inputs, 4K60 video codec, USB 3.0 and PCIe 3.0 on the same 85 × 56 mm footprint.',
    tier: 'Mid-range · multi-camera · PCIe',
    image: '/img/boards/mo-68a.png',
    shopUrl: `${SHOP}/mo-68a-single-board-computer`,
    productPageUrl: 'https://www.inhand.com/en/products/ai-edge-computers/mo-68a',
    resourcesUrl:
      'https://www.inhand.com/en/resources-center/#/IndustrialDigitalization/AISingleBoardComputer/MO68A',
    githubUrl: null,
    datasheetUrl: null,
    variants: [
      {sku: 'Mo-68A-4G', ram: '4 GB', price: 329},
      {sku: 'Mo-68A-8G', ram: '8 GB', price: 489},
    ],
    highlights: [
      '8 TOPS: 2 × C7x DSP with deep-learning accelerator',
      'Up to 2 × 4-lane MIPI CSI-2 cameras, 4K60 encode / decode',
      '4 × USB 3.0 and 1 × PCIe 3.0',
      '40-pin HAT-compatible header, 85 × 56 mm',
    ],
    keySpecs: [
      {icon: 'SoC', value: 'TI AM68A', label: '2 × Cortex-A72 @ 2.0 GHz'},
      {icon: 'NPU', value: '8 TOPS', label: '2 × C7x DSP'},
      {icon: 'CAM', value: '2 × CSI-2', label: '4-lane each, ISP + DMPAC'},
      {icon: '4K', value: '4K60', label: 'H.264 / H.265 encode & decode'},
      {icon: 'PCIe', value: 'PCIe 3.0', label: '+ 4 × USB 3.0'},
    ],
    features: [
      {
        title: '8 TOPS of edge AI, where the cameras are',
        subtitle: 'Headroom for multiple camera streams and heavier models.',
        body: 'Two C7x DSPs with a deep-learning accelerator run detection, classification and segmentation on the board. TI TIDL deploys existing TFLite and ONNX models.',
        image: '/img/products/mo-68a/edge-ai.jpg',
      },
      {
        title: 'A vision processor, not just an SBC',
        subtitle: 'ISP, depth acceleration and 4K60 video in silicon.',
        body: 'The on-chip ISP and VPAC handle backlit, high-contrast and low-light scenes before your model sees the frame; DMPAC adds depth and motion acceleration, and the codec records or streams 4K60 alongside inference.',
        image: '/img/products/mo-68a/isp.jpg',
        points: ['Hardware WDR', 'Lens distortion correction', 'RGB-IR support', 'DMPAC depth & motion', '4K60 encode / decode'],
      },
      {
        title: '85 × 56 mm form factor, industrial AI core',
        subtitle: '85 × 56 mm with a 40-pin HAT-compatible header.',
        body: 'Fits mainstream SBC enclosures and works with HAT expansion boards — PoE, relays, sensors, displays. The header uses 3.3 V logic.',
        image: '/img/products/mo-68a/form-factor.jpg',
      },
      {
        title: 'Built for developers',
        subtitle: 'Debian, Python, C/C++, OpenCV and GStreamer — no proprietary runtime in the way.',
        body: 'Ready-to-flash Debian images, an open SDK and TIDL examples. Downloads are in the InHand Resource Center; the Mo 68A GitHub repository is coming soon.',
        image: '/img/products/mo-68a/developers.jpg',
      },
      {
        title: 'Built for multi-camera systems',
        subtitle: 'Two cameras, fast storage and high-speed expansion on one board.',
        body: 'Gigabit Ethernet, four USB 3.0 ports, mini DisplayPort plus MIPI DSI, PCIe 3.0, and two 4-lane MIPI CSI-2 camera inputs. No on-board wireless — use a USB adapter.',
        image: '/img/products/mo-68a/interfaces.jpg',
      },
      {
        title: 'Secure by design',
        subtitle: 'Protect firmware, models and data on unattended devices.',
        body: 'Secure boot, Arm TrustZone, OP-TEE trusted execution, a hardware AES-256 crypto accelerator and a watchdog.',
        image: '/img/products/mo-68a/security.jpg',
      },
      {
        title: 'From prototype to production',
        subtitle: 'Validate on one board, deploy on the same platform and software.',
        body: 'USB-C 5 V / 5 A power, 25 W maximum, a PWM fan header for sustained loads, and 4 / 8 GB memory options — with InHand support from prototype to production.',
        image: '/img/products/mo-68a/production.jpg',
      },
    ],
    specs: [
      {
        title: 'Hardware',
        rows: [
          {label: 'Processor', value: 'TI AM68A, 2 × Arm Cortex-A72 @ 2.0 GHz'},
          {label: 'AI accelerator', value: '2 × C7x DSP + deep-learning accelerator, 8 TOPS'},
          {label: 'ISP / vision', value: 'On-chip ISP + VPAC (RGB-IR, WDR, LDC) + DMPAC'},
          {label: 'Video', value: '4K60 H.264 / H.265 encode and decode'},
          {label: 'Memory', value: 'LPDDR4, 4 / 8 GB'},
          {label: 'Storage', value: 'microSD card'},
          {label: 'Ethernet', value: '1 × Gigabit Ethernet'},
          {label: 'USB', value: '4 × USB 3.0 Type-A'},
          {label: 'PCIe', value: '1 × PCIe 3.0'},
          {label: 'Display', value: '1 × mini DisplayPort; up to 2 × 4-lane MIPI DSI'},
          {label: 'Camera', value: 'Up to 2 × 4-lane MIPI CSI-2'},
          {label: 'Audio', value: 'I²S via 40-pin header'},
          {label: 'Expansion', value: '40-pin header: GPIO / I²C / I²S / SPI / UART / PCM, 3.3 V logic'},
          {label: 'Debug', value: '1 × TTL UART console'},
          {label: 'Fan', value: '1 × 4-pin fan header (5 V / PWM / GND / TACH)'},
          {label: 'RTC', value: 'Yes, with battery backup'},
        ],
      },
      {
        title: 'Wireless',
        rows: [{label: 'Wi-Fi / Bluetooth', value: 'None on board — use a USB adapter (see Accessories)'}],
      },
      {
        title: 'Power & mechanical',
        rows: [
          {label: 'Power input', value: 'USB Type-C, 5 V / 5 A'},
          {label: 'Power consumption', value: '25 W max'},
          {label: 'Dimensions / weight', value: '85 × 56 mm, 53 g'},
          {label: 'Operating temperature', value: '0 – 50 °C'},
        ],
      },
      {
        title: 'Software',
        rows: [
          {label: 'Operating system', value: 'Debian 13 (Trixie), Linux kernel 6.12'},
          {label: 'AI runtime', value: 'TI TIDL with ONNX Runtime / TFLite'},
          {label: 'Development', value: 'Python, C/C++, OpenCV, GStreamer, NumPy, apt'},
          {label: 'Security', value: 'Secure boot, Arm TrustZone, OP-TEE, hardware AES-256, watchdog'},
        ],
      },
    ],
  },
];

export const getProduct = (id: Product['id']) => products.find((p) => p.id === id)!;

export const fromPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));

// Shown wherever a lifetime commitment would go; replace once confirmed with TI.
export const PRODUCTION_LIFETIME = 'To be announced';

// Shared by both product pages.
export const APPLICATIONS = [
  {title: 'Construction site safety', image: '/img/products/shared/construction.jpg'},
  {title: 'Traffic flow analysis', image: '/img/products/shared/traffic.jpg'},
  {title: 'AI visual inspection', image: '/img/products/shared/inspection.jpg'},
  {title: 'Security & perimeter', image: '/img/products/shared/perimeter.jpg'},
  {title: 'Smart retail analytics', image: '/img/products/shared/retail.jpg'},
  {title: 'Education & robotics', image: '/img/products/shared/education.jpg'},
];

// Optional accessories as listed on inhand.com product pages, plus the Mo 68A USB wireless adapter;
// official SKUs are not on sale yet.
export const ACCESSORIES: {name: string; note: string; boards: Product['id'][]}[] = [
  {name: 'USB-C power supply', note: '5 V / 5 A', boards: ['mo-62a', 'mo-68a']},
  {name: 'microSD card', note: '32 GB', boards: ['mo-62a', 'mo-68a']},
  {name: 'Cooling fan', note: '4-pin, 5 V PWM', boards: ['mo-62a', 'mo-68a']},
  {name: 'Wi-Fi antenna', note: 'U.FL', boards: ['mo-62a']},
  {name: 'USB Wi-Fi / Bluetooth adapter', note: 'Official adapter, driver in the image', boards: ['mo-68a']},
  {name: 'RTC battery', note: 'Coin cell', boards: ['mo-62a', 'mo-68a']},
  {name: 'TTL debug cable', note: '3-pin UART', boards: ['mo-62a', 'mo-68a']},
  {name: 'Display cable', note: 'micro HDMI to HDMI', boards: ['mo-62a']},
  {name: 'Display cable', note: 'mini DP to DP', boards: ['mo-68a']},
  {name: 'Camera module', note: 'MIPI CSI-2, e.g. IMX219', boards: ['mo-62a', 'mo-68a']},
];
