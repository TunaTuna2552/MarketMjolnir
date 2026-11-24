// ============================================================================
// MARKET MJOLNIR 2.0 · REGLAS DE NEGOCIO PURAS (HU21–HU35)
// Todas las operaciones devuelven copias nuevas (actualización inmutable).
// ============================================================================

import {
  ESTADO_CANCELADO,
  FLUJO_ESTADOS_PEDIDO,
  MODALIDADES_ENVIO,
  REGLAS_V2,
  TARIFAS_ENVIO_V2,
} from '../data/constantesV2';

export function formatearFechaHoraActual() {
  const ahora = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())} ${pad(
    ahora.getHours()
  )}:${pad(ahora.getMinutes())}`;
}

export function formatearCOPSeguro(valor) {
  const numeroSeguro = Number.isFinite(Number(valor)) ? Math.max(0, Math.round(Number(valor))) : 0;
  const conPuntos = numeroSeguro.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${conPuntos}`;
}

// ============================================================================
// HU21 · VARIANTES Y UNA SOLA FUENTE DE STOCK
// ============================================================================

export function obtenerStockProducto(producto) {
  if (!producto) return 0;
  if (Array.isArray(producto.variantes) && producto.variantes.length > 0) {
    return producto.variantes.reduce(
      (acum, v) => acum + Math.max(0, Number(v.stock) || 0),
      0
    );
  }
  return Math.max(0, Number(producto.stock) || 0);
}

export function tieneMultiplesVariantes(producto) {
  return Array.isArray(producto?.variantes) && producto.variantes.length > 1;
}

export function obtenerVarianteProducto(producto, varianteId) {
  if (!producto || !Array.isArray(producto.variantes) || producto.variantes.length === 0) {
    return null;
  }
  if (varianteId) {
    return producto.variantes.find((v) => v.id === varianteId) || null;
  }
  return producto.variantes.length === 1 ? producto.variantes[0] : null;
}

export function construirClaveCarrito(productoId, varianteId) {
  return `${productoId}::${varianteId || 'UNICA'}`;
}

export function sincronizarStockDesdeVariantes(producto, variantesActualizadas) {
  const limpias = (variantesActualizadas || []).map((v) => ({
    ...v,
    stock: Math.max(0, Math.round(Number(v.stock) || 0)),
    precio: Math.max(1, Math.round(Number(v.precio) || producto.precio || 1)),
  }));
  const stockTotal = limpias.reduce((acum, v) => acum + v.stock, 0);
  return {
    ...producto,
    variantes: limpias,
    stock: stockTotal,
    disponibilidad: stockTotal > 0 ? 'Disponible' : 'Agotado',
  };
}

export function normalizarProductosV2(productos, productosBase = []) {
  if (!Array.isArray(productos)) return [];
  return productos.map((prod) => {
    const plantilla = productosBase.find((b) => b.id === prod.id);
    const variantes =
      Array.isArray(prod.variantes) && prod.variantes.length > 0
        ? prod.variantes
        : plantilla?.variantes
        ? plantilla.variantes
        : [
            {
              id: `VAR-${prod.id}-U`,
              etiqueta: 'Estándar',
              precio: prod.precio,
              stock: Math.max(0, Number(prod.stock) || 0),
            },
          ];

    const sincronizado = sincronizarStockDesdeVariantes(
      {
        ...prod,
        marca: prod.marca || plantilla?.marca || 'Materials Group UNSC',
        precioBase: prod.precioBase || prod.precio,
      },
      variantes
    );
    return sincronizado;
  });
}

export function descontarStockPorItems(productos, items) {
  return productos.map((prod) => {
    const itemsProducto = (items || []).filter((it) => (it.productoId || it.id) === prod.id);
    if (itemsProducto.length === 0) return prod;

    const nuevasVariantes = (prod.variantes || []).map((v) => {
      const descuento = itemsProducto
        .filter((it) => it.varianteId === v.id)
        .reduce((acc, it) => acc + Math.max(0, Number(it.cantidad) || 0), 0);
      if (descuento === 0) return v;
      return { ...v, stock: Math.max(0, v.stock - descuento) };
    });

    return sincronizarStockDesdeVariantes(prod, nuevasVariantes);
  });
}

export function restituirStockPorItems(productos, items) {
  return productos.map((prod) => {
    const itemsProducto = (items || []).filter((it) => (it.productoId || it.id) === prod.id);
    if (itemsProducto.length === 0) return prod;

    const nuevasVariantes = (prod.variantes || []).map((v) => {
      const reintegro = itemsProducto
        .filter((it) => it.varianteId === v.id)
        .reduce((acc, it) => acc + Math.max(0, Number(it.cantidad) || 0), 0);
      if (reintegro === 0) return v;
      return { ...v, stock: Math.max(0, v.stock + reintegro) };
    });

    return sincronizarStockDesdeVariantes(prod, nuevasVariantes);
  });
}

export function reponerStockVariante(
  productos,
  productoId,
  varianteId,
  unidades = REGLAS_V2.UNIDADES_REPOSICION_DEMO
) {
  const incremento = Math.max(1, Math.round(Number(unidades) || 1));
  return productos.map((prod) => {
    if (prod.id !== productoId) return prod;
    const nuevasVariantes = (prod.variantes || []).map((v) =>
      v.id === varianteId ? { ...v, stock: Math.max(0, v.stock + incremento) } : v
    );
    return sincronizarStockDesdeVariantes(prod, nuevasVariantes);
  });
}

// ============================================================================
// HU22 · COMPARADOR DE PRODUCTOS (2 a 3 productos)
// ============================================================================

export function toggleComparacion(listaIds, productoId, max = REGLAS_V2.MAX_COMPARACION) {
  const actual = Array.isArray(listaIds) ? listaIds : [];
  if (actual.includes(productoId)) {
    return {
      ok: true,
      accion: 'retirado',
      lista: actual.filter((id) => id !== productoId),
      mensaje: 'Producto retirado del comparador sin alterar carrito ni favoritos.',
    };
  }
  if (actual.length >= max) {
    return {
      ok: false,
      accion: 'limite',
      lista: actual,
      mensaje: `Límite máximo alcanzado: solo puedes comparar hasta ${max} productos simultáneamente.`,
    };
  }
  return {
    ok: true,
    accion: 'agregado',
    lista: [...actual, productoId],
    mensaje: `Producto añadido al comparador (${actual.length + 1}/${max}).`,
  };
}

// ============================================================================
// HU23 · FILTROS COMBINADOS DE CATÁLOGO
// ============================================================================

export function obtenerMarcasDisponibles(productos) {
  const marcas = new Set();
  (productos || []).forEach((p) => {
    if (p.marca && p.marca.trim()) {
      marcas.add(p.marca.trim());
    }
  });
  return ['Todas', ...Array.from(marcas).sort((a, b) => a.localeCompare(b))];
}

export function validarRangoPrecio(minTexto = '', maxTexto = '') {
  const minStr = String(minTexto ?? '').trim();
  const maxStr = String(maxTexto ?? '').trim();

  const minVal = minStr === '' ? null : Number(minStr);
  const maxVal = maxStr === '' ? null : Number(maxStr);

  if (minVal !== null && (!Number.isFinite(minVal) || minVal < 0)) {
    return {
      valido: false,
      min: null,
      max: null,
      error: 'El precio mínimo debe ser un número mayor o igual a $0.',
    };
  }
  if (maxVal !== null && (!Number.isFinite(maxVal) || maxVal < 0)) {
    return {
      valido: false,
      min: null,
      max: null,
      error: 'El precio máximo debe ser un número mayor o igual a $0.',
    };
  }
  if (minVal !== null && maxVal !== null && minVal > maxVal) {
    return {
      valido: false,
      min: null,
      max: null,
      error:
        'Rango inválido: el precio mínimo no puede ser mayor que el precio máximo. No se aplicó el rango.',
    };
  }

  return { valido: true, min: minVal, max: maxVal, error: '' };
}

export function aplicarFiltrosCatalogo(
  productos,
  {
    busqueda = '',
    categoria = 'Todas',
    marca = 'Todas',
    precioMin = null,
    precioMax = null,
    soloDisponibles = false,
    ordenPrecio = 'ninguno',
  } = {}
) {
  if (precioMin !== null && precioMax !== null && precioMin > precioMax) {
    return {
      valido: false,
      error: 'Rango de precios inválido (mínimo mayor que máximo).',
      resultados: [],
    };
  }

  const termino = String(busqueda || '').trim().toLowerCase();

  let lista = (productos || []).filter((prod) => {
    const stockTotal = obtenerStockProducto(prod);
    const coincideBusqueda =
      termino.length === 0 ||
      prod.nombre.toLowerCase().includes(termino) ||
      (prod.marca || '').toLowerCase().includes(termino) ||
      (prod.descripcion || '').toLowerCase().includes(termino);

    const coincideCategoria = categoria === 'Todas' || prod.categoria === categoria;
    const coincideMarca = marca === 'Todas' || prod.marca === marca;
    const coincideMin = precioMin === null || prod.precio >= precioMin;
    const coincideMax = precioMax === null || prod.precio <= precioMax;
    const coincideDisp = !soloDisponibles || stockTotal > 0;

    return (
      coincideBusqueda &&
      coincideCategoria &&
      coincideMarca &&
      coincideMin &&
      coincideMax &&
      coincideDisp
    );
  });

  if (ordenPrecio === 'asc') {
    lista = [...lista].sort((a, b) => a.precio - b.precio);
  } else if (ordenPrecio === 'desc') {
    lista = [...lista].sort((a, b) => b.precio - a.precio);
  }

  return { valido: true, error: '', resultados: lista };
}

// ============================================================================
// HU24 · PREGUNTAS FRECUENTES DEL PRODUCTO (CON RESPUESTA SIMULADA)
// ============================================================================

export function validarPreguntaProducto(texto) {
  const limpio = String(texto || '').trim();
  if (limpio.length === 0) {
    return {
      valido: false,
      mensaje: 'Escribe una pregunta antes de enviarla (mínimo 10 caracteres).',
    };
  }
  if (limpio.length < REGLAS_V2.MIN_CHARS_PREGUNTA) {
    return {
      valido: false,
      mensaje: `La pregunta es demasiado corta (${limpio.length}/${REGLAS_V2.MIN_CHARS_PREGUNTA} caracteres mínimos).`,
    };
  }
  return { valido: true, textoLimpio: limpio, mensaje: '' };
}

export function generarRespuestaSimuladaPregunta(producto, textoPregunta) {
  const nombre = producto?.nombre || 'este suministro';
  const stock = obtenerStockProducto(producto);
  const disponibilidadTxt =
    stock > 0
      ? `actualmente cuenta con ${stock} unidad(es) disponibles`
      : 'actualmente está agotado, pero puedes activar el aviso de reposición';
  return `[Respuesta simulada · Modo demostración] Sobre "${nombre}": respecto a tu consulta ("${textoPregunta.slice(
    0,
    60
  )}${textoPregunta.length > 60 ? '...' : ''}"), este artículo de ${
    producto?.marca || 'Market Mjolnir'
  } ${disponibilidadTxt}. Nota: mensaje generado automáticamente para fines académicos, no corresponde a una persona real.`;
}

// ============================================================================
// HU25 · LIBRETA DE DIRECCIONES FICTICIAS
// ============================================================================

export function validarDireccion({ alias, municipio, descripcion }) {
  const a = String(alias || '').trim();
  const m = String(municipio || '').trim();
  const d = String(descripcion || '').trim();

  if (a.length < 3) {
    return { valido: false, mensaje: 'El alias de la dirección debe tener al menos 3 caracteres.' };
  }
  if (m.length < 3) {
    return { valido: false, mensaje: 'Selecciona o ingresa un municipio válido.' };
  }
  if (d.length < 8) {
    return {
      valido: false,
      mensaje: 'La referencia de entrega ficticia debe tener al menos 8 caracteres.',
    };
  }
  return { valido: true, mensaje: '' };
}

export function marcarDireccionPrincipal(direcciones, direccionId) {
  return (direcciones || []).map((dir) => ({
    ...dir,
    principal: dir.id === direccionId,
  }));
}

export function guardarDireccionEnLista(direcciones, datos, editandoId = null) {
  const validacion = validarDireccion(datos);
  if (!validacion.valido) {
    return { ok: false, mensaje: validacion.mensaje, direcciones, guardada: null };
  }

  const aliasLimpio = datos.alias.trim();
  const municipioLimpio = datos.municipio.trim();
  const descripcionLimpia = datos.descripcion.trim();
  const quierePrincipal = Boolean(datos.principal) || (direcciones || []).length === 0;

  if (editandoId) {
    let lista = (direcciones || []).map((dir) => {
      if (dir.id !== editandoId) {
        return quierePrincipal ? { ...dir, principal: false } : dir;
      }
      return {
        ...dir,
        alias: aliasLimpio,
        municipio: municipioLimpio,
        descripcion: descripcionLimpia,
        principal: quierePrincipal || dir.principal,
      };
    });

    // Garantizar que siempre exista exactamente una principal si alguna quedó marcada
    if (!lista.some((d) => d.principal) && lista.length > 0) {
      lista = marcarDireccionPrincipal(lista, lista[0].id);
    }

    const guardada = lista.find((d) => d.id === editandoId) || null;
    return { ok: true, mensaje: 'Dirección actualizada sin duplicar registros.', direcciones: lista, guardada };
  }

  const nueva = {
    id: `DIR-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    alias: aliasLimpio,
    municipio: municipioLimpio,
    descripcion: descripcionLimpia,
    principal: quierePrincipal,
  };

  let lista = quierePrincipal
    ? (direcciones || []).map((d) => ({ ...d, principal: false }))
    : [...(direcciones || [])];
  lista = [nueva, ...lista];

  return { ok: true, mensaje: 'Nueva dirección ficticia registrada.', direcciones: lista, guardada: nueva };
}

// ============================================================================
// HU26 · ESTIMADOR DE COSTO Y PLAZO DE ENVÍO (SIN DUPLICAR CARGOS)
// ============================================================================

export function calcularEnvioV2(direccion, modalidadId) {
  if (!direccion) {
    return {
      disponible: false,
      faltanDatos: true,
      costo: 0,
      plazo: '',
      mensaje: 'Selecciona una dirección de entrega para calcular el envío.',
    };
  }
  if (!modalidadId || !MODALIDADES_ENVIO.some((m) => m.id === modalidadId)) {
    return {
      disponible: false,
      faltanDatos: true,
      costo: 0,
      plazo: '',
      mensaje: 'Selecciona una modalidad de envío (Estándar o Exprés).',
    };
  }

  const tarifasMun = TARIFAS_ENVIO_V2[direccion.municipio];
  if (!tarifasMun) {
    return {
      disponible: false,
      faltanDatos: false,
      requiereAjusteManual: true,
      costo: 0,
      plazo: 'Por confirmar',
      mensaje: `Sin tarifa automática para "${direccion.municipio}". Solicita ajuste manual o elige Mosquera, Funza o Madrid.`,
    };
  }

  const tarifa = tarifasMun[modalidadId];
  const nombreMod = modalidadId === 'expres' ? 'Exprés' : 'Estándar';

  return {
    disponible: true,
    faltanDatos: false,
    requiereAjusteManual: false,
    costo: tarifa.costo,
    plazo: tarifa.plazo,
    mensaje: `${direccion.municipio} · Envío ${nombreMod}: ${formatearCOPSeguro(
      tarifa.costo
    )} COP (${tarifa.plazo})`,
  };
}

export function calcularResumenCarritoV2(carrito, cuponAplicado = null, envioInfo = null) {
  if (!Array.isArray(carrito) || carrito.length === 0) {
    return {
      totalUnidades: 0,
      subtotal: 0,
      descuento: 0,
      envio: 0,
      plazoEnvio: '',
      total: 0,
    };
  }

  const totalUnidades = carrito.reduce((acum, item) => acum + (Number(item.cantidad) || 0), 0);
  const subtotal = carrito.reduce(
    (acum, item) => acum + (Number(item.precio) || 0) * (Number(item.cantidad) || 0),
    0
  );

  const descuento =
    cuponAplicado === 'BIENVENIDO10' ? Math.round(subtotal * 0.1) : 0;

  // El costo de envío se toma directamente del cálculo único por municipio/modalidad (nunca se suma dos veces).
  const costoEnvio = envioInfo && envioInfo.disponible ? Number(envioInfo.costo) || 0 : 0;
  const total = Math.max(0, subtotal - descuento + costoEnvio);

  return {
    totalUnidades,
    subtotal,
    descuento,
    envio: costoEnvio,
    plazoEnvio: envioInfo?.plazo || '',
    total,
  };
}

// ============================================================================
// HU27, HU28 & HU34 · MÁQUINA DE ESTADOS, CANCELACIÓN CONTROLADA Y DEVOLUCIÓN
// ============================================================================

export function obtenerSiguienteEstadoPedido(estadoActual) {
  if (!estadoActual || estadoActual === ESTADO_CANCELADO) return null;
  const indice = FLUJO_ESTADOS_PEDIDO.indexOf(estadoActual);
  if (indice === -1 || indice >= FLUJO_ESTADOS_PEDIDO.length - 1) return null;
  return FLUJO_ESTADOS_PEDIDO[indice + 1];
}

export function avanzarEstadoPedido(pedido, fecha = formatearFechaHoraActual()) {
  if (!pedido) {
    return { ok: false, mensaje: 'Pedido no encontrado.', pedido };
  }
  const siguiente = obtenerSiguienteEstadoPedido(pedido.estado);
  if (!siguiente) {
    return {
      ok: false,
      mensaje: `No se permiten nuevas transiciones porque el pedido está en estado final "${pedido.estado}".`,
      pedido,
    };
  }

  const nuevoEvento = {
    estado: siguiente,
    fecha,
    detalle: `Avance simulado hacia "${siguiente}".`,
  };

  const actualizado = {
    ...pedido,
    estado: siguiente,
    historialEstados: [...(pedido.historialEstados || []), nuevoEvento],
  };

  return {
    ok: true,
    nuevoEstado: siguiente,
    mensaje: `Pedido ${pedido.codigo} actualizado a "${siguiente}" (simulación).`,
    pedido: actualizado,
  };
}

export function evaluarCancelacionPedido(pedido) {
  if (!pedido) return { permitida: false, razon: 'Pedido no encontrado.' };
  if (pedido.estado === ESTADO_CANCELADO) {
    return {
      permitida: false,
      razon: 'Este pedido ya fue cancelado. No se permiten cancelaciones repetidas.',
    };
  }
  if (pedido.estado === 'En camino' || pedido.estado === 'Entregado') {
    return {
      permitida: false,
      razon: `No es posible cancelar el pedido porque ya se encuentra en estado "${pedido.estado}".`,
    };
  }
  if (pedido.estado !== 'Confirmado' && pedido.estado !== 'Preparando') {
    return {
      permitida: false,
      razon: `Estado "${pedido.estado}" no admite cancelación.`,
    };
  }
  return { permitida: true, razon: '' };
}

export function cancelarPedidoControlado(
  pedido,
  productos,
  fecha = formatearFechaHoraActual()
) {
  const evaluacion = evaluarCancelacionPedido(pedido);
  if (!evaluacion.permitida) {
    return {
      ok: false,
      mensaje: evaluacion.razon,
      pedido,
      productos,
      reintegroEjecutado: false,
    };
  }

  const debeRestituir = !pedido.stockRestituido;
  const productosActualizados = debeRestituir
    ? restituirStockPorItems(productos, pedido.articulos || [])
    : productos;

  const eventoCancelacion = {
    estado: ESTADO_CANCELADO,
    fecha,
    detalle: debeRestituir
      ? 'Cancelación lógica confirmada por comprador; inventario restituido por variante.'
      : 'Cancelación lógica confirmada.',
  };

  const pedidoActualizado = {
    ...pedido,
    estado: ESTADO_CANCELADO,
    stockRestituido: true,
    historialEstados: [...(pedido.historialEstados || []), eventoCancelacion],
  };

  return {
    ok: true,
    mensaje: `Pedido ${pedido.codigo} cancelado lógicamente. Stock restituido una sola vez.`,
    pedido: pedidoActualizado,
    productos: productosActualizados,
    reintegroEjecutado: debeRestituir,
  };
}

export function evaluarDevolucionPedido(pedido) {
  if (!pedido) return { permitida: false, razon: 'Pedido no encontrado.' };
  if (pedido.devolucionSolicitada) {
    return {
      permitida: false,
      razon: 'Ya registraste una solicitud de devolución simulada para este pedido.',
    };
  }
  if (pedido.estado !== 'Entregado') {
    return {
      permitida: false,
      razon: `La devolución simulada solo está habilitada para pedidos "Entregado" (estado actual: "${pedido.estado}").`,
    };
  }
  return { permitida: true, razon: '' };
}

export function solicitarDevolucionPedido(
  pedido,
  motivo = 'Inconformidad simulada con el pedido',
  fecha = formatearFechaHoraActual()
) {
  const evaluacion = evaluarDevolucionPedido(pedido);
  if (!evaluacion.permitida) {
    return { ok: false, mensaje: evaluacion.razon, pedido };
  }

  const motivoLimpio = String(motivo || '').trim() || 'Inconformidad simulada con el pedido';
  const actualizado = {
    ...pedido,
    devolucionSolicitada: true,
    motivoDevolucion: motivoLimpio,
    fechaDevolucion: fecha,
    historialEstados: [
      ...(pedido.historialEstados || []),
      {
        estado: 'Devolución solicitada (simulada)',
        fecha,
        detalle: `Motivo: ${motivoLimpio}`,
      },
    ],
  };

  return {
    ok: true,
    mensaje: `Solicitud de devolución simulada registrada para el pedido ${pedido.codigo}.`,
    pedido: actualizado,
  };
}

// ============================================================================
// HU29 · CENTRO DE NOTIFICACIONES INTERNO (SIN DUPLICADOS)
// ============================================================================

export function agregarNotificacionUnica(
  notificaciones,
  { claveEvento, tipo = 'info', mensaje, referenciaId = '', fecha = formatearFechaHoraActual() }
) {
  const lista = Array.isArray(notificaciones) ? notificaciones : [];
  if (claveEvento && lista.some((n) => n.claveEvento === claveEvento)) {
    return { agregada: false, lista };
  }
  const nueva = {
    id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    claveEvento: claveEvento || `EV-${Date.now()}`,
    tipo,
    mensaje,
    referenciaId,
    fecha,
    leida: false,
  };
  return { agregada: true, lista: [nueva, ...lista], notificacion: nueva };
}

export function marcarNotificacionLeida(notificaciones, id) {
  return (notificaciones || []).map((n) => (n.id === id ? { ...n, leida: true } : n));
}

// ============================================================================
// HU30 · AVISOS DE REPOSICIÓN DE PRODUCTOS (SUSCRIPCIÓN ÚNICA)
// ============================================================================

export function suscribirReposicion(
  suscripciones,
  { productoId, varianteId, productoNombre, varianteEtiqueta, fecha = formatearFechaHoraActual() }
) {
  const lista = Array.isArray(suscripciones) ? suscripciones : [];
  const existe = lista.some(
    (s) => s.productoId === productoId && s.varianteId === varianteId && s.activa
  );
  if (existe) {
    return {
      ok: false,
      duplicada: true,
      lista,
      mensaje: 'Ya tienes una suscripción activa de aviso para esta variante.',
    };
  }

  const sinPrevias = lista.filter(
    (s) => !(s.productoId === productoId && s.varianteId === varianteId)
  );
  const nueva = {
    id: `SUS-${productoId}-${varianteId}`,
    productoId,
    varianteId,
    productoNombre,
    varianteEtiqueta,
    activa: true,
    fecha,
  };

  return {
    ok: true,
    duplicada: false,
    lista: [nueva, ...sinPrevias],
    mensaje: `Aviso activado: te notificaremos dentro de la app cuando "${productoNombre} (${varianteEtiqueta})" tenga stock.`,
  };
}

export function cancelarSuscripcionReposicion(suscripciones, productoId, varianteId) {
  const lista = (suscripciones || []).filter(
    (s) => !(s.productoId === productoId && s.varianteId === varianteId)
  );
  return {
    ok: true,
    lista,
    mensaje: 'Suscripción de reposición cancelada. No se generará aviso al reponer stock.',
  };
}

export function ejecutarReposicionSimulada({
  productos,
  suscripciones,
  notificaciones,
  productoId,
  varianteId,
  unidades = REGLAS_V2.UNIDADES_REPOSICION_DEMO,
  fecha = formatearFechaHoraActual(),
}) {
  const productosActualizados = reponerStockVariante(
    productos,
    productoId,
    varianteId,
    unidades
  );
  const prod = productosActualizados.find((p) => p.id === productoId);
  const varObj = prod?.variantes?.find((v) => v.id === varianteId);

  const suscripcionActiva = (suscripciones || []).find(
    (s) => s.productoId === productoId && s.varianteId === varianteId && s.activa
  );

  let notificacionesActualizadas = notificaciones || [];
  let suscripcionesActualizadas = suscripciones || [];
  let avisoGenerado = false;

  if (suscripcionActiva && prod && varObj) {
    const resNotif = agregarNotificacionUnica(notificacionesActualizadas, {
      claveEvento: `REPOSICION-${productoId}-${varianteId}-${varObj.stock}`,
      tipo: 'reposicion',
      referenciaId: productoId,
      fecha,
      mensaje: `[Reposición simulada] "${prod.nombre} (${varObj.etiqueta})" volvió a tener stock (${varObj.stock} uds.).`,
    });
    notificacionesActualizadas = resNotif.lista;
    avisoGenerado = resNotif.agregada;
    suscripcionesActualizadas = (suscripciones || []).filter(
      (s) => !(s.productoId === productoId && s.varianteId === varianteId)
    );
  }

  return {
    productos: productosActualizados,
    suscripciones: suscripcionesActualizadas,
    notificaciones: notificacionesActualizadas,
    avisoGenerado,
    stockNuevo: varObj ? varObj.stock : 0,
  };
}

// ============================================================================
// HU31 · RECOMENDACIONES RELACIONADAS
// ============================================================================

export function obtenerRecomendacionesRelacionadas(
  productoActual,
  productos,
  limite = REGLAS_V2.MAX_RECOMENDACIONES
) {
  if (!productoActual) return [];
  return (productos || [])
    .filter(
      (p) =>
        p.id !== productoActual.id &&
        p.categoria === productoActual.categoria &&
        obtenerStockProducto(p) > 0
    )
    .map((p) => ({
      ...p,
      variantesDisponibles: (p.variantes || []).filter((v) => v.stock > 0),
    }))
    .slice(0, limite);
}

// ============================================================================
// HU32 · CENTRO DE AYUDA Y SOLICITUDES DE SOPORTE
// ============================================================================

export function validarTicketSoporte({ pedidoCodigo, motivo, descripcion }) {
  if (!pedidoCodigo || String(pedidoCodigo).trim().length === 0) {
    return {
      valido: false,
      mensaje: 'Debes seleccionar un pedido del historial para registrar la solicitud.',
    };
  }
  if (!motivo || String(motivo).trim().length === 0) {
    return { valido: false, mensaje: 'Selecciona un motivo (Entrega, Producto u Otro).' };
  }
  const desc = String(descripcion || '').trim();
  if (desc.length < REGLAS_V2.MIN_CHARS_SOPORTE) {
    return {
      valido: false,
      mensaje: `Describe el inconveniente con al menos ${REGLAS_V2.MIN_CHARS_SOPORTE} caracteres (actual: ${desc.length}).`,
    };
  }
  return { valido: true, mensaje: '' };
}

export function crearTicketSoporte(tickets, { pedidoCodigo, motivo, descripcion, fecha = formatearFechaHoraActual() }) {
  const validacion = validarTicketSoporte({ pedidoCodigo, motivo, descripcion });
  if (!validacion.valido) {
    return { ok: false, mensaje: validacion.mensaje, tickets, ticket: null };
  }

  const lista = Array.isArray(tickets) ? tickets : [];
  const consecutivo = String(lista.length + 1).padStart(3, '0');
  const sufijo = Math.floor(100 + Math.random() * 900);
  const nuevo = {
    id: `CASO-${consecutivo}-${sufijo}`,
    pedidoCodigo,
    motivo,
    descripcion: descripcion.trim(),
    estado: 'Abierto',
    respuestaSimulada: '',
    fecha,
  };

  return {
    ok: true,
    mensaje: `Solicitud ${nuevo.id} creada en estado "Abierto".`,
    tickets: [nuevo, ...lista],
    ticket: nuevo,
  };
}

export function simularRespuestaTicket(tickets, ticketId, fecha = formatearFechaHoraActual()) {
  const objetivo = (tickets || []).find((t) => t.id === ticketId);
  if (!objetivo) {
    return { ok: false, mensaje: 'Caso no encontrado.', tickets };
  }
  if (objetivo.estado === 'Respondido') {
    return { ok: false, mensaje: 'Este caso ya tiene una respuesta simulada.', tickets };
  }

  const respuesta = `[Respuesta simulada de soporte · ${fecha}] Recibimos tu caso ${objetivo.id} sobre el pedido ${objetivo.pedidoCodigo} (motivo: ${objetivo.motivo}). Nuestro equipo académico registró el seguimiento de prueba.`;

  const actualizados = (tickets || []).map((t) =>
    t.id === ticketId ? { ...t, estado: 'Respondido', respuestaSimulada: respuesta } : t
  );

  return {
    ok: true,
    mensaje: `Caso ${ticketId} actualizado a "Respondido" (respuesta ficticia de prueba).`,
    tickets: actualizados,
  };
}

// ============================================================================
// HU35 · COMPARTIR RESUMEN DE PRODUCTO (SIN URL PÚBLICA FALSA)
// ============================================================================

export function generarTextoCompartirProducto(producto, variante = null) {
  if (!producto) return '';
  const precio = variante ? variante.precio : producto.precio;
  const varianteTxt = variante ? ` · Variante: ${variante.etiqueta}` : '';
  return `🛡️ ${producto.nombre}${varianteTxt}\n🏷️ Marca: ${
    producto.marca || 'Market Mjolnir'
  }\n💰 Precio: ${formatearCOPSeguro(precio)} COP\n📦 Recomendado desde la app local Market Mjolnir (prototipo académico sin enlace público en línea).`;
}
