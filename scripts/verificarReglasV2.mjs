import assert from 'node:assert/strict';
import {
  CONSULTAS_INICIALES,
  DIRECCIONES_INICIALES,
  ESTADO_CANCELADO,
  FLUJO_ESTADOS_PEDIDO,
  PEDIDOS_INICIALES_V2,
  TEMAS_APP,
} from '../src/data/constantesV2.js';
import {
  agregarNotificacionUnica,
  aplicarFiltrosCatalogo,
  avanzarEstadoPedido,
  calcularEnvioV2,
  calcularResumenCarritoV2,
  cancelarPedidoControlado,
  cancelarSuscripcionReposicion,
  construirClaveCarrito,
  crearTicketSoporte,
  descontarStockPorItems,
  ejecutarReposicionSimulada,
  generarRespuestaSimuladaPregunta,
  generarTextoCompartirProducto,
  guardarDireccionEnLista,
  marcarDireccionPrincipal,
  marcarNotificacionLeida,
  obtenerRecomendacionesRelacionadas,
  obtenerStockProducto,
  obtenerVarianteProducto,
  simularRespuestaTicket,
  solicitarDevolucionPedido,
  suscribirReposicion,
  tieneMultiplesVariantes,
  toggleComparacion,
  validarPreguntaProducto,
  validarRangoPrecio,
} from '../src/utils/reglasV2.js';

// Catálogo representativo espejo de catalogoHalo.js (sin require de imágenes para correr en Node)
const productosBase = [
  {
    id: 'PROD-001',
    nombre: 'Armadura Mjolnir Mark VI Gen-3 (Jefe Maestro)',
    categoria: 'Armaduras Mjolnir',
    marca: 'Materials Group UNSC',
    precio: 185000,
    stock: 5,
    variantes: [
      { id: 'VAR-001-M', etiqueta: 'Talla M · Verde Spartan', precio: 185000, stock: 3 },
      { id: 'VAR-001-L', etiqueta: 'Talla L · Dorado Visor', precio: 198000, stock: 2 },
      { id: 'VAR-001-XL', etiqueta: 'Talla XL · Titanio Negro', precio: 210000, stock: 0 },
    ],
  },
  {
    id: 'PROD-002',
    nombre: 'Casco Mjolnir Recon Gen-2 Sigilo ONI',
    categoria: 'Armaduras Mjolnir',
    marca: 'Materials Group UNSC',
    precio: 65000,
    stock: 8,
    variantes: [
      { id: 'VAR-002-NEG', etiqueta: 'Negro Sigilo ONI', precio: 65000, stock: 5 },
      { id: 'VAR-002-URB', etiqueta: 'Gris Urbano Visor Azul', precio: 72000, stock: 3 },
    ],
  },
  {
    id: 'PROD-003',
    nombre: 'Armadura Mjolnir EVA Orbital Zero-G',
    categoria: 'Armaduras Mjolnir',
    marca: 'Materials Group UNSC',
    precio: 140000,
    stock: 3,
    variantes: [{ id: 'VAR-003-U', etiqueta: 'Edición Orbital Única', precio: 140000, stock: 3 }],
  },
  {
    id: 'PROD-004',
    nombre: 'Prototipo Mjolnir Mark IV Edición Reach',
    categoria: 'Armaduras Mjolnir',
    marca: 'Materials Group UNSC',
    precio: 120000,
    stock: 0,
    variantes: [{ id: 'VAR-004-U', etiqueta: 'Colección Reach Única', precio: 120000, stock: 0 }],
  },
  {
    id: 'PROD-006',
    nombre: 'Nave de Transporte Táctico D77-TC Pelican',
    categoria: 'Naves de la Humanidad',
    marca: 'Misriah Armory',
    precio: 95000,
    stock: 6,
    variantes: [
      { id: 'VAR-006-EST', etiqueta: 'Escala Estándar · Verde', precio: 95000, stock: 4 },
      { id: 'VAR-006-COL', etiqueta: 'Edición Coleccionista LED', precio: 125000, stock: 2 },
      { id: 'VAR-006-ED', etiqueta: 'Edición Dorada Echo-419', precio: 145000, stock: 0 },
    ],
  },
  {
    id: 'PROD-009',
    nombre: 'Rifle de Asalto MA5B ICWS (Misriah Armory)',
    categoria: 'Armas de la Humanidad',
    marca: 'Misriah Armory',
    precio: 45000,
    stock: 12,
    variantes: [
      { id: 'VAR-009-EST', etiqueta: 'Edición Estándar', precio: 45000, stock: 8 },
      { id: 'VAR-009-CAM', etiqueta: 'Camuflaje Bosque Reach', precio: 53000, stock: 4 },
    ],
  },
  {
    id: 'PROD-012',
    nombre: 'Vehículo de Reconocimiento M12 Warthog LRV',
    categoria: 'Vehículos Terrestres',
    marca: 'AMG Transport Dynamics',
    precio: 115000,
    stock: 7,
    variantes: [
      { id: 'VAR-012-LRV', etiqueta: 'M12 LRV Torreta Vulcan', precio: 115000, stock: 5 },
      { id: 'VAR-012-GAU', etiqueta: 'M12G1 Gauss Pesado', precio: 139000, stock: 2 },
    ],
  },
];

let pruebasEjecutadas = 0;
const test = (nombre, fn) => {
  fn();
  pruebasEjecutadas += 1;
  console.log(`✓ ${nombre}`);
};

// HU21 · Variantes de los productos
test('HU21-CA01/CA02/CA03/CA04: al menos 3 productos con variantes, clave única y una sola fuente de stock', () => {
  const conMultiples = productosBase.filter(tieneMultiplesVariantes);
  assert.ok(conMultiples.length >= 3, 'Debe haber al menos 3 productos con variantes');

  const prod1 = productosBase[0];
  assert.equal(obtenerStockProducto(prod1), 5);
  assert.equal(obtenerVarianteProducto(prod1, null), null, 'Sin selección en multi-variante devuelve null');

  const varL = obtenerVarianteProducto(prod1, 'VAR-001-L');
  assert.equal(varL.precio, 198000);
  assert.equal(varL.stock, 2);

  const varXL = obtenerVarianteProducto(prod1, 'VAR-001-XL');
  assert.equal(varXL.stock, 0);

  const claveM = construirClaveCarrito('PROD-001', 'VAR-001-M');
  const claveL = construirClaveCarrito('PROD-001', 'VAR-001-L');
  assert.notEqual(claveM, claveL, 'Dos tallas del mismo producto deben generar claves distintas en carrito');
});

// HU22 · Comparador de productos
test('HU22-CA01/CA02/CA03/CA04: seleccionar hasta 3, bloquear 4to y retirar', () => {
  let lista = [];
  lista = toggleComparacion(lista, 'PROD-001').lista;
  lista = toggleComparacion(lista, 'PROD-002').lista;
  lista = toggleComparacion(lista, 'PROD-006').lista;
  assert.equal(lista.length, 3);

  const cuarto = toggleComparacion(lista, 'PROD-009');
  assert.equal(cuarto.ok, false);
  assert.equal(cuarto.lista.length, 3);

  const retiro = toggleComparacion(lista, 'PROD-002');
  assert.equal(retiro.ok, true);
  assert.deepEqual(retiro.lista, ['PROD-001', 'PROD-006']);
});

// HU23 · Filtros combinados
test('HU23-CA01/CA02/CA03/CA04: filtros combinados, rango inválido y vacío', () => {
  const rangoInvalido = validarRangoPrecio('200000', '50000');
  assert.equal(rangoInvalido.valido, false);

  const rangoValido = validarRangoPrecio('40000', '100000');
  assert.equal(rangoValido.valido, true);

  const filtrado = aplicarFiltrosCatalogo(productosBase, {
    busqueda: 'Pelican',
    categoria: 'Naves de la Humanidad',
    marca: 'Misriah Armory',
    precioMin: rangoValido.min,
    precioMax: rangoValido.max,
    soloDisponibles: true,
  });
  assert.equal(filtrado.valido, true);
  assert.equal(filtrado.resultados.length, 1);
  assert.equal(filtrado.resultados[0].id, 'PROD-006');

  const vacio = aplicarFiltrosCatalogo(productosBase, {
    busqueda: 'NoExisteXYZ',
    soloDisponibles: true,
  });
  assert.equal(vacio.valido, true);
  assert.equal(vacio.resultados.length, 0);
});

// HU24 · Preguntas frecuentes
test('HU24-CA01/CA02/CA03/CA04: validación mínima 10 chars y respuesta simulada', () => {
  assert.equal(validarPreguntaProducto('').valido, false);
  assert.equal(validarPreguntaProducto('Hola?').valido, false);
  const valida = validarPreguntaProducto('¿Esta armadura incluye el visor dorado?');
  assert.equal(valida.valido, true);

  const respuesta = generarRespuestaSimuladaPregunta(productosBase[0], valida.textoLimpio);
  assert.match(respuesta, /Respuesta simulada/i);
  assert.ok(CONSULTAS_INICIALES.length >= 2);
});

// HU25 · Libreta de direcciones
test('HU25-CA01/CA02/CA03/CA04: agregar, única principal y editar sin duplicar', () => {
  let dirs = [...DIRECCIONES_INICIALES];
  const agregada = guardarDireccionEnLista(dirs, {
    alias: 'Bodega Demo',
    municipio: 'Mosquera',
    descripcion: 'Zona ficticia entrada norte 10',
    principal: false,
  });
  assert.equal(agregada.ok, true);
  assert.equal(agregada.direcciones.length, dirs.length + 1);
  dirs = agregada.direcciones;

  dirs = marcarDireccionPrincipal(dirs, agregada.guardada.id);
  const principales = dirs.filter((d) => d.principal);
  assert.equal(principales.length, 1);
  assert.equal(principales[0].id, agregada.guardada.id);

  const editada = guardarDireccionEnLista(
    dirs,
    {
      alias: 'Bodega Demo Editada',
      municipio: 'Funza',
      descripcion: 'Zona ficticia actualizada 22',
      principal: true,
    },
    agregada.guardada.id
  );
  assert.equal(editada.ok, true);
  assert.equal(editada.direcciones.length, dirs.length, 'Editar no debe duplicar registros');
});

// HU26 · Estimador de costo y plazo de envío
test('HU26-CA01/CA02/CA03/CA04: tarifas Mosquera/Funza/Madrid y sin duplicar cargo', () => {
  const mosqueraEst = calcularEnvioV2({ municipio: 'Mosquera' }, 'estandar');
  assert.equal(mosqueraEst.disponible, true);
  assert.equal(mosqueraEst.costo, 6000);
  assert.equal(mosqueraEst.plazo, '1 a 2 días');

  const funzaExp = calcularEnvioV2({ municipio: 'Funza' }, 'expres');
  assert.equal(funzaExp.disponible, true);
  assert.equal(funzaExp.costo, 12000);
  assert.equal(funzaExp.plazo, '1 a 2 días');

  const madridEst = calcularEnvioV2({ municipio: 'Madrid' }, 'estandar');
  assert.equal(madridEst.costo, 10000);

  const otro = calcularEnvioV2({ municipio: 'Chía' }, 'estandar');
  assert.equal(otro.disponible, false);

  const carrito = [{ precio: 50000, cantidad: 2 }];
  const r1 = calcularResumenCarritoV2(carrito, null, mosqueraEst);
  const r2 = calcularResumenCarritoV2(carrito, null, funzaExp);
  assert.equal(r1.total, 106000);
  assert.equal(r2.total, 112000, 'Cambiar modalidad/municipio recalcula sin duplicar');
});

// HU27 & HU28 · Seguimiento, cancelación lógica y reintegro único
test('HU27/HU28: transiciones estrictas, bloqueo final y reintegro único por variante', () => {
  assert.deepEqual(FLUJO_ESTADOS_PEDIDO, ['Confirmado', 'Preparando', 'En camino', 'Entregado']);

  const itemsPedido = [
    { productoId: 'PROD-001', varianteId: 'VAR-001-M', cantidad: 2 },
  ];
  let inv = descontarStockPorItems(productosBase, itemsPedido);
  assert.equal(obtenerVarianteProducto(inv[0], 'VAR-001-M').stock, 1);

  let pedido = {
    codigo: 'PED-TEST-1',
    estado: 'Confirmado',
    articulos: itemsPedido,
    stockRestituido: false,
    historialEstados: [{ estado: 'Confirmado', fecha: '2026-11-24 10:00', detalle: 'Ok' }],
  };

  const av1 = avanzarEstadoPedido(pedido, '2026-11-24 10:10');
  assert.equal(av1.ok, true);
  assert.equal(av1.pedido.estado, 'Preparando');

  // Cancelación permitida en Preparando
  const canc1 = cancelarPedidoControlado(av1.pedido, inv, '2026-11-24 10:15');
  assert.equal(canc1.ok, true);
  assert.equal(canc1.pedido.estado, ESTADO_CANCELADO);
  assert.equal(obtenerVarianteProducto(canc1.productos[0], 'VAR-001-M').stock, 3);

  // Cancelar otra vez no duplica stock
  const canc2 = cancelarPedidoControlado(canc1.pedido, canc1.productos, '2026-11-24 10:20');
  assert.equal(canc2.ok, false);
  assert.equal(obtenerVarianteProducto(canc2.productos[0], 'VAR-001-M').stock, 3);

  // Avance bloqueado en Cancelado y Entregado
  assert.equal(avanzarEstadoPedido(canc1.pedido).ok, false);
  assert.equal(avanzarEstadoPedido(PEDIDOS_INICIALES_V2[2]).ok, false);

  // Cancelación bloqueada en En camino
  assert.equal(cancelarPedidoControlado(PEDIDOS_INICIALES_V2[1], inv).ok, false);
});

// HU29 & HU30 · Notificaciones sin duplicados y reposición
test('HU29/HU30: deduplicación, lectura, suscripción única y cancelación previa a reposición', () => {
  let notifs = [];
  const ev1 = agregarNotificacionUnica(notifs, {
    claveEvento: 'PED-1-Preparando',
    tipo: 'pedido',
    mensaje: 'Pedido PED-1 en Preparando',
  });
  assert.equal(ev1.agregada, true);
  notifs = ev1.lista;

  // Mismo evento no duplica
  const evDup = agregarNotificacionUnica(notifs, {
    claveEvento: 'PED-1-Preparando',
    tipo: 'pedido',
    mensaje: 'Pedido PED-1 en Preparando',
  });
  assert.equal(evDup.agregada, false);
  assert.equal(evDup.lista.length, 1);

  notifs = marcarNotificacionLeida(notifs, notifs[0].id);
  assert.equal(notifs[0].leida, true);

  // HU30 suscripción única y reposición
  let sus = [];
  const s1 = suscribirReposicion(sus, {
    productoId: 'PROD-004',
    varianteId: 'VAR-004-U',
    productoNombre: 'Prototipo Mark IV',
    varianteEtiqueta: 'Única',
  });
  assert.equal(s1.ok, true);
  sus = s1.lista;

  const sDup = suscribirReposicion(sus, {
    productoId: 'PROD-004',
    varianteId: 'VAR-004-U',
    productoNombre: 'Prototipo Mark IV',
    varianteEtiqueta: 'Única',
  });
  assert.equal(sDup.ok, false);

  // Cancelar antes de reponer no crea aviso
  sus = cancelarSuscripcionReposicion(sus, 'PROD-004', 'VAR-004-U').lista;
  const repoSinAviso = ejecutarReposicionSimulada({
    productos: productosBase,
    suscripciones: sus,
    notificaciones: notifs,
    productoId: 'PROD-004',
    varianteId: 'VAR-004-U',
    unidades: 5,
  });
  assert.equal(repoSinAviso.avisoGenerado, false);
  assert.equal(repoSinAviso.stockNuevo, 5);

  // Con suscripción activa sí crea aviso
  sus = suscribirReposicion([], {
    productoId: 'PROD-001',
    varianteId: 'VAR-001-XL',
    productoNombre: 'Armadura Mark VI',
    varianteEtiqueta: 'XL',
  }).lista;
  const repoConAviso = ejecutarReposicionSimulada({
    productos: productosBase,
    suscripciones: sus,
    notificaciones: notifs,
    productoId: 'PROD-001',
    varianteId: 'VAR-001-XL',
    unidades: 4,
  });
  assert.equal(repoConAviso.avisoGenerado, true);
  assert.equal(repoConAviso.notificaciones.length, 2);
});

// HU31 · Recomendaciones relacionadas
test('HU31: recomienda misma categoría con stock y excluye actual y agotados', () => {
  const recs = obtenerRecomendacionesRelacionadas(productosBase[0], productosBase, 4);
  assert.ok(recs.every((r) => r.id !== 'PROD-001' && r.categoria === 'Armaduras Mjolnir'));
  assert.ok(recs.every((r) => obtenerStockProducto(r) > 0), 'No debe incluir productos agotados');

  // Categoría con 1 solo producto devuelve vacío
  const recsUnico = obtenerRecomendacionesRelacionadas(productosBase[6], productosBase, 4);
  assert.equal(recsUnico.length, 0);
});

// HU32 · Centro de ayuda y soporte
test('HU32: valida pedido y >= 15 caracteres, crea caso Abierto y simula respuesta', () => {
  const inval = crearTicketSoporte([], {
    pedidoCodigo: 'PED-1',
    motivo: 'Entrega',
    descripcion: 'Corto',
  });
  assert.equal(inval.ok, false);

  const creado = crearTicketSoporte([], {
    pedidoCodigo: 'UNSC-2552-DEMO-01',
    motivo: 'Entrega',
    descripcion: 'Necesito confirmar el horario de entrega simulado para hoy.',
  });
  assert.equal(creado.ok, true);
  assert.equal(creado.ticket.estado, 'Abierto');

  const resp = simularRespuestaTicket(creado.tickets, creado.ticket.id);
  assert.equal(resp.ok, true);
  assert.equal(resp.tickets[0].estado, 'Respondido');
});

// HU33, HU34, HU35 · Opcionales
test('HU33/HU34/HU35: temas alto contraste, devolución solo en Entregado y compartir sin URL falsa', () => {
  assert.ok(TEMAS_APP.oscuro && TEMAS_APP.claro);
  assert.notEqual(TEMAS_APP.oscuro.fondo, TEMAS_APP.claro.fondo);

  assert.equal(solicitarDevolucionPedido(PEDIDOS_INICIALES_V2[0], 'Prueba').ok, false);
  const devOk = solicitarDevolucionPedido(PEDIDOS_INICIALES_V2[2], 'Talla incorrecta');
  assert.equal(devOk.ok, true);
  assert.equal(devOk.pedido.devolucionSolicitada, true);

  const msg = generarTextoCompartirProducto(productosBase[0], productosBase[0].variantes[0]);
  assert.match(msg, /Armadura Mjolnir/);
  assert.match(msg, /\$185\.000/);
  assert.doesNotMatch(msg, /https?:\/\//);
});

console.log(`\n✅ TODAS LAS PRUEBAS PASARON (${pruebasEjecutadas}/${pruebasEjecutadas})`);
