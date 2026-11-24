// ============================================================================
// MARKET MJOLNIR · REGLAS DE NEGOCIO, VALIDACIONES Y PERSISTENCIA LOCAL (v2.0)
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MARCA_INFO } from '../data/catalogoHalo';
import { normalizarProductosV2 } from './reglasV2';

const STORAGE_KEY = '@market_mjolnir_unsc_state_v2';

/**
 * Formatea un número entero positivo a pesos colombianos (COP) sin decimales.
 */
export function formatearCOP(valor) {
  const numeroSeguro = Number.isFinite(Number(valor)) ? Math.max(0, Math.round(Number(valor))) : 0;
  const conPuntos = numeroSeguro.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${conPuntos}`;
}

/**
 * Compatibilidad Taller 4 (HU11 y HU17).
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

  const descuento =
    cuponAplicado === MARCA_INFO.cuponValido.codigo
      ? Math.round(subtotal * (MARCA_INFO.cuponValido.porcentajeDescuento / 100))
      : 0;

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

export function validarFormularioComprador({ nombre, telefono, municipio, direccion }) {
  const faltantes = [];

  if (!nombre || nombre.trim().length === 0) {
    faltantes.push('Nombre completo');
  }
  if (!telefono || telefono.trim().length === 0) {
    faltantes.push('Teléfono de contacto');
  }
  if (!municipio || municipio.trim().length === 0) {
    faltantes.push('Municipio');
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
  if (precioTexto === '' || !Number.isInteger(precioNumero) || precioNumero <= 0) {
    return {
      valido: false,
      mensaje: 'Error: El precio debe ser un número entero positivo mayor a $0 COP (sin decimales).',
    };
  }

  const stockNumero = Number(stockTexto);
  if (stockTexto === '' || !Number.isInteger(stockNumero) || stockNumero < 0) {
    return {
      valido: false,
      mensaje: 'Error: El stock debe ser un número entero no negativo (0 o mayor).',
    };
  }

  if (!descripcion || descripcion.trim().length < 15) {
    return {
      valido: false,
      mensaje: 'La descripción táctica debe tener al menos 15 caracteres.',
    };
  }

  return {
    valido: true,
    precio: precioNumero,
    stock: stockNumero,
    mensaje: 'Suministro validado.',
  };
}

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

function sanitizarEstadoRecuperado(parsed, productosPorDefecto) {
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

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
      productosSeguros = normalizarProductosV2(parsed.productos, productosPorDefecto);
    }
  }

  let carritoSeguro = [];
  if (Array.isArray(parsed.carrito)) {
    carritoSeguro = parsed.carrito.filter(
      (item) =>
        item &&
        typeof (item.productoId || item.id) === 'string' &&
        typeof item.nombre === 'string' &&
        Number.isInteger(item.precio) &&
        item.precio > 0 &&
        Number.isInteger(item.cantidad) &&
        item.cantidad > 0
    );
  }

  const favoritosSeguros = Array.isArray(parsed.favoritos)
    ? parsed.favoritos.filter((id) => typeof id === 'string')
    : [];

  const historialSeguro = Array.isArray(parsed.historialPedidos)
    ? parsed.historialPedidos.filter(
        (ped) =>
          ped &&
          typeof ped.codigo === 'string' &&
          Array.isArray(ped.articulos) &&
          Number.isFinite(ped.total) &&
          ped.total >= 0
      )
    : null;

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
    comparacion: Array.isArray(parsed.comparacion)
      ? parsed.comparacion.filter((id) => typeof id === 'string').slice(0, 3)
      : [],
    direcciones: Array.isArray(parsed.direcciones) ? parsed.direcciones : null,
    direccionSeleccionadaId:
      typeof parsed.direccionSeleccionadaId === 'string' || parsed.direccionSeleccionadaId === null
        ? parsed.direccionSeleccionadaId
        : undefined,
    modalidadEnvio:
      parsed.modalidadEnvio === 'estandar' || parsed.modalidadEnvio === 'expres'
        ? parsed.modalidadEnvio
        : undefined,
    consultas: Array.isArray(parsed.consultas) ? parsed.consultas : null,
    notificaciones: Array.isArray(parsed.notificaciones) ? parsed.notificaciones : [],
    suscripcionesReposicion: Array.isArray(parsed.suscripcionesReposicion)
      ? parsed.suscripcionesReposicion
      : [],
    ticketsSoporte: Array.isArray(parsed.ticketsSoporte) ? parsed.ticketsSoporte : [],
    modoOscuro: typeof parsed.modoOscuro === 'boolean' ? parsed.modoOscuro : false,
    letraGrande: typeof parsed.letraGrande === 'boolean' ? parsed.letraGrande : false,
  };
}

export async function cargarEstadoLocal(productosPorDefecto) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return sanitizarEstadoRecuperado(parsed, productosPorDefecto);
  } catch (error) {
    return null;
  }
}

export async function guardarEstadoLocal(estado) {
  try {
    const payload = JSON.stringify({
      productos: estado.productos,
      carrito: estado.carrito,
      favoritos: estado.favoritos,
      historialPedidos: estado.historialPedidos,
      cuponAplicado: estado.cuponAplicado,
      comparacion: estado.comparacion,
      direcciones: estado.direcciones,
      direccionSeleccionadaId: estado.direccionSeleccionadaId,
      modalidadEnvio: estado.modalidadEnvio,
      consultas: estado.consultas,
      notificaciones: estado.notificaciones,
      suscripcionesReposicion: estado.suscripcionesReposicion,
      ticketsSoporte: estado.ticketsSoporte,
      modoOscuro: estado.modoOscuro,
      letraGrande: estado.letraGrande,
    });
    await AsyncStorage.setItem(STORAGE_KEY, payload);
  } catch (error) {
    // Falla silenciosa en caso de restricción de almacenamiento
  }
}

export async function limpiarEstadoLocal() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Ignorar error
  }
}
