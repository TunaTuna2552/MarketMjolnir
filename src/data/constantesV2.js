// ============================================================================
// MARKET MJOLNIR 2.0 · CONSTANTES PURAS Y DATOS SEMILLA (HU21–HU35)
// Libre de importaciones binarias (require de imágenes) para permitir pruebas en Node.
// ============================================================================

export const REGLAS_V2 = {
  MIN_COMPARACION: 2,
  MAX_COMPARACION: 3,
  MIN_CHARS_PREGUNTA: 10,
  MIN_CHARS_SOPORTE: 15,
  MAX_RECOMENDACIONES: 4,
  UNIDADES_REPOSICION_DEMO: 5,
};

// HU26 · Tarifas ficticias de envío por municipio y modalidad
export const TARIFAS_ENVIO_V2 = {
  Mosquera: {
    estandar: { costo: 6000, plazo: '1 a 2 días' },
    expres: { costo: 10000, plazo: '1 día hábil' },
  },
  Funza: {
    estandar: { costo: 8000, plazo: '2 a 3 días' },
    expres: { costo: 12000, plazo: '1 a 2 días' },
  },
  Madrid: {
    estandar: { costo: 10000, plazo: '2 a 3 días' },
    expres: { costo: 14000, plazo: '1 a 2 días' },
  },
};

export const MUNICIPIOS_ENVIO = ['Mosquera', 'Funza', 'Madrid', 'Otro municipio'];

export const MODALIDADES_ENVIO = [
  { id: 'estandar', nombre: 'Envío estándar', descripcion: 'Despacho programado Sabana' },
  { id: 'expres', nombre: 'Envío exprés', descripcion: 'Despacho prioritario táctico' },
];

// HU27 y HU28 · Flujo estricto de estados de pedido
export const FLUJO_ESTADOS_PEDIDO = ['Confirmado', 'Preparando', 'En camino', 'Entregado'];
export const ESTADO_CANCELADO = 'Cancelado';

// HU32 · Motivos del centro de ayuda y solicitudes
export const MOTIVOS_SOPORTE = ['Entrega', 'Producto', 'Otro'];

// HU25 · Direcciones ficticias iniciales (una sola marcada como principal)
export const DIRECCIONES_INICIALES = [
  {
    id: 'DIR-001',
    alias: 'Base Principal Sabana (Demo)',
    municipio: 'Mosquera',
    descripcion: 'Parque Central ficticio, Torre Spartan Apt 204',
    principal: true,
  },
  {
    id: 'DIR-002',
    alias: 'Taller Táctico Funza (Demo)',
    municipio: 'Funza',
    descripcion: 'Sector Académico ficticio, Local Demostrativo 12',
    principal: false,
  },
  {
    id: 'DIR-003',
    alias: 'Puesto Madrid (Demo)',
    municipio: 'Madrid',
    descripcion: 'Zona Residencial ficticia, Bloque 3 Casa 8',
    principal: false,
  },
];

// HU24 · Consultas iniciales de compradores
export const CONSULTAS_INICIALES = [
  {
    id: 'CONS-001',
    productoId: 'PROD-001',
    pregunta: '¿Esta armadura incluye visor dorado intercambiable y soporte de exhibición?',
    estado: 'Respondida',
    respuestaSimulada:
      '[Respuesta simulada · Modo demostración] Sí, la edición de demostración incluye visor dorado y base táctica.',
    fecha: '2026-11-21 10:15',
  },
  {
    id: 'CONS-002',
    productoId: 'PROD-009',
    pregunta: '¿El rifle MA5B de colección incluye contador LED simulado en la parte superior?',
    estado: 'Pendiente',
    respuestaSimulada: '',
    fecha: '2026-11-23 15:40',
  },
];

// HU27, HU28, HU32, HU34 · Pedidos iniciales de prueba en varios estados
export const PEDIDOS_INICIALES_V2 = [
  {
    codigo: 'UNSC-2552-DEMO-01',
    fechaHora: '2026-11-23 · 09:30',
    comprador: {
      nombre: 'Operador Demo 117',
      telefono: '3000000117',
      municipio: 'Mosquera',
      direccion: 'Base Principal Sabana (Demo) · Parque Central ficticio, Torre Spartan Apt 204',
    },
    direccion: {
      id: 'DIR-001',
      alias: 'Base Principal Sabana (Demo)',
      municipio: 'Mosquera',
      descripcion: 'Parque Central ficticio, Torre Spartan Apt 204',
    },
    modalidadEnvio: 'estandar',
    plazoEnvio: '1 a 2 días',
    articulos: [
      {
        id: 'PROD-001',
        productoId: 'PROD-001',
        varianteId: 'VAR-001-M',
        varianteEtiqueta: 'Talla M · Verde Spartan',
        nombre: 'Armadura Mjolnir Mark VI Gen-3 (Jefe Maestro)',
        categoria: 'Armaduras Mjolnir',
        icono: '🛡️',
        imagenPersonalizada: null,
        cantidad: 1,
        precioUnitario: 185000,
        subtotalLinea: 185000,
      },
    ],
    subtotal: 185000,
    cuponAplicado: null,
    descuento: 0,
    envio: 6000,
    total: 191000,
    estado: 'Confirmado',
    stockRestituido: false,
    devolucionSolicitada: false,
    motivoDevolucion: '',
    historialEstados: [
      {
        estado: 'Confirmado',
        fecha: '2026-11-23 09:30',
        detalle: 'Pedido confirmado con datos de prueba (simulado).',
      },
    ],
    notaSimulacion:
      'SIMULACIÓN ACADÉMICA LOCAL: Pedido de prueba inicial sin cobro ni envío real.',
  },
  {
    codigo: 'UNSC-2552-DEMO-02',
    fechaHora: '2026-11-22 · 14:15',
    comprador: {
      nombre: 'Operador Demo 117',
      telefono: '3000000117',
      municipio: 'Funza',
      direccion: 'Taller Táctico Funza (Demo) · Sector Académico ficticio, Local Demostrativo 12',
    },
    direccion: {
      id: 'DIR-002',
      alias: 'Taller Táctico Funza (Demo)',
      municipio: 'Funza',
      descripcion: 'Sector Académico ficticio, Local Demostrativo 12',
    },
    modalidadEnvio: 'expres',
    plazoEnvio: '1 a 2 días',
    articulos: [
      {
        id: 'PROD-009',
        productoId: 'PROD-009',
        varianteId: 'VAR-009-EST',
        varianteEtiqueta: 'Edición Estándar',
        nombre: 'Rifle de Asalto MA5B ICWS (Misriah Armory)',
        categoria: 'Armas de la Humanidad',
        icono: '🔫',
        imagenPersonalizada: null,
        cantidad: 1,
        precioUnitario: 45000,
        subtotalLinea: 45000,
      },
    ],
    subtotal: 45000,
    cuponAplicado: null,
    descuento: 0,
    envio: 12000,
    total: 57000,
    estado: 'En camino',
    stockRestituido: false,
    devolucionSolicitada: false,
    motivoDevolucion: '',
    historialEstados: [
      { estado: 'Confirmado', fecha: '2026-11-22 14:15', detalle: 'Pedido confirmado.' },
      { estado: 'Preparando', fecha: '2026-11-22 16:00', detalle: 'Alistamiento simulado completado.' },
      { estado: 'En camino', fecha: '2026-11-23 08:20', detalle: 'En tránsito simulado hacia Funza.' },
    ],
    notaSimulacion:
      'SIMULACIÓN ACADÉMICA LOCAL: Pedido de prueba en ruta (no permite cancelación).',
  },
  {
    codigo: 'UNSC-2552-DEMO-03',
    fechaHora: '2026-11-20 · 11:05',
    comprador: {
      nombre: 'Operador Demo 117',
      telefono: '3000000117',
      municipio: 'Madrid',
      direccion: 'Puesto Madrid (Demo) · Zona Residencial ficticia, Bloque 3 Casa 8',
    },
    direccion: {
      id: 'DIR-003',
      alias: 'Puesto Madrid (Demo)',
      municipio: 'Madrid',
      descripcion: 'Zona Residencial ficticia, Bloque 3 Casa 8',
    },
    modalidadEnvio: 'estandar',
    plazoEnvio: '2 a 3 días',
    articulos: [
      {
        id: 'PROD-014',
        productoId: 'PROD-014',
        varianteId: 'VAR-014-U',
        varianteEtiqueta: 'Verde UNSC Estándar',
        nombre: 'Cuatrimoto de Asalto Rápido M274 Mongoose',
        categoria: 'Vehículos Terrestres',
        icono: '🏍️',
        imagenPersonalizada: null,
        cantidad: 1,
        precioUnitario: 38000,
        subtotalLinea: 38000,
      },
    ],
    subtotal: 38000,
    cuponAplicado: null,
    descuento: 0,
    envio: 10000,
    total: 48000,
    estado: 'Entregado',
    stockRestituido: false,
    devolucionSolicitada: false,
    motivoDevolucion: '',
    historialEstados: [
      { estado: 'Confirmado', fecha: '2026-11-20 11:05', detalle: 'Pedido confirmado.' },
      { estado: 'Preparando', fecha: '2026-11-20 13:10', detalle: 'Empaque simulado.' },
      { estado: 'En camino', fecha: '2026-11-21 09:00', detalle: 'Despachado (simulado).' },
      { estado: 'Entregado', fecha: '2026-11-21 15:45', detalle: 'Entregado en Madrid (simulado).' },
    ],
    notaSimulacion:
      'SIMULACIÓN ACADÉMICA LOCAL: Pedido entregado apto para probar soporte o devolución (HU34).',
  },
];

// HU33 · Paletas sobrias (Blanco, Gris Oscuro y Azul Claro) con alto contraste
export const TEMAS_APP = {
  claro: {
    id: 'claro',
    nombre: 'Modo Claro Profesional',
    fondo: '#F8FAFC',
    headerFondo: '#1E293B',
    tarjeta: '#FFFFFF',
    tarjetaSecundaria: '#F1F5F9',
    superficie: '#E2E8F0',
    borde: '#CBD5E1',
    bordeFuerte: '#38BDF8',
    textoPrincipal: '#1E293B',
    textoSecundario: '#334155',
    textoSuave: '#64748B',
    primario: '#0284C7',
    primarioFondo: '#E0F2FE',
    primarioBoton: '#0284C7',
    secundario: '#334155',
    secundarioFondo: '#F1F5F9',
    info: '#0369A1',
    infoFondo: '#F0F9FF',
    error: '#DC2626',
    errorFondo: '#FEF2F2',
    inputFondo: '#FFFFFF',
    placeholder: '#94A3B8',
    statusBar: 'light',
  },
  oscuro: {
    id: 'oscuro',
    nombre: 'Modo Oscuro Sobrio',
    fondo: '#0F172A',
    headerFondo: '#111827',
    tarjeta: '#1E293B',
    tarjetaSecundaria: '#162032',
    superficie: '#334155',
    borde: '#334155',
    bordeFuerte: '#38BDF8',
    textoPrincipal: '#F8FAFC',
    textoSecundario: '#CBD5E1',
    textoSuave: '#94A3B8',
    primario: '#38BDF8',
    primarioFondo: '#0C2D48',
    primarioBoton: '#0284C7',
    secundario: '#93C5FD',
    secundarioFondo: '#1E293B',
    info: '#7DD3FC',
    infoFondo: '#0F2940',
    error: '#F87171',
    errorFondo: '#2D1A1E',
    inputFondo: '#0F172A',
    placeholder: '#64748B',
    statusBar: 'light',
  },
};
