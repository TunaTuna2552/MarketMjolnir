// ============================================================================
// MARKET MJOLNIR · DATOS DE MARCA, IMÁGENES OFICIALES HALO Y CATÁLOGO INICIAL
// ============================================================================

// Mapa de imágenes oficiales locales descargadas en assets/productos/
// Garantiza carga instantánea en Expo Go (Android/iOS) y Web sin depender de red
export const IMAGENES_LOCALES = {
  'PROD-001': require('../../assets/productos/prod-001.png'),
  'PROD-002': require('../../assets/productos/prod-002.jpg'),
  'PROD-003': require('../../assets/productos/prod-003.jpg'),
  'PROD-004': require('../../assets/productos/prod-004.jpg'),
  'PROD-005': require('../../assets/productos/prod-005.jpg'),
  'PROD-006': require('../../assets/productos/prod-006.png'),
  'PROD-007': require('../../assets/productos/prod-007.png'),
  'PROD-008': require('../../assets/productos/prod-008.jpg'),
  'PROD-009': require('../../assets/productos/prod-009.png'),
  'PROD-010': require('../../assets/productos/prod-010.png'),
  'PROD-011': require('../../assets/productos/prod-011.png'),
  'PROD-012': require('../../assets/productos/prod-012.png'),
  'PROD-013': require('../../assets/productos/prod-013.jpg'),
  'PROD-014': require('../../assets/productos/prod-014.png'),
};

// Imagen oficial por defecto para cada categoría (para nuevos productos creados en HU18)
export const IMAGENES_POR_CATEGORIA = {
  'Armaduras Mjolnir': require('../../assets/productos/prod-001.png'),
  'Naves de la Humanidad': require('../../assets/productos/prod-006.png'),
  'Armas de la Humanidad': require('../../assets/productos/prod-009.png'),
  'Vehículos Terrestres': require('../../assets/productos/prod-012.png'),
};

/**
 * Resuelve la fuente (source) para el componente <Image /> de React Native.
 * Prioriza una URL personalizada si el vendedor ingresó una en HU18, o usa el render oficial local.
 */
export function obtenerFuenteImagen(producto) {
  if (!producto) {
    return IMAGENES_LOCALES['PROD-001'];
  }
  if (
    producto.imagenPersonalizada &&
    typeof producto.imagenPersonalizada === 'string' &&
    producto.imagenPersonalizada.trim().startsWith('http')
  ) {
    return { uri: producto.imagenPersonalizada.trim() };
  }
  if (IMAGENES_LOCALES[producto.id]) {
    return IMAGENES_LOCALES[producto.id];
  }
  if (IMAGENES_POR_CATEGORIA[producto.categoria]) {
    return IMAGENES_POR_CATEGORIA[producto.categoria];
  }
  return IMAGENES_LOCALES['PROD-001'];
}

export const MARCA_INFO = {
  nombre: 'MARKET MJOLNIR',
  codigoMarca: 'MM-117',
  icono: '⬡',
  eslogan: 'Arsenal Táctico de la Humanidad · Equipamiento Spartan y Flota UNSC',
  publicoObjetivo:
    'Aficionados a los videojuegos de ciencia ficción (Halo), coleccionistas, recreadores tácticos Spartan y entusiastas de la tecnología espacial en Mosquera, Madrid, Funza y Colombia.',
  propuestaValor:
    'Market Mjolnir reúne en una sola interfaz táctica las armaduras Mjolnir, naves espaciales, armas y vehículos terrestres de la humanidad, ofreciendo búsqueda rápida, control de existencias en tiempo real, precios claros en pesos colombianos y simulación de pedidos segura para coleccionistas y fanáticos del universo Halo.',
  coloresPrincipales: [
    {
      nombre: 'Verde Militar Spartan MJOLNIR',
      hex: '#4ADE80',
      descripcion: 'Inspirado en el blindaje Mark VI del Jefe Maestro y el HUD táctico del UNSC.',
    },
    {
      nombre: 'Ámbar Visor Dorado / Titanio Espacial',
      hex: '#F59E0B',
      fondoHex: '#0A0F14',
      descripcion: 'Inspirado en el visor polarizado de oro de los cascos Spartan sobre cascos de titanio-A.',
    },
  ],
  categorias: [
    'Armaduras Mjolnir',
    'Naves de la Humanidad',
    'Armas de la Humanidad',
    'Vehículos Terrestres',
  ],
  reglasEnvio: {
    umbralEnvioGratis: 150000,
    costoEnvioEstandar: 8000,
  },
  cuponValido: {
    codigo: 'BIENVENIDO10',
    porcentajeDescuento: 10,
  },
};

export const CATEGORIAS_CONFIG = {
  'Armaduras Mjolnir': {
    icono: '🛡️',
    codigo: 'ARM-MJOLNIR',
    colorAcento: '#4ADE80',
    colorFondo: '#0F291E',
    descripcion: 'Exoesqueletos de combate neural para super-soldados Spartan.',
  },
  'Naves de la Humanidad': {
    icono: '🚀',
    codigo: 'FLT-UNSC',
    colorAcento: '#38BDF8',
    colorFondo: '#0C2536',
    descripcion: 'Cruceros, fragatas, transportes Pelican e interceptores orbitales de la Armada UNSC.',
  },
  'Armas de la Humanidad': {
    icono: '🔫',
    codigo: 'WPN-MISRIAH',
    colorAcento: '#F59E0B',
    colorFondo: '#2A1F0D',
    descripcion: 'Armamento balístico y pesado fabricado por Misriah Armory para defensa planetaria.',
  },
  'Vehículos Terrestres': {
    icono: '🚙',
    codigo: 'VEH-GROUND',
    colorAcento: '#A3E635',
    colorFondo: '#1E2912',
    descripcion: 'Blindados Scorpion, todoterrenos Warthog y unidades de reconocimiento Mongoose.',
  },
};

// Catálogo inicial con 14 productos distribuidos en las 4 categorías obligatorias.
// Todos los precios son enteros positivos en pesos colombianos (COP) sin decimales.
// Incluye imágenes oficiales reales del universo Halo (locales en assets/productos/ y URL oficial).
export const PRODUCTOS_INICIALES = [
  // --------------------------------------------------------------------------
  // 1. ARMADURAS MJOLNIR (4 productos)
  // --------------------------------------------------------------------------
  {
    id: 'PROD-001',
    nombre: 'Armadura Mjolnir Mark VI Gen-3 (Jefe Maestro)',
    categoria: 'Armaduras Mjolnir',
    precio: 185000,
    stock: 5,
    descripcion:
      'Exoesqueleto de combate neural con blindaje de titanio-A, escudos de energía recargables y visor dorado táctico SIERRA-117.',
    imagen: 'https://halo.wiki.gallery/images/7/70/H2A_MC_FullBody_Render.png',
    imagenLocal: 'assets/productos/prod-001.png',
    icono: '🛡️',
    insignia: 'MK-VI · S117',
    colorTarjeta: '#122B1D',
    especificaciones: 'Blindaje: Titanio-A | Escudo: Deflector de Energía | Juego: Halo 2: Anniversary / Halo Infinite',
    resenas: [
      {
        id: 'REV-101',
        autor: 'Spartan-117',
        estrellas: 5,
        comentario: 'Escudos resistentes a impacto de plasma y ajuste neural inmediato.',
      },
      {
        id: 'REV-102',
        autor: 'Cortana-AI',
        estrellas: 5,
        comentario: 'Sistemas de diagnóstico y telemetría de combate al 100%.',
      },
    ],
  },
  {
    id: 'PROD-002',
    nombre: 'Casco Mjolnir Recon Gen-2 Sigilo ONI',
    categoria: 'Armaduras Mjolnir',
    precio: 65000,
    stock: 8,
    descripcion:
      'Casco de infiltración táctica desarrollado por la ONI con reducción de firma térmica y sensores ópticos de largo alcance.',
    imagen: 'https://halo.wiki.gallery/images/thumb/3/38/HINF_Spartan_Recon_1.jpg/700px-HINF_Spartan_Recon_1.jpg',
    imagenLocal: 'assets/productos/prod-002.jpg',
    icono: '🪖',
    insignia: 'RECON · ONI',
    colorTarjeta: '#142620',
    especificaciones: 'Sensores: VISR Nocturno | Sigilo: Reducción EM | Juego: Halo 3: ODST / Halo Infinite',
    resenas: [
      {
        id: 'REV-103',
        autor: 'Agente Dare',
        estrellas: 4,
        comentario: 'Excelente visibilidad en operaciones nocturnas de Nueva Mombasa.',
      },
    ],
  },
  {
    id: 'PROD-003',
    nombre: 'Armadura Mjolnir EVA Orbital Zero-G',
    categoria: 'Armaduras Mjolnir',
    precio: 140000,
    stock: 3,
    descripcion:
      'Sistema Mjolnir especializado para combate extravehicular en vacío espacial con visor panorámico de cúpula reforzada.',
    imagen: 'https://halo.wiki.gallery/images/thumb/c/cd/HINF_Spartan_EVA_1.jpg/700px-HINF_Spartan_EVA_1.jpg',
    imagenLocal: 'assets/productos/prod-003.jpg',
    icono: '🧑‍🚀',
    insignia: 'EVA · ZERO-G',
    colorTarjeta: '#102826',
    especificaciones: 'Entorno: Vacío Orbital | Propulsores: Micro-jets EVA | Visor: Domo Panorámico 180°',
    resenas: [
      {
        id: 'REV-104',
        autor: 'Kelly-087',
        estrellas: 5,
        comentario: 'Movilidad insuperable en abordajes espaciales de gravedad cero.',
      },
    ],
  },
  {
    id: 'PROD-004',
    nombre: 'Prototipo Mjolnir Mark IV Edición Reach',
    categoria: 'Armaduras Mjolnir',
    precio: 120000,
    stock: 0, // Stock 0 intencional para validar HU07-CA02 y HU09-CA03 de producto Agotado
    descripcion:
      'Armadura histórica de la defensa de Reach con placas pesadas de titanio-A de primera generación y núcleo de fusión.',
    imagen: 'https://halo.wiki.gallery/images/thumb/3/3c/TFoRAS_MarkIV.jpg/700px-TFoRAS_MarkIV.jpg',
    imagenLocal: 'assets/productos/prod-004.jpg',
    icono: '⚠️',
    insignia: 'MK-IV · REACH',
    colorTarjeta: '#2B1616',
    especificaciones: 'Generación: Mark IV | Estado: Reliquia de Reach | Blindaje: Compuesto Pesado UNSC',
    resenas: [
      {
        id: 'REV-105',
        autor: 'Noble-6',
        estrellas: 5,
        comentario: 'Pieza legendaria de la campaña de Reach. Esperando nuevo lote.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 2. NAVES DE LA HUMANIDAD (4 productos)
  // --------------------------------------------------------------------------
  {
    id: 'PROD-005',
    nombre: 'Crucero Ligero UNSC Pillar of Autumn',
    categoria: 'Naves de la Humanidad',
    precio: 240000,
    stock: 4,
    descripcion:
      'Crucero clase Halcyon modificado con cañón de aceleración magnética MAC, reactores de fusión triple y estructura interna en panal.',
    imagen: 'https://halo.wiki.gallery/images/thumb/5/58/HR-PillarOfAutumn-HD-Panorama.jpg/700px-HR-PillarOfAutumn-HD-Panorama.jpg',
    imagenLocal: 'assets/productos/prod-005.jpg',
    icono: '🚀',
    insignia: 'C-709 · HALCYON',
    colorTarjeta: '#0F2233',
    especificaciones: 'Clase: Crucero Halcyon | Arma Principal: Cañón MAC | Juego: Halo: Reach / Halo: CE',
    resenas: [
      {
        id: 'REV-106',
        autor: 'Capitán Keyes',
        estrellas: 5,
        comentario: 'Chasis prácticamente indestructible frente a fuego orbital.',
      },
    ],
  },
  {
    id: 'PROD-006',
    nombre: 'Nave de Transporte Táctico D77-TC Pelican',
    categoria: 'Naves de la Humanidad',
    precio: 95000,
    stock: 6,
    descripcion:
      'Aeronave aerospacial de descenso rápido con cuatro propulsores vectoriales, bahía de tropas y abrazadera magnética para vehículos.',
    imagen: 'https://halo.wiki.gallery/images/thumb/c/c2/HINF_Pelican_Crop.png/700px-HINF_Pelican_Crop.png',
    imagenLocal: 'assets/productos/prod-006.png',
    icono: '✈️',
    insignia: 'D77-TC · ECHO419',
    colorTarjeta: '#122638',
    especificaciones: 'Capacidad: 15 Marines + 1 Warthog | Propulsión: 4 Toberas VTOL | Rol: Inserción Táctica',
    resenas: [
      {
        id: 'REV-107',
        autor: 'Foehammer Echo-419',
        estrellas: 5,
        comentario: 'Entrega suministros y tropas en cualquier zona de aterrizaje.',
      },
    ],
  },
  {
    id: 'PROD-007',
    nombre: 'Fragata Pesada UNSC Forward Unto Dawn',
    categoria: 'Naves de la Humanidad',
    precio: 210000,
    stock: 2,
    descripcion:
      'Fragata clase Charon equipada con cañón MAC frontal, bahías de lanzamiento ODST y hangar completo para blindados Scorpion.',
    imagen: 'https://halo.wiki.gallery/images/thumb/0/06/H3-UNSCForwardUntoDawnFrigate.png/700px-H3-UNSCForwardUntoDawnFrigate.png',
    imagenLocal: 'assets/productos/prod-007.png',
    icono: '🛸',
    insignia: 'FFG-201 · CHARON',
    colorTarjeta: '#0D2130',
    especificaciones: 'Clase: Fragata Ligera Charon | Despliegue: Cápsulas ODST | Juego: Halo 3',
    resenas: [
      {
        id: 'REV-108',
        autor: 'Comandante Miranda',
        estrellas: 4,
        comentario: 'Excelente capacidad de despliegue rápido en atmósfera.',
      },
    ],
  },
  {
    id: 'PROD-008',
    nombre: 'Interceptor Espacial GA-TL1 Longsword',
    categoria: 'Naves de la Humanidad',
    precio: 135000,
    stock: 5,
    descripcion:
      'Caza estelar atmosférico y exo-atmosférico armado con cañones rotativos de 110mm y bahía para torpedos tácticos.',
    imagen: 'https://halo.wiki.gallery/images/thumb/f/f6/TFoR_AS_-_Longsword_Squadron_Delta.jpg/700px-TFoR_AS_-_Longsword_Squadron_Delta.jpg',
    imagenLocal: 'assets/productos/prod-008.jpg',
    icono: '🛩️',
    insignia: 'GA-TL1 · INTERCEPTOR',
    colorTarjeta: '#112534',
    especificaciones: 'Rol: Superioridad Espacial | Armamento: Cañones 110mm + Misiles ASGM-10',
    resenas: [
      {
        id: 'REV-109',
        autor: 'Piloto Flota Tierra',
        estrellas: 4,
        comentario: 'Maniobrabilidad superior tanto en órbita como en vuelo atmosférico.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 3. ARMAS DE LA HUMANIDAD (3 productos)
  // --------------------------------------------------------------------------
  {
    id: 'PROD-009',
    nombre: 'Rifle de Asalto MA5B ICWS (Misriah Armory)',
    categoria: 'Armas de la Humanidad',
    precio: 45000,
    stock: 12,
    descripcion:
      'Rifle automático estándar del UNSC con pantalla digital de munición restante, brújula planetaria y cargador de 60 rondas.',
    imagen: 'https://halo.wiki.gallery/images/thumb/6/67/MA5B_Assault_Rifle.png/700px-MA5B_Assault_Rifle.png',
    imagenLocal: 'assets/productos/prod-009.png',
    icono: '🔫',
    insignia: 'MA5B · 7.62x51MM',
    colorTarjeta: '#261D0E',
    especificaciones: 'Fabricante: Misriah Armory | Cargador: 60 proyectiles | Telemetría: Contador LED Azul',
    resenas: [
      {
        id: 'REV-110',
        autor: 'Sargento Johnson',
        estrellas: 5,
        comentario: 'Confiable, resistente al barro y letal a corta distancia.',
      },
    ],
  },
  {
    id: 'PROD-010',
    nombre: 'Rifle de Batalla BR55 con Mira Óptica 2x',
    categoria: 'Armas de la Humanidad',
    precio: 52000,
    stock: 10,
    descripcion:
      'Rifle de infantería por ráfagas de tres disparos equipado con mira telescópica 2x para máxima precisión a media distancia.',
    imagen: 'https://halo.wiki.gallery/images/thumb/7/77/H3_BR55HB_Scope.png/700px-H3_BR55HB_Scope.png',
    imagenLocal: 'assets/productos/prod-010.png',
    icono: '🎯',
    insignia: 'BR55 · RÁFAGA 3X',
    colorTarjeta: '#292010',
    especificaciones: 'Modo de fuego: Ráfaga de 3 tiros | Óptica: Zoom 2x | Cargador: 36 proyectiles',
    resenas: [
      {
        id: 'REV-111',
        autor: 'ODST Buck',
        estrellas: 5,
        comentario: 'El arma más precisa del arsenal humano para combate táctico.',
      },
    ],
  },
  {
    id: 'PROD-011',
    nombre: 'Lanzacohetes Pesado M41 SPNKr Doble Tubo',
    categoria: 'Armas de la Humanidad',
    precio: 88000,
    stock: 4,
    descripcion:
      'Sistema antivehículo portátil con doble tubo rotativo recambiable de 102mm y fijación de objetivos aéreos y terrestres.',
    imagen: 'https://halo.wiki.gallery/images/thumb/3/3c/Rocket-launcher.png/700px-Rocket-launcher.png',
    imagenLocal: 'assets/productos/prod-011.png',
    icono: '💥',
    insignia: 'M41 · SPNKR 102MM',
    colorTarjeta: '#2D1E0F',
    especificaciones: 'Calibre: Cohetes 102mm | Capacidad: 2 tubos rotativos | Guiado: Seguimiento térmico',
    resenas: [
      {
        id: 'REV-112',
        autor: 'Marine Chips Dubbo',
        estrellas: 5,
        comentario: 'Detiene cualquier vehículo pesado enemigo en segundos.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 4. VEHÍCULOS TERRESTRES (3 productos)
  // --------------------------------------------------------------------------
  {
    id: 'PROD-012',
    nombre: 'Vehículo de Reconocimiento M12 Warthog LRV',
    categoria: 'Vehículos Terrestres',
    precio: 115000,
    stock: 7,
    descripcion:
      'Todoterreno 4x4 con motor de inyección de hidrógeno, chasis independiente y torreta rotativa M41 Vulcan de tres cañones.',
    imagen: 'https://halo.wiki.gallery/images/thumb/b/b0/Halo_Reach_Warthog.png/700px-Halo_Reach_Warthog.png',
    imagenLocal: 'assets/productos/prod-012.png',
    icono: '🚙',
    insignia: 'M12 · WARTHOG LRV',
    colorTarjeta: '#1A2613',
    especificaciones: 'Tracción: 4x4 Direccional | Motor: Hidrógeno ICE | Armamento: Torreta M41 LAAG 360°',
    resenas: [
      {
        id: 'REV-113',
        autor: 'Escuadrón Marine',
        estrellas: 5,
        comentario: 'Suspensión indestructible en terrenos rocosos y desérticos.',
      },
    ],
  },
  {
    id: 'PROD-013',
    nombre: 'Tanque de Batalla Principal M808B Scorpion',
    categoria: 'Vehículos Terrestres',
    precio: 195000,
    stock: 3,
    descripcion:
      'Blindado pesado de cuatro orugas articuladas equipado con cañón de alta velocidad de 90mm y ametralladora coaxial.',
    imagen: 'https://halo.wiki.gallery/images/thumb/b/b8/H2A_M808BScorpion_Render.jpg/700px-H2A_M808BScorpion_Render.jpg',
    imagenLocal: 'assets/productos/prod-013.jpg',
    icono: '🚜',
    insignia: 'M808B · SCORPION',
    colorTarjeta: '#1D2912',
    especificaciones: 'Blindaje: Cerámica-Titanio | Arma Principal: Cañón 90mm M512 | Tracción: 4 Orugas Bogie',
    resenas: [
      {
        id: 'REV-114',
        autor: 'Sargento Johnson',
        estrellas: 5,
        comentario: '¡El tanque lo vence todo! Potencia de fuego inigualable.',
      },
    ],
  },
  {
    id: 'PROD-014',
    nombre: 'Cuatrimoto de Asalto Rápido M274 Mongoose',
    categoria: 'Vehículos Terrestres',
    precio: 38000,
    stock: 9,
    descripcion:
      'Vehículo ligero ultrarrápido de exploración para dos soldados diseñado para despliegue relámpago y escolta táctica.',
    imagen: 'https://halo.wiki.gallery/images/f/fb/Halo3-Mongoose-Right.png',
    imagenLocal: 'assets/productos/prod-014.png',
    icono: '🏍️',
    insignia: 'M274 · MONGOOSE',
    colorTarjeta: '#182414',
    especificaciones: 'Capacidad: Conductor + Artillero trasero | Velocidad: 95 km/h | Juego: Halo 3 / Halo: Reach',
    resenas: [
      {
        id: 'REV-115',
        autor: 'Spartan Locke',
        estrellas: 4,
        comentario: 'Ideal para cruzar líneas de combate a máxima velocidad.',
      },
    ],
  },
];
