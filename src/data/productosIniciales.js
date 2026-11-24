/**
 * MarketMjolnir - Datos Iniciales y Configuración de Marca
 * Reto Integrador · Desarrollo Móvil (React Native + Expo)
 */

export const INFO_MARCA = {
  nombre: 'MarketMjolnir',
  iniciales: 'MM⚡',
  eslogan: 'Forjando las mejores compras locales en la Sabana',
  publicoObjetivo:
    'Familias, estudiantes, deportistas, dueños de mascotas y aficionados a la tecnología en Mosquera, Madrid y Funza.',
  propuestaValor:
    'MarketMjolnir conecta a los compradores de Mosquera, Madrid y Funza con emprendimientos locales de tecnología, deporte, hogar y mascotas en una sola app ágil, permitiendo comparar precios en pesos colombianos, aprovechar envíos claros y simular pedidos confiables en segundos.',
  municipiosCobertura: ['Mosquera', 'Madrid', 'Funza'],
  colores: {
    primario: '#1E3A8A', // Azul Trueno
    primarioOscuro: '#172554',
    secundario: '#F59E0B', // Ámbar Eléctrico
    secundarioSuave: '#FEF3C7',
    fondo: '#F8FAFC',
    tarjeta: '#FFFFFF',
    textoPrincipal: '#0F172A',
    textoSecundario: '#475569',
    borde: '#E2E8F0',
    exito: '#16A34A',
    exitoFondo: '#DCFCE7',
    error: '#DC2626',
    errorFondo: '#FEE2E2',
    advertencia: '#D97706',
    advertenciaFondo: '#FEF3C7',
  },
};

export const CATEGORIAS = ['Todas', 'Tecnología', 'Deporte', 'Hogar', 'Mascotas'];

export const CATEGORIAS_VENDEDOR = ['Tecnología', 'Deporte', 'Hogar', 'Mascotas'];

export const COLORES_CATEGORIA = {
  Tecnología: { fondo: '#DBEAFE', texto: '#1E40AF', icono: '⚡' },
  Deporte: { fondo: '#FEF3C7', texto: '#B45309', icono: '🏋️' },
  Hogar: { fondo: '#E0E7FF', texto: '#3730A3', icono: '🏠' },
  Mascotas: { fondo: '#DCFCE7', texto: '#166534', icono: '🐾' },
};

export const REGLAS_NEGOCIO = {
  TOPE_ENVIO_GRATIS: 150000,
  COSTO_ENVIO_ESTANDAR: 8000,
  CODIGO_CUPON_VALIDO: 'BIENVENIDO10',
  PORCENTAJE_DESCUENTO_CUPON: 0.1, // 10 %
};

/**
 * Catálogo inicial de 12 productos distribuidos en 4 categorías:
 * - Tecnología (3 productos)
 * - Deporte (3 productos)
 * - Hogar (3 productos)
 * - Mascotas (3 productos)
 * Todos los precios son enteros positivos en COP sin decimales.
 */
export const PRODUCTOS_INICIALES = [
  {
    id: 'PROD-001',
    nombre: 'Audífonos Bluetooth Valhala Pro',
    categoria: 'Tecnología',
    precio: 85000,
    stock: 10,
    descripcion:
      'Audífonos inalámbricos con cancelación de ruido ambiental, micrófono HD y batería de 24 horas ideales para estudio y trabajo remoto.',
    icono: 'AV',
    resenas: [5, 4, 5],
  },
  {
    id: 'PROD-002',
    nombre: 'Teclado Mecánico Runas RGB',
    categoria: 'Tecnología',
    precio: 145000,
    stock: 6,
    descripcion:
      'Teclado mecánico compacto con switches táctiles de alta respuesta y retroiluminación LED para programar y jugar cómodamente.',
    icono: 'TR',
    resenas: [5, 5],
  },
  {
    id: 'PROD-003',
    nombre: 'Soporte Magnético Bifrost Celular',
    categoria: 'Tecnología',
    precio: 32000,
    stock: 15,
    descripcion:
      'Soporte metálico plegable y ajustable para escritorio, compatible con cualquier teléfono móvil o tableta liviana.',
    icono: 'SB',
    resenas: [4, 4, 5],
  },
  {
    id: 'PROD-004',
    nombre: 'Mancuernas Hexagonales Thor 5kg',
    categoria: 'Deporte',
    precio: 95000,
    stock: 10,
    descripcion:
      'Par de mancuernas recubiertas en neopreno antideslizante para entrenamiento funcional y de fuerza en casa.',
    icono: 'MT',
    resenas: [5, 4],
  },
  {
    id: 'PROD-005',
    nombre: 'Termo Deportivo Berserker 1L',
    categoria: 'Deporte',
    precio: 42000,
    stock: 8,
    descripcion:
      'Botella térmica de acero inoxidable de doble pared que conserva tus bebidas frías por 18 horas durante el ejercicio.',
    icono: 'TB',
    resenas: [4, 5, 4],
  },
  {
    id: 'PROD-006',
    nombre: 'Bandas de Resistencia Valkiria Set',
    categoria: 'Deporte',
    precio: 55000,
    stock: 2,
    descripcion:
      'Kit de 5 bandas elásticas de látex natural con diferentes niveles de tensión para calistenia, estiramiento y pilates.',
    icono: 'BV',
    resenas: [5],
  },
  {
    id: 'PROD-007',
    nombre: 'Lámpara Nórdica Midgard LED',
    categoria: 'Hogar',
    precio: 78000,
    stock: 5,
    descripcion:
      'Lámpara de mesa con base de madera artesanal de la Sabana y luz LED cálida regulable en tres niveles de intensidad.',
    icono: 'LM',
    resenas: [5, 5, 4],
  },
  {
    id: 'PROD-008',
    nombre: 'Organizador de Escritorio Asgard',
    categoria: 'Hogar',
    precio: 48000,
    stock: 9,
    descripcion:
      'Organizador multifuncional en madera ecológica elaborado por emprendedores de Funza para mantener tu estudio impecable.',
    icono: 'OA',
    resenas: [4, 4],
  },
  {
    id: 'PROD-009',
    nombre: 'Cafetera Prensa Francesa Odin 600ml',
    categoria: 'Hogar',
    precio: 64000,
    stock: 4,
    descripcion:
      'Prensa francesa en vidrio borosilicato resistente al calor con émbolo de acero inoxidable para preparar café de origen.',
    icono: 'CO',
    resenas: [5, 5],
  },
  {
    id: 'PROD-010',
    nombre: 'Cama Acolchada Fenrir Talla M',
    categoria: 'Mascotas',
    precio: 110000,
    stock: 3,
    descripcion:
      'Cama ortopédica con tela antifluido de fácil limpieza y cojín reversible ultra suave para perros y gatos medianos.',
    icono: 'CF',
    resenas: [5, 4, 5],
  },
  {
    id: 'PROD-011',
    nombre: 'Dispensador Automático Freya Dual',
    categoria: 'Mascotas',
    precio: 160000,
    stock: 7,
    descripcion:
      'Comedero y bebedero dosificador de gran capacidad ideal para garantizar la alimentación diaria de tu mascota.',
    icono: 'DF',
    resenas: [5, 5],
  },
  {
    id: 'PROD-012',
    nombre: 'Juguete Mordedor Mjolnir Canino',
    categoria: 'Mascotas',
    precio: 28000,
    stock: 0,
    descripcion:
      'Mordedor de caucho natural ultra resistente con forma de martillo diseñado para fortalecer la mandíbula de tu perro.',
    icono: 'JM',
    resenas: [4, 5],
  },
];
