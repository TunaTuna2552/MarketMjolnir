// ============================================================================
// MARKET MJOLNIR · REGLAS DE NEGOCIO, VALIDACIONES Y PERSISTENCIA LOCAL
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MARCA_INFO } from '../data/catalogoHalo';

const STORAGE_KEY = '@market_mjolnir_unsc_state_v1';

/**
 * Formatea un número entero positivo a pesos colombianos (COP) sin decimales.
 * Ejemplo: 185000 -> "$185.000 COP"
 */
export function formatearCOP(valor) {
  const numeroSeguro = Number.isFinite(Number(valor)) ? Math.max(0, Math.round(Number(valor))) : 0;
  const conPuntos = numeroSeguro.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${conPuntos}`;
}

/**
 * Calcula subtotal, descuento de cupón, costo de envío y total del carrito (HU11 y HU17).
 * Utiliza reduce() sobre el arreglo inmutable del carrito.
 */
export function calcularResumenCarrito(carrito, cuponAplicado = null) {
  if (!Array.isArray(carrito) || carrito.length === 0) {
    return {
      totalUnidades: 0,
      subtotal: 0,
      descuento: 0,
      envio: 0,
      total: 0,
      envioGratis: false,
    };
  }

  const totalUnidades = carrito.reduce((acum, item) => acum + item.cantidad, 0);
  const subtotal = carrito.reduce((acum, item) => acum + item.precio * item.cantidad, 0);

  // HU17: Cupón BIENVENIDO10 descuenta el 10% del subtotal sin valores negativos
  const descuento =
    cuponAplicado === MARCA_INFO.cuponValido.codigo
      ? Math.round(subtotal * (MARCA_INFO.cuponValido.porcentajeDescuento / 100))
      : 0;

  // HU11: Envío = $8.000 cuando subtotal < $150.000; Gratis ($0) cuando subtotal >= $150.000
  const envioGratis = subtotal >= MARCA_INFO.reglasEnvio.umbralEnvioGratis;
  const envio = envioGratis ? 0 : MARCA_INFO.reglasEnvio.costoEnvioEstandar;

  const total = Math.max(0, subtotal - descuento + envio);

  return {
    totalUnidades,
    subtotal,
    descuento,
    envio,
    total,
    envioGratis,
  };
}

/**
 * Calcula el promedio de estrellas de un arreglo de reseñas (HU19-CA03).
 */
export function calcularPromedioEstrellas(resenas) {
  if (!Array.isArray(resenas) || resenas.length === 0) {
    return { promedio: 0, texto: 'Sin reseñas', cantidad: 0 };
  }
  const suma = resenas.reduce((acc, r) => acc + Number(r.estrellas || 0), 0);
  const promedio = Math.round((suma / resenas.length) * 10) / 10;
  return {
    promedio,
    texto: `${promedio.toFixed(1)} ★ (${resenas.length})`,
    cantidad: resenas.length,
  };
}

/**
 * Valida los datos básicos del comprador antes de confirmar pedido (HU12).
 */
export function validarFormularioComprador({ nombre, telefono, municipio, direccion }) {
  const faltantes = [];

  if (!nombre || nombre.trim().length === 0) {
    faltantes.push('Nombre completo');
  }
  if (!telefono || telefono.trim().length === 0) {
    faltantes.push('Teléfono de contacto');
  }
  if (!municipio || municipio.trim().length === 0) {
    faltantes.push('Municipio (ej. Mosquera, Madrid, Funza)');
  }
  if (!direccion || direccion.trim().length === 0) {
    faltantes.push('Dirección de entrega');
  }

  if (faltantes.length > 0) {
    return {
      valido: false,
      camposFaltantes: faltantes,
      mensaje: `Faltan datos obligatorios para el despacho UNSC: ${faltantes.join(', ')}.`,
    };
  }

  return {
    valido: true,
    camposFaltantes: [],
    mensaje: 'Datos de comprador validados correctamente.',
  };
}

/**
 * Valida la creación o edición de un producto en el Panel de Vendedor (HU18).
 */
export function validarProductoVendedor({ nombre, categoria, precioTexto, stockTexto, descripcion }) {
  if (!nombre || nombre.trim().length < 3) {
    return {
      valido: false,
      mensaje: 'El nombre del suministro debe tener al menos 3 caracteres legibles.',
    };
  }

  if (!MARCA_INFO.categorias.includes(categoria)) {
    return {
      valido: false,
      mensaje: 'Debes seleccionar una de las cuatro categorías oficiales de Market Mjolnir.',
    };
  }

  const precioNumero = Number(precioTexto);
  if (
    precioTexto === '' ||
    !Number.isInteger(precioNumero) ||
    precioNumero <= 0
  ) {
    return {
      valido: false,
      mensaje: 'Error: El precio debe ser un número entero positivo mayor a $0 COP (sin decimales).',
    };
  }

  const stockNumero = Number(stockTexto);
  if (
    stockTexto === '' ||
    !Number.isInteger(stockNumero) ||
    stockNumero < 0
  ) {
    return {
      valido: false,
      mensaje: 'Error: El stock debe ser un número entero no negativo (0 o mayor). No se admite stock negativo.',
    };
  }

  if (!descripcion || descripcion.trim().length < 15) {
    return {
      valido: false,
      mensaje: 'La descripción táctica debe tener al menos 15 caracteres (Regla del modelo de producto).',
    };
  }

  return {
    valido: true,
    precio: precioNumero,
    stock: stockNumero,
    mensaje: 'Suministro validado.',
  };
}

/**
 * Valida una reseña ficticia (HU19: entero entre 1 y 5).
 */
export function validarValoracionResena(valorTexto, autorTexto, comentarioTexto) {
  const numero = Number(valorTexto);
  if (
    valorTexto === '' ||
    valorTexto === null ||
    valorTexto === undefined ||
    Number.isNaN(numero) ||
    !Number.isInteger(numero) ||
    numero < 1 ||
    numero > 5
  ) {
    return {
      valido: false,
      mensaje:
        'Error de validación (HU19-CA02): La calificación debe ser un número entero entre 1 y 5 estrellas.',
    };
  }

  return {
    valido: true,
    estrellas: numero,
    autor: autorTexto && autorTexto.trim().length > 0 ? autorTexto.trim() : 'Operador Spartan',
    comentario:
      comentarioTexto && comentarioTexto.trim().length > 0
        ? comentarioTexto.trim()
        : `Suministro calificado con ${numero} estrellas en pruebas de campo.`,
  };
}

/**
 * Sanitiza y valida datos recuperados de almacenamiento local para evitar
 * valores corruptos o inventarios negativos (HU20-CA02).
 */
function sanitizarEstadoRecuperado(parsed, productosPorDefecto) {
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  // Validar productos
  let productosSeguros = productosPorDefecto;
  if (Array.isArray(parsed.productos) && parsed.productos.length >= 12) {
    const todosValidos = parsed.productos.every(
      (p) =>
        p &&
        typeof p.id === 'string' &&
        typeof p.nombre === 'string' &&
        p.nombre.trim().length > 0 &&
        Number.isInteger(p.precio) &&
        p.precio > 0 &&
        Number.isInteger(p.stock) &&
        p.stock >= 0
    );
    if (todosValidos) {
      productosSeguros = parsed.productos;
    }
  }

  // Validar carrito (sin cantidades negativas ni precios corruptos)
  let carritoSeguro = [];
  if (Array.isArray(parsed.carrito)) {
    carritoSeguro = parsed.carrito.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.nombre === 'string' &&
        Number.isInteger(item.precio) &&
        item.precio > 0 &&
        Number.isInteger(item.cantidad) &&
        item.cantidad > 0
    );
  }

  // Validar favoritos
  let favoritosSeguros = [];
  if (Array.isArray(parsed.favoritos)) {
    favoritosSeguros = parsed.favoritos.filter((id) => typeof id === 'string');
  }

  // Validar historial de pedidos
  let historialSeguro = [];
  if (Array.isArray(parsed.historialPedidos)) {
    historialSeguro = parsed.historialPedidos.filter(
      (ped) =>
        ped &&
        typeof ped.codigo === 'string' &&
        Array.isArray(ped.articulos) &&
        Number.isFinite(ped.total) &&
        ped.total >= 0
    );
  }

  const cuponSeguro =
    parsed.cuponAplicado === MARCA_INFO.cuponValido.codigo
      ? MARCA_INFO.cuponValido.codigo
      : null;

  return {
    productos: productosSeguros,
    carrito: carritoSeguro,
    favoritos: favoritosSeguros,
    historialPedidos: historialSeguro,
    cuponAplicado: cuponSeguro,
  };
}

/**
 * Carga el estado desde AsyncStorage (o localStorage en web) de manera segura (HU20).
 */
export async function cargarEstadoLocal(productosPorDefecto) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return sanitizarEstadoRecuperado(parsed, productosPorDefecto);
  } catch (error) {
    // HU20-CA02 y CA03: Si hay corrupción o falla de lectura, usa estado inicial seguro
    return null;
  }
}

/**
 * Guarda el estado actual en AsyncStorage (HU20-CA01).
 */
export async function guardarEstadoLocal(estado) {
  try {
    const payload = JSON.stringify({
      productos: estado.productos,
      carrito: estado.carrito,
      favoritos: estado.favoritos,
      historialPedidos: estado.historialPedidos,
      cuponAplicado: estado.cuponAplicado,
    });
    await AsyncStorage.setItem(STORAGE_KEY, payload);
  } catch (error) {
    // Falla silenciosa en caso de restricción de almacenamiento
  }
}

/**
 * Borra el almacenamiento local para restaurar datos de fábrica en sustentación.
 */
export async function limpiarEstadoLocal() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Ignorar error
  }
}
