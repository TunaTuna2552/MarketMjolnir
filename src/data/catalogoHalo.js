// ============================================================================
// MARKET MJOLNIR 2.0 · DATOS DE MARCA, IMÁGENES OFICIALES HALO Y VARIANTES
// ============================================================================

export {
  REGLAS_V2,
  TARIFAS_ENVIO_V2,
  MUNICIPIOS_ENVIO,
  MODALIDADES_ENVIO,
  FLUJO_ESTADOS_PEDIDO,
  ESTADO_CANCELADO,
  MOTIVOS_SOPORTE,
  DIRECCIONES_INICIALES,
  CONSULTAS_INICIALES,
  PEDIDOS_INICIALES_V2,
  TEMAS_APP,
} from './constantesV2';

// Mapa de imágenes oficiales locales descargadas en assets/productos/
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

export const IMAGENES_POR_CATEGORIA = {
  'Armaduras Mjolnir': require('../../assets/productos/prod-001.png'),
  'Naves de la Humanidad': require('../../assets/productos/prod-006.png'),
  'Armas de la Humanidad': require('../../assets/productos/prod-009.png'),
  'Vehículos Terrestres': require('../../assets/productos/prod-012.png'),
};

/**
 * Resuelve la fuente (source) para el componente <Image /> de React Native.
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
  eslogan: 'Arsenal Táctico de la Humanidad · Experiencia Inteligente 2.0',
  publicoObjetivo:
    'Aficionados a los videojuegos de ciencia ficción (Halo), coleccionistas, recreadores tácticos Spartan y entusiastas en Mosquera, Madrid y Funza.',
  propuestaValor:
    'Market Mjolnir 2.0 reúne armaduras, naves, armas y vehículos del universo Halo con selección de variantes, comparador técnico, filtros avanzados, libreta de direcciones, envíos por municipio y seguimiento posventa en pesos colombianos.',
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
      descripcion: 'Inspirado en el visor polarizado de oro de los cascos Spartan sobre titanio-A.',
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
    descripcion: 'Cruceros, fragatas, transportes Pelican e interceptores orbitales.',
  },
  'Armas de la Humanidad': {
    icono: '🔫',
    codigo: 'WPN-MISRIAH',
    colorAcento: '#F59E0B',
    colorFondo: '#2A1F0D',
    descripcion: 'Armamento balístico y pesado fabricado por Misriah Armory.',
  },
  'Vehículos Terrestres': {
    icono: '🚙',
    codigo: 'VEH-GROUND',
    colorAcento: '#A3E635',
    colorFondo: '#1E2912',
    descripcion: 'Blindados Scorpion, todoterrenos Warthog y unidades Mongoose.',
  },
};

// Única fuente de stock: suma el inventario de todas las variantes del producto.
const construirProducto = (datos) => {
  const variantes = Array.isArray(datos.variantes) ? datos.variantes : [];
  const stockTotal = variantes.reduce(
    (acum, v) => acum + Math.max(0, Number(v.stock) || 0),
    0
  );
  return {
    ...datos,
    precioBase: datos.precio,
    stock: stockTotal,
    disponibilidad: stockTotal > 0 ? 'Disponible' : 'Agotado',
  };
};

// Catálogo inicial con 14 productos en 4 categorías y 4 marcas.
// 5 productos incorporan múltiples variantes (PROD-001, PROD-002, PROD-006, PROD-009, PROD-012).
export const PRODUCTOS_INICIALES = [
  // 1. ARMADURAS MJOLNIR
  construirProducto({
    id: 'PROD-001',
    nombre: 'Armadura Mjolnir Mark VI Gen-3 (Jefe Maestro)',
    categoria: 'Armaduras Mjolnir',
    marca: 'Materials Group UNSC',
    precio: 185000,
    descripcion:
      'Exoesqueleto de combate neural con blindaje de titanio-A, escudos de energía recargables y visor dorado táctico SIERRA-117.',
    imagen: 'https://halo.wiki.gallery/images/7/70/H2A_MC_FullBody_Render.png',
    imagenLocal: 'assets/productos/prod-001.png',
    icono: '🛡️',
    insignia: 'MK-VI · S117',
    colorTarjeta: '#122B1D',
    especificaciones: 'Blindaje: Titanio-A | Escudo: Deflector de Energía | Juego: Halo 2A / Infinite',
    variantes: [
      { id: 'VAR-001-M', etiqueta: 'Talla M · Verde Spartan', precio: 185000, stock: 3 },
      { id: 'VAR-001-L', etiqueta: 'Talla L · Dorado Visor', precio: 198000, stock: 2 },
      { id: 'VAR-001-XL', etiqueta: 'Talla XL · Titanio Negro', precio: 210000, stock: 0 },
    ],
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
  }),
  construirProducto({
    id: 'PROD-002',
    nombre: 'Casco Mjolnir Recon Gen-2 Sigilo ONI',
    categoria: 'Armaduras Mjolnir',
    marca: 'Materials Group UNSC',
    precio: 65000,
    descripcion:
      'Casco de infiltración táctica desarrollado por la ONI con reducción de firma térmica y sensores ópticos de largo alcance.',
    imagen: 'https://halo.wiki.gallery/images/thumb/3/38/HINF_Spartan_Recon_1.jpg/700px-HINF_Spartan_Recon_1.jpg',
    imagenLocal: 'assets/productos/prod-002.jpg',
    icono: '🪖',
    insignia: 'RECON · ONI',
    colorTarjeta: '#142620',
    especificaciones: 'Sensores: VISR Nocturno | Sigilo: Reducción EM | Juego: Halo 3: ODST / Infinite',
    variantes: [
      { id: 'VAR-002-NEG', etiqueta: 'Negro Sigilo ONI', precio: 65000, stock: 5 },
      { id: 'VAR-002-URB', etiqueta: 'Gris Urbano Visor Azul', precio: 72000, stock: 3 },
    ],
    resenas: [
      {
        id: 'REV-103',
        autor: 'Agente Dare',
        estrellas: 4,
        comentario: 'Excelente visibilidad en operaciones nocturnas de Nueva Mombasa.',
      },
    ],
  }),
  construirProducto({
    id: 'PROD-003',
    nombre: 'Armadura Mjolnir EVA Orbital Zero-G',
    categoria: 'Armaduras Mjolnir',
    marca: 'Materials Group UNSC',
    precio: 140000,
    descripcion:
      'Sistema Mjolnir especializado para combate extravehicular en vacío espacial con visor panorámico de cúpula reforzada.',
    imagen: 'https://halo.wiki.gallery/images/thumb/c/cd/HINF_Spartan_EVA_1.jpg/700px-HINF_Spartan_EVA_1.jpg',
    imagenLocal: 'assets/productos/prod-003.jpg',
    icono: '🧑‍🚀',
    insignia: 'EVA · ZERO-G',
    colorTarjeta: '#102826',
    especificaciones: 'Entorno: Vacío Orbital | Propulsores: Micro-jets EVA | Visor: Domo 180°',
    variantes: [
      { id: 'VAR-003-U', etiqueta: 'Edición Orbital Única', precio: 140000, stock: 3 },
    ],
    resenas: [
      {
        id: 'REV-104',
        autor: 'Kelly-087',
        estrellas: 5,
        comentario: 'Movilidad insuperable en abordajes espaciales de gravedad cero.',
      },
    ],
  }),
  construirProducto({
    id: 'PROD-004',
    nombre: 'Prototipo Mjolnir Mark IV Edición Reach',
    categoria: 'Armaduras Mjolnir',
    marca: 'Materials Group UNSC',
    precio: 120000,
    descripcion:
      'Armadura histórica de la defensa de Reach con placas pesadas de titanio-A de primera generación y núcleo de fusión.',
    imagen: 'https://halo.wiki.gallery/images/thumb/3/3c/TFoRAS_MarkIV.jpg/700px-TFoRAS_MarkIV.jpg',
    imagenLocal: 'assets/productos/prod-004.jpg',
    icono: '⚠️',
    insignia: 'MK-IV · REACH',
    colorTarjeta: '#2B1616',
    especificaciones: 'Generación: Mark IV | Estado: Reliquia de Reach | Blindaje: Compuesto Pesado',
    // Stock 0 intencional para validar producto agotado (HU07, HU09, HU30, HU31)
    variantes: [
      { id: 'VAR-004-U', etiqueta: 'Colección Reach Única', precio: 120000, stock: 0 },
    ],
    resenas: [
      {
        id: 'REV-105',
        autor: 'Noble-6',
        estrellas: 5,
        comentario: 'Pieza legendaria de la campaña de Reach. Esperando nuevo lote.',
      },
    ],
  }),

  // 2. NAVES DE LA HUMANIDAD
  construirProducto({
    id: 'PROD-005',
    nombre: 'Crucero Ligero UNSC Pillar of Autumn',
    categoria: 'Naves de la Humanidad',
    marca: 'SinoViet Heavy Machinery',
    precio: 240000,
    descripcion:
      'Crucero clase Halcyon modificado con cañón de aceleración magnética MAC, reactores de fusión triple y estructura interna en panal.',
    imagen: 'https://halo.wiki.gallery/images/thumb/5/58/HR-PillarOfAutumn-HD-Panorama.jpg/700px-HR-PillarOfAutumn-HD-Panorama.jpg',
    imagenLocal: 'assets/productos/prod-005.jpg',
    icono: '🚀',
    insignia: 'C-709 · HALCYON',
    colorTarjeta: '#0F2233',
    especificaciones: 'Clase: Crucero Halcyon | Arma Principal: Cañón MAC | Juego: Halo: Reach / CE',
    variantes: [
      { id: 'VAR-005-U', etiqueta: 'Maqueta Escala 1:500', precio: 240000, stock: 4 },
    ],
    resenas: [
      {
        id: 'REV-106',
        autor: 'Capitán Keyes',
        estrellas: 5,
        comentario: 'Chasis prácticamente indestructible frente a fuego orbital.',
      },
    ],
  }),
  construirProducto({
    id: 'PROD-006',
    nombre: 'Nave de Transporte Táctico D77-TC Pelican',
    categoria: 'Naves de la Humanidad',
    marca: 'Misriah Armory',
    precio: 95000,
    descripcion:
      'Aeronave aerospacial de descenso rápido con cuatro propulsores vectoriales, bahía de tropas y abrazadera magnética para vehículos.',
    imagen: 'https://halo.wiki.gallery/images/thumb/c/c2/HINF_Pelican_Crop.png/700px-HINF_Pelican_Crop.png',
    imagenLocal: 'assets/productos/prod-006.png',
    icono: '✈️',
    insignia: 'D77-TC · ECHO419',
    colorTarjeta: '#122638',
    especificaciones: 'Capacidad: 15 Marines + 1 Warthog | Propulsión: 4 Toberas VTOL',
    variantes: [
      { id: 'VAR-006-EST', etiqueta: 'Escala Estándar · Verde', precio: 95000, stock: 4 },
      { id: 'VAR-006-COL', etiqueta: 'Edición Coleccionista LED', precio: 125000, stock: 2 },
      { id: 'VAR-006-ED', etiqueta: 'Edición Dorada Echo-419', precio: 145000, stock: 0 },
    ],
    resenas: [
      {
        id: 'REV-107',
        autor: 'Foehammer Echo-419',
        estrellas: 5,
        comentario: 'Entrega suministros y tropas en cualquier zona de aterrizaje.',
      },
    ],
  }),
  construirProducto({
    id: 'PROD-007',
    nombre: 'Fragata Pesada UNSC Forward Unto Dawn',
    categoria: 'Naves de la Humanidad',
    marca: 'SinoViet Heavy Machinery',
    precio: 210000,
    descripcion:
      'Fragata clase Charon equipada con cañón MAC frontal, bahías de lanzamiento ODST y hangar completo para blindados Scorpion.',
    imagen: 'https://halo.wiki.gallery/images/thumb/0/06/H3-UNSCForwardUntoDawnFrigate.png/700px-H3-UNSCForwardUntoDawnFrigate.png',
    imagenLocal: 'assets/productos/prod-007.png',
    icono: '🛸',
    insignia: 'FFG-201 · CHARON',
    colorTarjeta: '#0D2130',
    especificaciones: 'Clase: Fragata Charon | Despliegue: Cápsulas ODST | Juego: Halo 3',
    variantes: [
      { id: 'VAR-007-U', etiqueta: 'Modelo FFG-201 Oficial', precio: 210000, stock: 2 },
    ],
    resenas: [
      {
        id: 'REV-108',
        autor: 'Comandante Miranda',
        estrellas: 4,
        comentario: 'Excelente capacidad de despliegue rápido en atmósfera.',
      },
    ],
  }),
  construirProducto({
    id: 'PROD-008',
    nombre: 'Interceptor Espacial GA-TL1 Longsword',
    categoria: 'Naves de la Humanidad',
    marca: 'Misriah Armory',
    precio: 135000,
    descripcion:
      'Caza estelar atmosférico y exo-atmosférico armado con cañones rotativos de 110mm y bahía para torpedos tácticos.',
    imagen: 'https://halo.wiki.gallery/images/thumb/f/f6/TFoR_AS_-_Longsword_Squadron_Delta.jpg/700px-TFoR_AS_-_Longsword_Squadron_Delta.jpg',
    imagenLocal: 'assets/productos/prod-008.jpg',
    icono: '🛩️',
    insignia: 'GA-TL1 · INTERCEPTOR',
    colorTarjeta: '#112534',
    especificaciones: 'Rol: Superioridad Espacial | Armamento: Cañones 110mm + Misiles ASGM-10',
    variantes: [
      { id: 'VAR-008-U', etiqueta: 'Escuadrón Delta Estándar', precio: 135000, stock: 5 },
    ],
    resenas: [
      {
        id: 'REV-109',
        autor: 'Piloto Flota Tierra',
        estrellas: 4,
        comentario: 'Maniobrabilidad superior tanto en órbita como en vuelo atmosférico.',
      },
    ],
  }),

  // 3. ARMAS DE LA HUMANIDAD
  construirProducto({
    id: 'PROD-009',
    nombre: 'Rifle de Asalto MA5B ICWS (Misriah Armory)',
    categoria: 'Armas de la Humanidad',
    marca: 'Misriah Armory',
    precio: 45000,
    descripcion:
      'Rifle automático estándar del UNSC con pantalla digital de munición restante, brújula planetaria y cargador de 60 rondas.',
    imagen: 'https://halo.wiki.gallery/images/thumb/6/67/MA5B_Assault_Rifle.png/700px-MA5B_Assault_Rifle.png',
    imagenLocal: 'assets/productos/prod-009.png',
    icono: '🔫',
    insignia: 'MA5B · 7.62x51MM',
    colorTarjeta: '#261D0E',
    especificaciones: 'Fabricante: Misriah Armory | Cargador: 60 proyectiles | Telemetría: LED Azul',
    variantes: [
      { id: 'VAR-009-EST', etiqueta: 'Edición Estándar', precio: 45000, stock: 8 },
      { id: 'VAR-009-CAM', etiqueta: 'Camuflaje Bosque Reach', precio: 53000, stock: 4 },
    ],
    resenas: [
      {
        id: 'REV-110',
        autor: 'Sargento Johnson',
        estrellas: 5,
        comentario: 'Confiable, resistente al barro y letal a corta distancia.',
      },
    ],
  }),
  construirProducto({
    id: 'PROD-010',
    nombre: 'Rifle de Batalla BR55 con Mira Óptica 2x',
    categoria: 'Armas de la Humanidad',
    marca: 'Misriah Armory',
    precio: 52000,
    descripcion:
      'Rifle de infantería por ráfagas de tres disparos equipado con mira telescópica 2x para máxima precisión a media distancia.',
    imagen: 'https://halo.wiki.gallery/images/thumb/7/77/H3_BR55HB_Scope.png/700px-H3_BR55HB_Scope.png',
    imagenLocal: 'assets/productos/prod-010.png',
    icono: '🎯',
    insignia: 'BR55 · RÁFAGA 3X',
    colorTarjeta: '#292010',
    especificaciones: 'Modo de fuego: Ráfaga de 3 tiros | Óptica: Zoom 2x | Cargador: 36',
    variantes: [
      { id: 'VAR-010-U', etiqueta: 'Estándar Óptica 2x', precio: 52000, stock: 10 },
    ],
    resenas: [
      {
        id: 'REV-111',
        autor: 'ODST Buck',
        estrellas: 5,
        comentario: 'El arma más precisa del arsenal humano para combate táctico.',
      },
    ],
  }),
  construirProducto({
    id: 'PROD-011',
    nombre: 'Lanzacohetes Pesado M41 SPNKr Doble Tubo',
    categoria: 'Armas de la Humanidad',
    marca: 'Misriah Armory',
    precio: 88000,
    descripcion:
      'Sistema antivehículo portátil con doble tubo rotativo recambiable de 102mm y fijación de objetivos aéreos y terrestres.',
    imagen: 'https://halo.wiki.gallery/images/thumb/3/3c/Rocket-launcher.png/700px-Rocket-launcher.png',
    imagenLocal: 'assets/productos/prod-011.png',
    icono: '💥',
    insignia: 'M41 · SPNKR 102MM',
    colorTarjeta: '#2D1E0F',
    especificaciones: 'Calibre: Cohetes 102mm | Capacidad: 2 tubos rotativos',
    variantes: [
      { id: 'VAR-011-U', etiqueta: 'Doble Tubo Estándar', precio: 88000, stock: 4 },
    ],
    resenas: [
      {
        id: 'REV-112',
        autor: 'Marine Chips Dubbo',
        estrellas: 5,
        comentario: 'Detiene cualquier vehículo pesado enemigo en segundos.',
      },
    ],
  }),

  // 4. VEHÍCULOS TERRESTRES
  construirProducto({
    id: 'PROD-012',
    nombre: 'Vehículo de Reconocimiento M12 Warthog LRV',
    categoria: 'Vehículos Terrestres',
    marca: 'AMG Transport Dynamics',
    precio: 115000,
    descripcion:
      'Todoterreno 4x4 con motor de inyección de hidrógeno, chasis independiente y torreta rotativa M41 Vulcan de tres cañones.',
    imagen: 'https://halo.wiki.gallery/images/thumb/b/b0/Halo_Reach_Warthog.png/700px-Halo_Reach_Warthog.png',
    imagenLocal: 'assets/productos/prod-012.png',
    icono: '🚙',
    insignia: 'M12 · WARTHOG LRV',
    colorTarjeta: '#1A2613',
    especificaciones: 'Tracción: 4x4 Direccional | Motor: Hidrógeno ICE | Torreta: M41 LAAG 360°',
    variantes: [
      { id: 'VAR-012-LRV', etiqueta: 'M12 LRV Torreta Vulcan', precio: 115000, stock: 5 },
      { id: 'VAR-012-GAU', etiqueta: 'M12G1 Gauss Pesado', precio: 139000, stock: 2 },
    ],
    resenas: [
      {
        id: 'REV-113',
        autor: 'Escuadrón Marine',
        estrellas: 5,
        comentario: 'Suspensión indestructible en terrenos rocosos y desérticos.',
      },
    ],
  }),
  construirProducto({
    id: 'PROD-013',
    nombre: 'Tanque de Batalla Principal M808B Scorpion',
    categoria: 'Vehículos Terrestres',
    marca: 'AMG Transport Dynamics',
    precio: 195000,
    descripcion:
      'Blindado pesado de cuatro orugas articuladas equipado con cañón de alta velocidad de 90mm y ametralladora coaxial.',
    imagen: 'https://halo.wiki.gallery/images/thumb/b/b8/H2A_M808BScorpion_Render.jpg/700px-H2A_M808BScorpion_Render.jpg',
    imagenLocal: 'assets/productos/prod-013.jpg',
    icono: '🚜',
    insignia: 'M808B · SCORPION',
    colorTarjeta: '#1D2912',
    especificaciones: 'Blindaje: Cerámica-Titanio | Arma Principal: Cañón 90mm M512',
    variantes: [
      { id: 'VAR-013-U', etiqueta: 'Blindado M808B Estándar', precio: 195000, stock: 3 },
    ],
    resenas: [
      {
        id: 'REV-114',
        autor: 'Sargento Johnson',
        estrellas: 5,
        comentario: '¡El tanque lo vence todo! Potencia de fuego inigualable.',
      },
    ],
  }),
  construirProducto({
    id: 'PROD-014',
    nombre: 'Cuatrimoto de Asalto Rápido M274 Mongoose',
    categoria: 'Vehículos Terrestres',
    marca: 'AMG Transport Dynamics',
    precio: 38000,
    descripcion:
      'Vehículo ligero ultrarrápido de exploración para dos soldados diseñado para despliegue relámpago y escolta táctica.',
    imagen: 'https://halo.wiki.gallery/images/f/fb/Halo3-Mongoose-Right.png',
    imagenLocal: 'assets/productos/prod-014.png',
    icono: '🏍️',
    insignia: 'M274 · MONGOOSE',
    colorTarjeta: '#182414',
    especificaciones: 'Capacidad: 2 plazas | Velocidad: 95 km/h | Juego: Halo 3 / Reach',
    variantes: [
      { id: 'VAR-014-U', etiqueta: 'Verde UNSC Estándar', precio: 38000, stock: 9 },
    ],
    resenas: [
      {
        id: 'REV-115',
        autor: 'Spartan Locke',
        estrellas: 4,
        comentario: 'Ideal para cruzar líneas de combate a máxima velocidad.',
      },
    ],
  }),
];
