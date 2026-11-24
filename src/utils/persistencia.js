/**
 * MarketMjolnir - Utilidades de Formato, Validación y Persistencia Local (HU20)
 */

import { PRODUCTOS_INICIALES, CATEGORIAS_VENDEDOR } from '../data/productosIniciales.js';

const CLAVE_ALMACENAMIENTO = '@market_mjolnir_estado_v1';

// Respaldo en memoria de módulo para simular persistencia en entornos sin localStorage nativo
let respaldoMemoriaLocal = null;

/**
 * Formatea un número entero positivo a formato de pesos colombianos (COP) sin decimales.
 * Ejemplo: 85000 -> "$85.000"
 */
export function formatearCOP(valor) {
  const numeroSeguro = Number.isFinite(Number(valor)) ? Math.max(0, Math.round(Number(valor))) : 0;
  const textoConPuntos = numeroSeguro.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${textoConPuntos}`;
}

/**
 * Calcula el promedio de estrellas de un arreglo de reseñas usando reduce (HU19 CA03).
 */
export function calcularPromedioResenas(resenas) {
  if (!Array.isArray(resenas) || resenas.length === 0) {
    return 0;
  }
  const suma = resenas.reduce((acumulado, calificacion) => acumulado + Number(calificacion), 0);
  return Math.round((suma / resenas.length) * 10) / 10;
}

/**
 * Clona los productos iniciales de forma inmutable para evitar mutaciones por referencia.
 */
export function clonarProductosIniciales() {
  return PRODUCTOS_INICIALES.map((prod) => ({
    ...prod,
    resenas: Array.isArray(prod.resenas) ? [...prod.resenas] : [],
  }));
}

/**
 * Sanitiza y valida los datos recuperados del almacenamiento local (HU20 CA02 y CA03).
 * Garantiza que no existan valores corruptos ni inventarios negativos.
 */
export function sanitizarEstadoRecuperado(datosCrudos) {
  const estadoPorDefecto = {
    productos: clonarProductosIniciales(),
    favoritos: [],
    carrito: [],
    historialPedidos: [],
    cuponAplicado: null,
    fueRecuperado: false,
  };

  if (!datosCrudos || typeof datosCrudos !== 'object') {
    return estadoPorDefecto;
  }

  // 1. Validar y sanitizar productos (precios enteros positivos, stock entero >= 0)
  let productosSeguros = clonarProductosIniciales();
  if (Array.isArray(datosCrudos.productos) && datosCrudos.productos.length >= 12) {
    const productosValidados = datosCrudos.productos
      .filter(
        (p) =>
          p &&
          typeof p.id === 'string' &&
          p.id.trim().length > 0 &&
          typeof p.nombre === 'string' &&
          p.nombre.trim().length > 0 &&
          typeof p.descripcion === 'string' &&
          p.descripcion.trim().length >= 15 &&
          CATEGORIAS_VENDEDOR.includes(p.categoria)
      )
      .map((p) => {
        const precioNum = Math.round(Number(p.precio));
        const stockNum = Math.round(Number(p.stock));
        const resenasSeguras = Array.isArray(p.resenas)
          ? p.resenas
              .map((r) => Math.round(Number(r)))
              .filter((r) => Number.isInteger(r) && r >= 1 && r <= 5)
          : [];

        return {
          id: p.id.trim(),
          nombre: p.nombre.trim(),
          categoria: p.categoria,
          // Si viene corrupto o <= 0, restaurar a un valor entero positivo seguro
          precio: Number.isInteger(precioNum) && precioNum > 0 ? precioNum : 10000,
          // Garantizar que ningún producto tenga inventario negativo (HU20 CA02)
          stock: Number.isInteger(stockNum) && stockNum >= 0 ? stockNum : 0,
          descripcion: p.descripcion.trim(),
          icono:
            typeof p.icono === 'string' && p.icono.trim().length > 0
              ? p.icono.trim().slice(0, 3).toUpperCase()
              : p.nombre.trim().slice(0, 2).toUpperCase(),
          resenas: resenasSeguras,
        };
      });

    if (productosValidados.length >= 12) {
      productosSeguros = productosValidados;
    }
  }

  // 2. Validar favoritos (solo IDs que existan en el catálogo)
  const idsExistentes = productosSeguros.map((p) => p.id);
  const favoritosSeguros = Array.isArray(datosCrudos.favoritos)
    ? datosCrudos.favoritos.filter(
        (idFav, idx, arr) =>
          typeof idFav === 'string' && idsExistentes.includes(idFav) && arr.indexOf(idFav) === idx
      )
    : [];

  // 3. Validar carrito (cantidades enteras positivas y sin superar el stock disponible)
  const carritoSeguro = [];
  if (Array.isArray(datosCrudos.carrito)) {
    datosCrudos.carrito.forEach((item) => {
      if (!item || typeof item.id !== 'string') return;
      const prodCatalogo = productosSeguros.find((p) => p.id === item.id);
      if (!prodCatalogo || prodCatalogo.stock <= 0) return;

      const cantRaw = Math.round(Number(item.cantidad));
      if (!Number.isInteger(cantRaw) || cantRaw < 1) return;

      const cantidadAjustada = Math.min(cantRaw, prodCatalogo.stock);
      if (cantidadAjustada >= 1) {
        carritoSeguro.push({
          id: prodCatalogo.id,
          nombre: prodCatalogo.nombre,
          precio: prodCatalogo.precio,
          categoria: prodCatalogo.categoria,
          icono: prodCatalogo.icono,
          cantidad: cantidadAjustada,
        });
      }
    });
  }

  // 4. Validar historial de pedidos
  const historialSeguro = Array.isArray(datosCrudos.historialPedidos)
    ? datosCrudos.historialPedidos.filter(
        (ped) =>
          ped &&
          typeof ped.idPedido === 'string' &&
          Array.isArray(ped.articulos) &&
          Number.isFinite(Number(ped.total)) &&
          Number(ped.total) >= 0
      )
    : [];

  // 5. Validar cupón activo
  const cuponSeguro =
    datosCrudos.cuponAplicado === 'BIENVENIDO10' && carritoSeguro.length > 0
      ? 'BIENVENIDO10'
      : null;

  return {
    productos: productosSeguros,
    favoritos: favoritosSeguros,
    carrito: carritoSeguro,
    historialPedidos: historialSeguro,
    cuponAplicado: cuponSeguro,
    fueRecuperado: true,
  };
}

/**
 * Guarda el estado actual en almacenamiento local (Web localStorage + respaldo en memoria).
 */
export function guardarEstadoLocal(estado) {
  try {
    const serializado = JSON.stringify({
      productos: estado.productos,
      favoritos: estado.favoritos,
      carrito: estado.carrito,
      historialPedidos: estado.historialPedidos,
      cuponAplicado: estado.cuponAplicado,
      fechaGuardado: new Date().toISOString(),
    });

    respaldoMemoriaLocal = serializado;

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(CLAVE_ALMACENAMIENTO, serializado);
    }
    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Carga y sanitiza el estado almacenado localmente (HU20 CA01, CA02, CA03).
 */
export function cargarEstadoLocal() {
  try {
    let textoGuardado = null;

    if (typeof window !== 'undefined' && window.localStorage) {
      textoGuardado = window.localStorage.getItem(CLAVE_ALMACENAMIENTO);
    }

    if (!textoGuardado && respaldoMemoriaLocal) {
      textoGuardado = respaldoMemoriaLocal;
    }

    if (!textoGuardado) {
      return sanitizarEstadoRecuperado(null);
    }

    const parseado = JSON.parse(textoGuardado);
    return sanitizarEstadoRecuperado(parseado);
  } catch (_error) {
    // Si el JSON estaba corrupto, retorna estado inicial seguro (HU20 CA02 y CA03)
    return sanitizarEstadoRecuperado(null);
  }
}

/**
 * Limpia el almacenamiento local para reiniciar la aplicación a su estado de fábrica.
 */
export function limpiarEstadoLocal() {
  try {
    respaldoMemoriaLocal = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(CLAVE_ALMACENAMIENTO);
    }
    return true;
  } catch (_error) {
    return false;
  }
}
