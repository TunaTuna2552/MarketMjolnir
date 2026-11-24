import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  CATEGORIAS_CONFIG,
  CONSULTAS_INICIALES,
  DIRECCIONES_INICIALES,
  MARCA_INFO,
  MODALIDADES_ENVIO,
  PEDIDOS_INICIALES_V2,
  PRODUCTOS_INICIALES,
  REGLAS_V2,
  TEMAS_APP,
  obtenerFuenteImagen,
} from './src/data/catalogoHalo';

import {
  calcularPromedioEstrellas,
  cargarEstadoLocal,
  formatearCOP,
  guardarEstadoLocal,
  limpiarEstadoLocal,
  validarProductoVendedor,
  validarValoracionResena,
} from './src/utils/formatters';

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
  evaluarCancelacionPedido,
  evaluarDevolucionPedido,
  formatearFechaHoraActual,
  generarRespuestaSimuladaPregunta,
  generarTextoCompartirProducto,
  guardarDireccionEnLista,
  marcarDireccionPrincipal,
  marcarNotificacionLeida,
  obtenerMarcasDisponibles,
  obtenerRecomendacionesRelacionadas,
  obtenerSiguienteEstadoPedido,
  obtenerStockProducto,
  obtenerVarianteProducto,
  simularRespuestaTicket,
  sincronizarStockDesdeVariantes,
  solicitarDevolucionPedido,
  suscribirReposicion,
  tieneMultiplesVariantes,
  toggleComparacion,
  validarPreguntaProducto,
  validarRangoPrecio,
} from './src/utils/reglasV2';

import PanelComparador from './src/components/PanelComparador';
import VistaDirecciones from './src/components/VistaDirecciones';
import VistaNotificaciones from './src/components/VistaNotificaciones';
import VistaSoporte from './src/components/VistaSoporte';

export default function App() {
  // ==========================================================================
  // 1. ESTADOS PRINCIPALES EN MEMORIA (useState) + PERSISTENCIA LOCAL
  // ==========================================================================
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
  const [favoritos, setFavoritos] = useState(['PROD-001']);
  const [carrito, setCarrito] = useState([]);
  const [historialPedidos, setHistorialPedidos] = useState(PEDIDOS_INICIALES_V2);
  const [hidratado, setHidratado] = useState(false);

  // Estados nuevos Taller 5 (HU22–HU35)
  const [comparacion, setComparacion] = useState([]);
  const [direcciones, setDirecciones] = useState(DIRECCIONES_INICIALES);
  const [direccionSeleccionadaId, setDireccionSeleccionadaId] = useState(
    DIRECCIONES_INICIALES[0]?.id || null
  );
  const [modalidadEnvio, setModalidadEnvio] = useState('estandar');
  const [consultas, setConsultas] = useState(CONSULTAS_INICIALES);
  const [notificaciones, setNotificaciones] = useState([]);
  const [suscripcionesReposicion, setSuscripcionesReposicion] = useState([]);
  const [ticketsSoporte, setTicketsSoporte] = useState([]);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [letraGrande, setLetraGrande] = useState(false);

  // Navegación
  const [vistaActual, setVistaActual] = useState('catalogo');
  const [vistaAnterior, setVistaAnterior] = useState('catalogo');
  const [productoDetalleId, setProductoDetalleId] = useState(null);
  const [pedidoDetalleCodigo, setPedidoDetalleCodigo] = useState(
    PEDIDOS_INICIALES_V2[0]?.codigo || null
  );

  // Filtros en Catálogo (HU04, HU05, HU06, HU23)
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [ordenPrecio, setOrdenPrecio] = useState('ninguno');
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('Todas');
  const [precioMinInput, setPrecioMinInput] = useState('');
  const [precioMaxInput, setPrecioMaxInput] = useState('');
  const [rangoPrecioAplicado, setRangoPrecioAplicado] = useState({ min: null, max: null });
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [errorFiltroPrecio, setErrorFiltroPrecio] = useState('');

  // Detalle: Variante (HU21), Pregunta (HU24), Compartir (HU35) y Reseña (HU19)
  const [varianteSeleccionadaId, setVarianteSeleccionadaId] = useState(null);
  const [cantidadDetalle, setCantidadDetalle] = useState(1);
  const [preguntaInput, setPreguntaInput] = useState('');
  const [textoCompartirVisible, setTextoCompartirVisible] = useState('');
  const [resenaEstrellasInput, setResenaEstrellasInput] = useState('5');
  const [resenaAutorInput, setResenaAutorInput] = useState('');
  const [resenaComentarioInput, setResenaComentarioInput] = useState('');

  // Carrito, Cupón y Checkout (HU12, HU13, HU17, HU25, HU26)
  const [codigoCuponInput, setCodigoCuponInput] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [compradorNombre, setCompradorNombre] = useState('Operador Demo 117');
  const [compradorTelefono, setCompradorTelefono] = useState('3000000117');
  const [resumenRevisado, setResumenRevisado] = useState(false);
  const [ultimoPedidoConfirmado, setUltimoPedidoConfirmado] = useState(null);

  // Posventa: Cancelación inline (HU28), Devolución (HU34) y Soporte preseleccionado (HU32)
  const [pedidoConfirmandoCancelacion, setPedidoConfirmandoCancelacion] = useState(null);
  const [pedidoDevolucionId, setPedidoDevolucionId] = useState(null);
  const [motivoDevolucionInput, setMotivoDevolucionInput] = useState('');
  const [pedidoSoportePreseleccionado, setPedidoSoportePreseleccionado] = useState('');

  // Panel de Vendedor (HU18)
  const [editandoId, setEditandoId] = useState(null);
  const [vendNombre, setVendNombre] = useState('');
  const [vendMarca, setVendMarca] = useState('Materials Group UNSC');
  const [vendCategoria, setVendCategoria] = useState(MARCA_INFO.categorias[0]);
  const [vendPrecio, setVendPrecio] = useState('');
  const [vendStock, setVendStock] = useState('');
  const [vendDescripcion, setVendDescripcion] = useState('');
  const [vendInsignia, setVendInsignia] = useState('');
  const [vendImagenUrl, setVendImagenUrl] = useState('');

  // Banner de retroalimentación (HU16)
  const [retroalimentacion, setRetroalimentacion] = useState({
    visible: true,
    tipo: 'info',
    titulo: 'MARKET MJOLNIR 2.0 EN LÍNEA',
    mensaje:
      'Versión 2.0 activa: variantes, comparador, filtros combinados, preguntas, direcciones, envío por municipio, seguimiento, cancelación, avisos y soporte.',
  });

  const tema = modoOscuro ? TEMAS_APP.oscuro : TEMAS_APP.claro;
  const escala = letraGrande ? 1.18 : 1;
  const fs = (n) => Math.round(n * escala);

  const notificar = (tipo, titulo, mensaje) => {
    setRetroalimentacion({ visible: true, tipo, titulo, mensaje });
  };

  // ==========================================================================
  // 2. PERSISTENCIA LOCAL SEGURA (HU20 + v2)
  // ==========================================================================
  useEffect(() => {
    let activo = true;
    async function inicializarEstado() {
      const recuperado = await cargarEstadoLocal(PRODUCTOS_INICIALES);
      if (activo && recuperado) {
        setProductos(recuperado.productos);
        setCarrito(recuperado.carrito);
        setFavoritos(recuperado.favoritos);
        if (recuperado.historialPedidos) {
          setHistorialPedidos(recuperado.historialPedidos);
        }
        setCuponAplicado(recuperado.cuponAplicado);
        setComparacion(recuperado.comparacion || []);
        if (recuperado.direcciones) {
          setDirecciones(recuperado.direcciones);
        }
        if (recuperado.direccionSeleccionadaId !== undefined) {
          setDireccionSeleccionadaId(recuperado.direccionSeleccionadaId);
        }
        if (recuperado.modalidadEnvio !== undefined) {
          setModalidadEnvio(recuperado.modalidadEnvio);
        }
        if (recuperado.consultas) {
          setConsultas(recuperado.consultas);
        }
        setNotificaciones(recuperado.notificaciones || []);
        setSuscripcionesReposicion(recuperado.suscripcionesReposicion || []);
        setTicketsSoporte(recuperado.ticketsSoporte || []);
        setModoOscuro(recuperado.modoOscuro);
        setLetraGrande(recuperado.letraGrande);
      }
      if (activo) {
        setHidratado(true);
      }
    }
    inicializarEstado();
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    guardarEstadoLocal({
      productos,
      carrito,
      favoritos,
      historialPedidos,
      cuponAplicado,
      comparacion,
      direcciones,
      direccionSeleccionadaId,
      modalidadEnvio,
      consultas,
      notificaciones,
      suscripcionesReposicion,
      ticketsSoporte,
      modoOscuro,
      letraGrande,
    });
  }, [
    productos,
    carrito,
    favoritos,
    historialPedidos,
    cuponAplicado,
    comparacion,
    direcciones,
    direccionSeleccionadaId,
    modalidadEnvio,
    consultas,
    notificaciones,
    suscripcionesReposicion,
    ticketsSoporte,
    modoOscuro,
    letraGrande,
    hidratado,
  ]);

  // ==========================================================================
  // 3. NAVEGACIÓN (HU02, HU07)
  // ==========================================================================
  const irAVista = (nuevaVista) => {
    if (nuevaVista !== 'detalle') {
      setVistaAnterior(nuevaVista);
    }
    setVistaActual(nuevaVista);
  };

  const abrirDetalleProducto = (productoId) => {
    if (vistaActual !== 'detalle') {
      setVistaAnterior(vistaActual);
    }
    const prod = productos.find((p) => p.id === productoId);
    setProductoDetalleId(productoId);
    // HU21: Si tiene múltiples variantes, exige selección explícita (null); si tiene 1, la preselecciona
    if (prod && tieneMultiplesVariantes(prod)) {
      setVarianteSeleccionadaId(null);
    } else if (prod && Array.isArray(prod.variantes) && prod.variantes.length === 1) {
      setVarianteSeleccionadaId(prod.variantes[0].id);
    } else {
      setVarianteSeleccionadaId(null);
    }
    setCantidadDetalle(1);
    setPreguntaInput('');
    setTextoCompartirVisible('');
    setResenaEstrellasInput('5');
    setResenaAutorInput('');
    setResenaComentarioInput('');
    setVistaActual('detalle');
  };

  const volverDeDetalle = () => {
    const destino =
      vistaAnterior && vistaAnterior !== 'detalle' ? vistaAnterior : 'catalogo';
    setVistaActual(destino);
  };

  // ==========================================================================
  // 4. FAVORITOS (HU08) Y COMPARADOR (HU22)
  // ==========================================================================
  const alternarFavorito = (producto) => {
    const yaEsFavorito = favoritos.includes(producto.id);
    if (yaEsFavorito) {
      setFavoritos((prev) => prev.filter((id) => id !== producto.id));
      notificar('info', 'FAVORITO REMOVIDO', `Se quitó "${producto.nombre}" de favoritos.`);
    } else {
      setFavoritos((prev) => [...prev, producto.id]);
      notificar('exito', 'GUARDADO EN FAVORITOS ★', `"${producto.nombre}" guardado en favoritos.`);
    }
  };

  const manejarToggleComparar = (producto) => {
    const res = toggleComparacion(comparacion, producto.id, REGLAS_V2.MAX_COMPARACION);
    setComparacion(res.lista);
    if (!res.ok) {
      notificar('alerta', 'LÍMITE DEL COMPARADOR (HU22)', res.mensaje);
      return;
    }
    notificar(res.accion === 'agregado' ? 'exito' : 'info', 'COMPARADOR (HU22)', res.mensaje);
  };

  // ==========================================================================
  // 5. CARRITO CON VARIANTES (HU09, HU10, HU21)
  // ==========================================================================
  const obtenerUnidadesProductoEnCarrito = (productoId) =>
    carrito
      .filter((item) => (item.productoId || item.id) === productoId)
      .reduce((acc, item) => acc + item.cantidad, 0);

  const obtenerUnidadesVarianteEnCarrito = (productoId, varianteId) => {
    const clave = construirClaveCarrito(productoId, varianteId);
    const encontrado = carrito.find((item) => item.claveCarrito === clave);
    return encontrado ? encontrado.cantidad : 0;
  };

  const agregarAlCarritoConVariante = (producto, varianteIdExplicito = null, cantidadSolicitada = 1) => {
    const productoActual = productos.find((p) => p.id === producto.id) || producto;
    const stockGlobal = obtenerStockProducto(productoActual);

    // Si tiene múltiples variantes y no se eligió una (HU21-CA02)
    if (tieneMultiplesVariantes(productoActual) && !varianteIdExplicito) {
      notificar(
        'alerta',
        'SELECCIONA UNA VARIANTE (HU21-CA02)',
        `"${productoActual.nombre}" tiene varias opciones. Selecciona una variante antes de agregar al carrito.`
      );
      return;
    }

    const varianteObj = obtenerVarianteProducto(productoActual, varianteIdExplicito);
    if (!varianteObj) {
      notificar(
        'alerta',
        'VARIANTE REQUERIDA (HU21)',
        'Elige una variante válida antes de agregar al carrito.'
      );
      return;
    }

    if (stockGlobal <= 0 || varianteObj.stock <= 0) {
      notificar(
        'error',
        'VARIANTE SIN STOCK (HU21)',
        `La variante "${varianteObj.etiqueta}" de "${productoActual.nombre}" está agotada (Stock: 0). El carrito no cambió.`
      );
      return;
    }

    const yaEnCarrito = obtenerUnidadesVarianteEnCarrito(productoActual.id, varianteObj.id);
    const maximoPermitido = Math.max(0, varianteObj.stock - yaEnCarrito);

    if (maximoPermitido <= 0) {
      notificar(
        'alerta',
        'STOCK MÁXIMO ALCANZADO (HU21-CA04)',
        `Ya tienes las ${varianteObj.stock} unidad(es) disponibles de "${varianteObj.etiqueta}" en el carrito.`
      );
      return;
    }

    if (cantidadSolicitada > maximoPermitido) {
      notificar(
        'error',
        'CANTIDAD SUPERA EL STOCK DISPONIBLE (HU21-CA04)',
        `Solicitaste ${cantidadSolicitada} uds., pero el máximo permitido para agregar de "${varianteObj.etiqueta}" es ${maximoPermitido} ud(s).`
      );
      return;
    }

    const clave = construirClaveCarrito(productoActual.id, varianteObj.id);
    setCarrito((prev) => {
      const existe = prev.find((it) => it.claveCarrito === clave);
      if (existe) {
        return prev.map((it) =>
          it.claveCarrito === clave
            ? {
                ...it,
                cantidad: it.cantidad + cantidadSolicitada,
                precio: varianteObj.precio,
              }
            : it
        );
      }
      return [
        ...prev,
        {
          claveCarrito: clave,
          id: productoActual.id,
          productoId: productoActual.id,
          varianteId: varianteObj.id,
          varianteEtiqueta: varianteObj.etiqueta,
          nombre: productoActual.nombre,
          categoria: productoActual.categoria,
          marca: productoActual.marca,
          precio: varianteObj.precio,
          icono: productoActual.icono || '📦',
          imagenPersonalizada: productoActual.imagenPersonalizada || null,
          cantidad: cantidadSolicitada,
        },
      ];
    });

    setUltimoPedidoConfirmado(null);
    notificar(
      'exito',
      'AGREGADO AL CARRITO (HU21-CA03)',
      `${cantidadSolicitada} × "${productoActual.nombre}" [${varianteObj.etiqueta}] (${formatearCOP(
        varianteObj.precio
      )} COP).`
    );
  };

  const aumentarCantidadCarrito = (claveCarrito) => {
    const itemCarrito = carrito.find((i) => i.claveCarrito === claveCarrito);
    if (!itemCarrito) return;
    const prodCatalogo = productos.find((p) => p.id === (itemCarrito.productoId || itemCarrito.id));
    const varCatalogo = obtenerVarianteProducto(prodCatalogo, itemCarrito.varianteId);
    const stockMax = varCatalogo ? varCatalogo.stock : 0;

    if (itemCarrito.cantidad >= stockMax) {
      notificar(
        'alerta',
        'STOCK MÁXIMO DE VARIANTE',
        `No puedes superar ${stockMax} ud(s). para "${itemCarrito.nombre} (${itemCarrito.varianteEtiqueta})".`
      );
      return;
    }

    setCarrito((prev) =>
      prev.map((item) =>
        item.claveCarrito === claveCarrito
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  };

  const disminuirCantidadCarrito = (claveCarrito) => {
    const itemCarrito = carrito.find((i) => i.claveCarrito === claveCarrito);
    if (!itemCarrito) return;

    if (itemCarrito.cantidad <= 1) {
      notificar(
        'alerta',
        'CANTIDAD MÍNIMA (1 UNIDAD)',
        `Para quitar "${itemCarrito.nombre} (${itemCarrito.varianteEtiqueta})", usa el botón Eliminar.`
      );
      return;
    }

    setCarrito((prev) =>
      prev.map((item) =>
        item.claveCarrito === claveCarrito
          ? { ...item, cantidad: item.cantidad - 1 }
          : item
      )
    );
  };

  const eliminarDelCarrito = (claveCarrito) => {
    setCarrito((prev) => {
      const nuevo = prev.filter((item) => item.claveCarrito !== claveCarrito);
      if (nuevo.length === 0) {
        setCuponAplicado(null);
        setResumenRevisado(false);
      }
      return nuevo;
    });
    notificar('info', 'LÍNEA ELIMINADA', 'Se retiró la variante del carrito y se recalculó el total.');
  };

  const vaciarCarritoCompleto = () => {
    setCarrito([]);
    setCuponAplicado(null);
    setResumenRevisado(false);
    notificar('info', 'CARRITO VACIADO', 'Se retiraron todas las referencias del carrito.');
  };

  // ==========================================================================
  // 6. CUPÓN, DIRECCIONES (HU25), ENVÍO (HU26) Y COMPRA SIMULADA (HU13, HU29)
  // ==========================================================================
  const direccionActiva =
    direcciones.find((d) => d.id === direccionSeleccionadaId) || null;

  const envioCalculado = calcularEnvioV2(direccionActiva, modalidadEnvio);
  const resumenCarrito = calcularResumenCarritoV2(carrito, cuponAplicado, envioCalculado);

  const aplicarCupon = () => {
    if (carrito.length === 0) {
      notificar('alerta', 'CARRITO VACÍO', 'Agrega productos antes de aplicar un cupón.');
      return;
    }
    const limpio = codigoCuponInput.trim().toUpperCase();
    if (limpio === MARCA_INFO.cuponValido.codigo) {
      setCuponAplicado(MARCA_INFO.cuponValido.codigo);
      notificar('exito', 'CUPÓN BIENVENIDO10 (-10%)', 'Descuento del 10% aplicado al subtotal.');
    } else {
      notificar('error', 'CUPÓN RECHAZADO', `El código "${limpio}" no es válido. Usa BIENVENIDO10.`);
    }
  };

  const quitarCupon = () => {
    setCuponAplicado(null);
    setCodigoCuponInput('');
    notificar('info', 'CUPÓN REMOVIDO', 'Se quitó el cupón y se recalculó el total.');
  };

  const manejarGuardarDireccion = (datos, editId) => {
    const res = guardarDireccionEnLista(direcciones, datos, editId);
    if (!res.ok) {
      notificar('error', 'VALIDACIÓN DE DIRECCIÓN (HU25)', res.mensaje);
      return false;
    }
    setDirecciones(res.direcciones);
    if (res.guardada) {
      setDireccionSeleccionadaId(res.guardada.id);
    }
    setResumenRevisado(false);
    notificar('exito', 'LIBRETA DE DIRECCIONES (HU25)', res.mensaje);
    return true;
  };

  const manejarMarcarPrincipal = (dirId) => {
    setDirecciones((prev) => marcarDireccionPrincipal(prev, dirId));
    notificar('exito', 'DIRECCIÓN PRINCIPAL ACTUALIZADA', 'Solo una dirección queda marcada como principal.');
  };

  const manejarSeleccionarDireccion = (dirId) => {
    setDireccionSeleccionadaId(dirId);
    setResumenRevisado(false);
    notificar('info', 'DIRECCIÓN SELECCIONADA', 'Envío y total recalculados sin duplicar cargos.');
  };

  const manejarEliminarDireccion = (dirId) => {
    setDirecciones((prev) => {
      const filtrada = prev.filter((d) => d.id !== dirId);
      if (filtrada.length > 0 && !filtrada.some((d) => d.principal)) {
        filtrada[0] = { ...filtrada[0], principal: true };
      }
      if (direccionSeleccionadaId === dirId) {
        setDireccionSeleccionadaId(filtrada[0]?.id || null);
      }
      return filtrada;
    });
    notificar('info', 'DIRECCIÓN ELIMINADA', 'Se actualizó tu libreta de direcciones.');
  };

  const validarCheckoutPrevio = () => {
    if (carrito.length === 0) {
      notificar('error', 'CARRITO VACÍO', 'Agrega artículos antes de continuar.');
      return false;
    }
    if (!direccionActiva) {
      notificar(
        'error',
        'DIRECCIÓN OBLIGATORIA (HU25-CA04)',
        'Debes seleccionar o registrar una dirección ficticia antes de confirmar el pedido.'
      );
      return false;
    }
    if (!modalidadEnvio) {
      notificar(
        'error',
        'MODALIDAD DE ENVÍO FALTANTE (HU26-CA04)',
        'Elige una modalidad de envío (Estándar o Exprés) para continuar.'
      );
      return false;
    }
    if (!envioCalculado.disponible) {
      notificar(
        'alerta',
        'ENVÍO REQUIERE AJUSTE MANUAL (HU26)',
        envioCalculado.mensaje
      );
      return false;
    }
    if (!compradorNombre.trim() || !compradorTelefono.trim()) {
      notificar(
        'error',
        'DATOS BÁSICOS FALTANTES (HU12)',
        'Ingresa un nombre y teléfono ficticio del comprador.'
      );
      return false;
    }
    return true;
  };

  const revisarDatosYResumen = () => {
    if (!validarCheckoutPrevio()) {
      setResumenRevisado(false);
      return false;
    }
    setResumenRevisado(true);
    notificar(
      'exito',
      'RESUMEN VERIFICADO',
      `Dirección en ${direccionActiva.municipio} y envío calculado (${formatearCOP(
        resumenCarrito.envio
      )} COP). Listo para confirmar.`
    );
    return true;
  };

  const confirmarCompraSimulada = () => {
    if (!validarCheckoutPrevio()) return;

    // Verificación atómica de stock por variante
    for (let i = 0; i < carrito.length; i += 1) {
      const item = carrito[i];
      const prod = productos.find((p) => p.id === (item.productoId || item.id));
      const variante = obtenerVarianteProducto(prod, item.varianteId);
      const stockDisponible = variante ? variante.stock : 0;
      if (!prod || !variante || stockDisponible < item.cantidad) {
        notificar(
          'error',
          'STOCK INSUFICIENTE POR VARIANTE',
          `"${item.nombre} (${item.varianteEtiqueta})" solicita ${item.cantidad} uds., pero solo hay ${stockDisponible}.`
        );
        return;
      }
    }

    const consecutivo = String(historialPedidos.length + 1).padStart(3, '0');
    const sufijo = Math.floor(1000 + Math.random() * 9000);
    const codigoUnico = `UNSC-2552-${consecutivo}-${sufijo}`;
    const fecha = formatearFechaHoraActual();

    // Snapshot inmutable del pedido (precios, variantes y envío congelados)
    const nuevoPedido = {
      codigo: codigoUnico,
      fechaHora: fecha,
      comprador: {
        nombre: compradorNombre.trim(),
        telefono: compradorTelefono.trim(),
        municipio: direccionActiva.municipio,
        direccion: `${direccionActiva.alias} · ${direccionActiva.descripcion}`,
      },
      direccion: { ...direccionActiva },
      modalidadEnvio,
      plazoEnvio: resumenCarrito.plazoEnvio,
      articulos: carrito.map((item) => ({
        id: item.productoId || item.id,
        productoId: item.productoId || item.id,
        varianteId: item.varianteId,
        varianteEtiqueta: item.varianteEtiqueta,
        nombre: item.nombre,
        categoria: item.categoria,
        icono: item.icono,
        imagenPersonalizada: item.imagenPersonalizada || null,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        subtotalLinea: item.cantidad * item.precio,
      })),
      subtotal: resumenCarrito.subtotal,
      cuponAplicado,
      descuento: resumenCarrito.descuento,
      envio: resumenCarrito.envio,
      total: resumenCarrito.total,
      estado: 'Confirmado',
      stockRestituido: false,
      devolucionSolicitada: false,
      motivoDevolucion: '',
      historialEstados: [
        {
          estado: 'Confirmado',
          fecha,
          detalle: 'Compra simulada confirmada e inventario por variante descontado.',
        },
      ],
      notaSimulacion:
        'SIMULACIÓN ACADÉMICA LOCAL: Pedido registrado con precios congelados, sin cobro real.',
    };

    // Descontar unidades en variantes y recalcular stock total
    setProductos((prev) => descontarStockPorItems(prev, nuevoPedido.articulos));
    setHistorialPedidos((prev) => [nuevoPedido, ...prev]);
    setUltimoPedidoConfirmado(nuevoPedido);
    setPedidoDetalleCodigo(nuevoPedido.codigo);
    setCarrito([]);
    setCuponAplicado(null);
    setCodigoCuponInput('');
    setResumenRevisado(false);

    // HU29: Generar notificación interna sin duplicados
    setNotificaciones((prev) =>
      agregarNotificacionUnica(prev, {
        claveEvento: `PEDIDO-${codigoUnico}-Confirmado`,
        tipo: 'pedido',
        referenciaId: codigoUnico,
        fecha,
        mensaje: `Pedido ${codigoUnico} creado en estado "Confirmado" (${formatearCOP(
          nuevoPedido.total
        )} COP).`,
      }).lista
    );

    notificar(
      'exito',
      `¡PEDIDO ${codigoUnico} CONFIRMADO!`,
      `Compra simulada por ${formatearCOP(
        nuevoPedido.total
      )} COP. Se descontó el stock por variante y se generó el aviso interno.`
    );
  };

  // ==========================================================================
  // 7. POSVENTA: SEGUIMIENTO (HU27), CANCELACIÓN (HU28), REPOSICIÓN (HU30),
  //    PREGUNTAS (HU24), SOPORTE (HU32), DEVOLUCIÓN (HU34) Y COMPARTIR (HU35)
  // ==========================================================================
  const manejarAvanzarEstadoPedido = (codigo) => {
    const objetivo = historialPedidos.find((p) => p.codigo === codigo);
    if (!objetivo) return;
    const res = avanzarEstadoPedido(objetivo, formatearFechaHoraActual());
    if (!res.ok) {
      notificar('alerta', 'TRANSICIÓN BLOQUEADA (HU27)', res.mensaje);
      return;
    }

    setHistorialPedidos((prev) =>
      prev.map((p) => (p.codigo === codigo ? res.pedido : p))
    );

    setNotificaciones((prev) =>
      agregarNotificacionUnica(prev, {
        claveEvento: `PEDIDO-${codigo}-${res.nuevoEstado}`,
        tipo: 'pedido',
        referenciaId: codigo,
        mensaje: `Tu pedido ${codigo} pasó al estado "${res.nuevoEstado}" (simulación de entrega).`,
      }).lista
    );

    notificar('exito', 'AVANCE SIMULADO (HU27)', res.mensaje);
  };

  const manejarConfirmarCancelacion = (codigo) => {
    const objetivo = historialPedidos.find((p) => p.codigo === codigo);
    const res = cancelarPedidoControlado(objetivo, productos, formatearFechaHoraActual());
    setPedidoConfirmandoCancelacion(null);

    if (!res.ok) {
      notificar('error', 'CANCELACIÓN NO PERMITIDA (HU28)', res.mensaje);
      return;
    }

    setProductos(res.productos);
    setHistorialPedidos((prev) =>
      prev.map((p) => (p.codigo === codigo ? res.pedido : p))
    );

    setNotificaciones((prev) =>
      agregarNotificacionUnica(prev, {
        claveEvento: `PEDIDO-${codigo}-Cancelado`,
        tipo: 'cancelacion',
        referenciaId: codigo,
        mensaje: `El pedido ${codigo} fue cancelado lógicamente y sus unidades fueron restituidas al inventario.`,
      }).lista
    );

    notificar('exito', 'PEDIDO CANCELADO (HU28)', res.mensaje);
  };

  const manejarSolicitarDevolucion = (codigo) => {
    const objetivo = historialPedidos.find((p) => p.codigo === codigo);
    const res = solicitarDevolucionPedido(
      objetivo,
      motivoDevolucionInput,
      formatearFechaHoraActual()
    );
    if (!res.ok) {
      notificar('alerta', 'DEVOLUCIÓN NO PERMITIDA (HU34)', res.mensaje);
      return;
    }

    setHistorialPedidos((prev) =>
      prev.map((p) => (p.codigo === codigo ? res.pedido : p))
    );
    setPedidoDevolucionId(null);
    setMotivoDevolucionInput('');
    notificar('exito', 'DEVOLUCIÓN SIMULADA REGISTRADA (HU34)', res.mensaje);
  };

  const manejarEnviarPregunta = (productoId) => {
    const valid = validarPreguntaProducto(preguntaInput);
    if (!valid.valido) {
      notificar('error', 'PREGUNTA INVÁLIDA (HU24-CA03)', valid.mensaje);
      return;
    }
    const nueva = {
      id: `CONS-${Date.now()}`,
      productoId,
      pregunta: valid.textoLimpio,
      estado: 'Pendiente',
      respuestaSimulada: '',
      fecha: formatearFechaHoraActual(),
    };
    setConsultas((prev) => [nueva, ...prev]);
    setPreguntaInput('');
    notificar('exito', 'PREGUNTA REGISTRADA (HU24-CA02)', 'Consulta agregada en estado Pendiente.');
  };

  const manejarSimularRespuestaPregunta = (consultaId, producto) => {
    setConsultas((prev) =>
      prev.map((c) => {
        if (c.id !== consultaId) return c;
        return {
          ...c,
          estado: 'Respondida',
          respuestaSimulada: generarRespuestaSimuladaPregunta(producto, c.pregunta),
        };
      })
    );
    notificar(
      'info',
      'RESPUESTA SIMULADA GENERADA (HU24-CA04)',
      'La pregunta pasó a Respondida con una respuesta automática de demostración.'
    );
  };

  const manejarToggleSuscripcionStock = (producto, variante) => {
    if (!producto || !variante) return;
    const activa = suscripcionesReposicion.some(
      (s) => s.productoId === producto.id && s.varianteId === variante.id && s.activa
    );
    if (activa) {
      const res = cancelarSuscripcionReposicion(
        suscripcionesReposicion,
        producto.id,
        variante.id
      );
      setSuscripcionesReposicion(res.lista);
      notificar('info', 'AVISO CANCELADO (HU30-CA04)', res.mensaje);
    } else {
      const res = suscribirReposicion(suscripcionesReposicion, {
        productoId: producto.id,
        varianteId: variante.id,
        productoNombre: producto.nombre,
        varianteEtiqueta: variante.etiqueta,
      });
      if (!res.ok) {
        notificar('alerta', 'SUSCRIPCIÓN YA ACTIVA (HU30-CA03)', res.mensaje);
        return;
      }
      setSuscripcionesReposicion(res.lista);
      notificar('exito', 'SUSCRIPCIÓN ACTIVADA (HU30-CA01)', res.mensaje);
    }
  };

  const manejarSimularReposicion = (producto, variante) => {
    if (!producto || !variante) return;
    const res = ejecutarReposicionSimulada({
      productos,
      suscripciones: suscripcionesReposicion,
      notificaciones,
      productoId: producto.id,
      varianteId: variante.id,
      unidades: REGLAS_V2.UNIDADES_REPOSICION_DEMO,
    });
    setProductos(res.productos);
    setSuscripcionesReposicion(res.suscripciones);
    setNotificaciones(res.notificaciones);
    notificar(
      'exito',
      'REPOSICIÓN SIMULADA (HU30-CA02)',
      res.avisoGenerado
        ? `Se añadieron +${REGLAS_V2.UNIDADES_REPOSICION_DEMO} uds. a "${variante.etiqueta}" y se creó el aviso en Notificaciones.`
        : `Se añadieron +${REGLAS_V2.UNIDADES_REPOSICION_DEMO} uds. a "${variante.etiqueta}" (sin suscripción activa, no se generó aviso).`
    );
  };

  const manejarCompartirProducto = async (producto, variante) => {
    const mensaje = generarTextoCompartirProducto(producto, variante);
    setTextoCompartirVisible(mensaje);
    try {
      await Share.share({ message: mensaje, title: producto.nombre });
    } catch (e) {
      // En navegador o entornos sin Share nativo queda visible la tarjeta de texto compartible
    }
    notificar(
      'info',
      'RESUMEN PARA COMPARTIR LISTO (HU35)',
      'Se generó el mensaje con nombre y precio (sin enlace público falso).'
    );
  };

  const manejarCrearTicketSoporte = (datos) => {
    const res = crearTicketSoporte(ticketsSoporte, datos);
    if (!res.ok) {
      notificar('error', 'VALIDACIÓN DE SOPORTE (HU32-CA03)', res.mensaje);
      return false;
    }
    setTicketsSoporte(res.tickets);
    notificar('exito', 'CASO CREADO (HU32-CA02)', res.mensaje);
    return true;
  };

  const manejarSimularRespuestaTicket = (ticketId) => {
    const res = simularRespuestaTicket(ticketsSoporte, ticketId);
    if (!res.ok) {
      notificar('alerta', 'SOPORTE (HU32)', res.mensaje);
      return;
    }
    setTicketsSoporte(res.tickets);
    notificar('exito', 'RESPUESTA SIMULADA (HU32-CA04)', res.mensaje);
  };

  // ==========================================================================
  // 8. PANEL DE VENDEDOR (HU18 COMPATIBLE CON VARIANTES) Y RESEÑAS (HU19)
  // ==========================================================================
  const limpiarFormularioVendedor = () => {
    setEditandoId(null);
    setVendNombre('');
    setVendMarca('Materials Group UNSC');
    setVendCategoria(MARCA_INFO.categorias[0]);
    setVendPrecio('');
    setVendStock('');
    setVendDescripcion('');
    setVendInsignia('');
    setVendImagenUrl('');
  };

  const cargarProductoParaEditar = (producto) => {
    setEditandoId(producto.id);
    setVendNombre(producto.nombre);
    setVendMarca(producto.marca || 'Materials Group UNSC');
    setVendCategoria(producto.categoria);
    setVendPrecio(String(producto.precio));
    setVendStock(String(obtenerStockProducto(producto)));
    setVendDescripcion(producto.descripcion);
    setVendInsignia(producto.insignia || producto.id);
    setVendImagenUrl(producto.imagenPersonalizada || '');
    notificar('info', `EDITANDO ${producto.id}`, `Modifica "${producto.nombre}" y guarda.`);
  };

  const guardarProductoVendedor = () => {
    const validacion = validarProductoVendedor({
      nombre: vendNombre,
      categoria: vendCategoria,
      precioTexto: vendPrecio.trim(),
      stockTexto: vendStock.trim(),
      descripcion: vendDescripcion,
    });
    if (!validacion.valido) {
      notificar('error', 'ERROR PANEL VENDEDOR (HU18)', validacion.mensaje);
      return;
    }

    const configCat =
      CATEGORIAS_CONFIG[vendCategoria] || CATEGORIAS_CONFIG['Armaduras Mjolnir'];

    if (editandoId) {
      setProductos((prev) =>
        prev.map((prod) => {
          if (prod.id !== editandoId) return prod;
          // Mantiene una sola fuente de verdad en variantes: ajusta la variante 0
          const otrasVariantesStock = (prod.variantes || [])
            .slice(1)
            .reduce((acc, v) => acc + v.stock, 0);
          const stockPrimera = Math.max(0, validacion.stock - otrasVariantesStock);
          const variantesAct =
            Array.isArray(prod.variantes) && prod.variantes.length > 0
              ? prod.variantes.map((v, idx) =>
                  idx === 0 ? { ...v, precio: validacion.precio, stock: stockPrimera } : v
                )
              : [
                  {
                    id: `VAR-${prod.id}-U`,
                    etiqueta: 'Estándar',
                    precio: validacion.precio,
                    stock: validacion.stock,
                  },
                ];

          return sincronizarStockDesdeVariantes(
            {
              ...prod,
              nombre: vendNombre.trim(),
              marca: vendMarca.trim() || prod.marca || 'Materials Group UNSC',
              categoria: vendCategoria,
              precio: validacion.precio,
              precioBase: validacion.precio,
              descripcion: vendDescripcion.trim(),
              icono: configCat.icono,
              insignia:
                vendInsignia.trim().length > 0
                  ? vendInsignia.trim().toUpperCase()
                  : prod.insignia,
              imagenPersonalizada:
                vendImagenUrl.trim().length > 0 ? vendImagenUrl.trim() : null,
            },
            variantesAct
          );
        })
      );
      notificar('exito', `PRODUCTO ${editandoId} ACTUALIZADO`, 'Stock sincronizado con variantes.');
      limpiarFormularioVendedor();
    } else {
      const nuevoNumero = productos.length + 1;
      let nuevoId = `PROD-${String(nuevoNumero).padStart(3, '0')}`;
      while (productos.some((p) => p.id === nuevoId)) {
        nuevoId = `PROD-${nuevoNumero}-${Math.floor(100 + Math.random() * 900)}`;
      }
      const nuevoProducto = sincronizarStockDesdeVariantes(
        {
          id: nuevoId,
          nombre: vendNombre.trim(),
          marca: vendMarca.trim() || 'Materials Group UNSC',
          categoria: vendCategoria,
          precio: validacion.precio,
          precioBase: validacion.precio,
          stock: validacion.stock,
          descripcion: vendDescripcion.trim(),
          icono: configCat.icono,
          insignia:
            vendInsignia.trim().length > 0
              ? vendInsignia.trim().toUpperCase()
              : `${configCat.codigo} · ${nuevoId}`,
          imagenPersonalizada:
            vendImagenUrl.trim().length > 0 ? vendImagenUrl.trim() : null,
          colorTarjeta: configCat.colorFondo,
          especificaciones: `Categoría: ${vendCategoria} | Registro UNSC: ${nuevoId}`,
          resenas: [],
        },
        [
          {
            id: `VAR-${nuevoId}-U`,
            etiqueta: 'Edición Estándar',
            precio: validacion.precio,
            stock: validacion.stock,
          },
        ]
      );
      setProductos((prev) => [nuevoProducto, ...prev]);
      notificar('exito', `NUEVO PRODUCTO ${nuevoId}`, `"${nuevoProducto.nombre}" registrado.`);
      limpiarFormularioVendedor();
    }
  };

  const registrarResenaProducto = (productoId) => {
    const validacion = validarValoracionResena(
      resenaEstrellasInput.trim(),
      resenaAutorInput,
      resenaComentarioInput
    );
    if (!validacion.valido) {
      notificar('error', 'VALORACIÓN FUERA DE RANGO (HU19)', validacion.mensaje);
      return;
    }
    const nuevaResena = {
      id: `REV-${Date.now()}`,
      autor: validacion.autor,
      estrellas: validacion.estrellas,
      comentario: validacion.comentario,
    };
    setProductos((prev) =>
      prev.map((prod) =>
        prod.id === productoId
          ? { ...prod, resenas: [nuevaResena, ...(prod.resenas || [])] }
          : prod
      )
    );
    setResenaAutorInput('');
    setResenaComentarioInput('');
    notificar('exito', 'RESEÑA REGISTRADA (HU19)', `Calificación ${validacion.estrellas} ★ guardada.`);
  };

  // ==========================================================================
  // 9. FILTROS COMBINADOS (HU23) Y RESTAURAR FÁBRICA
  // ==========================================================================
  const aplicarRangoPrecioFiltro = () => {
    const res = validarRangoPrecio(precioMinInput, precioMaxInput);
    if (!res.valido) {
      setErrorFiltroPrecio(res.error);
      notificar('error', 'RANGO DE PRECIOS INVÁLIDO (HU23-CA02)', res.error);
      return;
    }
    setErrorFiltroPrecio('');
    setRangoPrecioAplicado({ min: res.min, max: res.max });
    notificar('info', 'FILTRO DE PRECIO APLICADO (HU23)', 'Catálogo actualizado con el rango elegido.');
  };

  const restablecerFiltrosCatalogo = () => {
    setBusqueda('');
    setCategoriaSeleccionada('Todas');
    setOrdenPrecio('ninguno');
    setMarcaSeleccionada('Todas');
    setPrecioMinInput('');
    setPrecioMaxInput('');
    setRangoPrecioAplicado({ min: null, max: null });
    setSoloDisponibles(false);
    setErrorFiltroPrecio('');
    notificar('info', 'FILTROS RESTABLECIDOS (HU23-CA04)', 'Se recuperó el catálogo completo.');
  };

  const restaurarSimulacionCompleta = async () => {
    await limpiarEstadoLocal();
    setProductos(PRODUCTOS_INICIALES);
    setFavoritos(['PROD-001']);
    setCarrito([]);
    setHistorialPedidos(PEDIDOS_INICIALES_V2);
    setComparacion([]);
    setDirecciones(DIRECCIONES_INICIALES);
    setDireccionSeleccionadaId(DIRECCIONES_INICIALES[0]?.id || null);
    setModalidadEnvio('estandar');
    setConsultas(CONSULTAS_INICIALES);
    setNotificaciones([]);
    setSuscripcionesReposicion([]);
    setTicketsSoporte([]);
    setCuponAplicado(null);
    setCodigoCuponInput('');
    setUltimoPedidoConfirmado(null);
    setPedidoDetalleCodigo(PEDIDOS_INICIALES_V2[0]?.codigo || null);
    restablecerFiltrosCatalogo();
    limpiarFormularioVendedor();
    notificar(
      'exito',
      'ESTADO DE FÁBRICA 2.0 RESTAURADO',
      'Se restablecieron productos con variantes, direcciones de prueba y pedidos iniciales.'
    );
  };

  // ==========================================================================
  // 10. CÁLCULOS DERIVADOS
  // ==========================================================================
  const marcasDisponibles = obtenerMarcasDisponibles(productos);
  const resultadoFiltros = aplicarFiltrosCatalogo(productos, {
    busqueda,
    categoria: categoriaSeleccionada,
    marca: marcaSeleccionada,
    precioMin: rangoPrecioAplicado.min,
    precioMax: rangoPrecioAplicado.max,
    soloDisponibles,
    ordenPrecio,
  });
  const productosVisibles = resultadoFiltros.resultados;
  const productosFavoritos = productos.filter((prod) => favoritos.includes(prod.id));
  const productosComparados = comparacion
    .map((id) => productos.find((p) => p.id === id))
    .filter(Boolean);
  const productoDetalle =
    productos.find((prod) => prod.id === productoDetalleId) || productos[0];
  const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

  // ==========================================================================
  // 11. TARJETA DE PRODUCTO (CATÁLOGO Y FAVORITOS)
  // ==========================================================================
  const renderTarjetaProducto = ({ item }) => {
    const esFavorito = favoritos.includes(item.id);
    const enComparador = comparacion.includes(item.id);
    const enCarrito = obtenerUnidadesProductoEnCarrito(item.id);
    const stockTotal = obtenerStockProducto(item);
    const agotado = stockTotal <= 0;
    const multiVar = tieneMultiplesVariantes(item);
    const infoEstrellas = calcularPromedioEstrellas(item.resenas);
    const configCat =
      CATEGORIAS_CONFIG[item.categoria] || CATEGORIAS_CONFIG['Armaduras Mjolnir'];

    return (
      <View
        style={[
          styles.cardProducto,
          { backgroundColor: tema.tarjeta, borderColor: agotado ? tema.error : tema.borde },
        ]}
      >
        <Pressable
          onPress={() => abrirDetalleProducto(item.id)}
          style={[
            styles.cardVisualHeader,
            {
              backgroundColor: tema.tarjetaSecundaria,
              borderBottomColor: tema.borde,
            },
          ]}
        >
          <View style={styles.cardTopRow}>
            <View
              style={[
                styles.badgeCodigo,
                { backgroundColor: tema.tarjeta, borderColor: tema.borde },
              ]}
            >
              <Text style={[styles.badgeCodigoTexto, { color: tema.textoSecundario, fontSize: fs(10) }]}>
                {item.id} · {item.marca || 'UNSC'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable
                onPress={() => manejarToggleComparar(item)}
                style={[
                  styles.btnFavoritoIcono,
                  {
                    backgroundColor: enComparador ? tema.primarioFondo : tema.tarjeta,
                    borderColor: enComparador ? tema.primario : tema.borde,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.btnFavoritoTexto,
                    { color: enComparador ? tema.primario : tema.textoSecundario, fontSize: fs(11) },
                  ]}
                >
                  {enComparador ? '✓ Comp.' : '⚖️ Comp.'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => alternarFavorito(item)}
                style={[
                  styles.btnFavoritoIcono,
                  {
                    backgroundColor: esFavorito ? tema.primarioFondo : tema.tarjeta,
                    borderColor: esFavorito ? tema.primario : tema.borde,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.btnFavoritoTexto,
                    { color: esFavorito ? tema.primario : tema.textoSecundario, fontSize: fs(11) },
                  ]}
                >
                  {esFavorito ? '★ FAV' : '☆ FAV'}
                </Text>
              </Pressable>
            </View>
          </View>

          <View
            style={[
              styles.cardImagenWrapper,
              { backgroundColor: tema.tarjeta, borderColor: tema.borde },
            ]}
          >
            <Image
              source={obtenerFuenteImagen(item)}
              style={styles.cardImagenOficial}
              resizeMode="contain"
            />
          </View>

          <View style={styles.cardFooterHudRow}>
            <Text style={[styles.cardCategoriaTag, { color: tema.primario, fontSize: fs(11) }]}>
              {configCat.icono} {item.categoria.toUpperCase()}
            </Text>
            <Text style={[styles.cardEstrellasTexto, { color: tema.textoSecundario, fontSize: fs(12) }]}>
              {infoEstrellas.texto}
            </Text>
          </View>
        </Pressable>

        <View style={styles.cardBody}>
          <Pressable onPress={() => abrirDetalleProducto(item.id)}>
            <Text style={[styles.cardNombre, { color: tema.textoPrincipal, fontSize: fs(16) }]}>
              {item.nombre}
            </Text>
          </Pressable>

          <Text
            style={[styles.cardDescripcionBreve, { color: tema.textoSuave, fontSize: fs(12) }]}
            numberOfLines={2}
          >
            {item.descripcion}
          </Text>

          {multiVar && (
            <View
              style={[
                styles.badgeVariantesCard,
                { backgroundColor: tema.infoFondo, borderColor: tema.info },
              ]}
            >
              <Text style={[styles.badgeVariantesCardTxt, { color: tema.info, fontSize: fs(11) }]}>
                🔀 {item.variantes.length} variantes disponibles (talla/color/edición)
              </Text>
            </View>
          )}

          <View style={styles.cardPrecioStockRow}>
            <View>
              <Text style={[styles.cardPrecioLabel, { color: tema.textoSuave, fontSize: fs(10) }]}>
                {multiVar ? 'PRECIO BASE (COP)' : 'PRECIO UNITARIO (COP)'}
              </Text>
              <Text style={[styles.cardPrecioValor, { color: tema.primario, fontSize: fs(18) }]}>
                {formatearCOP(item.precio)} COP
              </Text>
            </View>

            <View
              style={[
                styles.badgeStock,
                {
                  backgroundColor: agotado ? tema.errorFondo : tema.primarioFondo,
                  borderColor: agotado ? tema.error : tema.primario,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeStockTexto,
                  { color: agotado ? tema.error : tema.primario, fontSize: fs(11) },
                ]}
              >
                {agotado ? 'AGOTADO (Stock: 0)' : `Stock total: ${stockTotal} uds.`}
              </Text>
            </View>
          </View>

          {enCarrito > 0 && (
            <View
              style={[
                styles.indicadorEnCarrito,
                { backgroundColor: tema.infoFondo, borderColor: tema.info },
              ]}
            >
              <Text style={[styles.indicadorEnCarritoTexto, { color: tema.info, fontSize: fs(12) }]}>
                🛒 En tu carrito: {enCarrito} unidad(es)
              </Text>
            </View>
          )}

          <View style={styles.cardActionsRow}>
            <Pressable
              onPress={() => abrirDetalleProducto(item.id)}
              style={[
                styles.btnSecundarioCard,
                { backgroundColor: tema.superficie, borderColor: tema.borde },
              ]}
            >
              <Text
                style={[
                  styles.btnSecundarioCardTexto,
                  { color: tema.textoPrincipal, fontSize: fs(13) },
                ]}
              >
                🔍 Ver detalle
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                multiVar
                  ? abrirDetalleProducto(item.id)
                  : agregarAlCarritoConVariante(item, item.variantes?.[0]?.id, 1)
              }
              style={[
                styles.btnPrimarioCard,
                {
                  backgroundColor: agotado ? tema.errorFondo : tema.primarioBoton,
                  borderColor: agotado ? tema.error : tema.primario,
                },
              ]}
            >
              <Text
                style={[
                  styles.btnPrimarioCardTexto,
                  { color: agotado ? tema.error : '#F8FAFC', fontSize: fs(13) },
                ]}
              >
                {agotado ? '🚫 Agotado' : multiVar ? '🔀 Elegir variante' : '➕ Agregar'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  // ==========================================================================
  // 12. VISTAS PRINCIPALES
  // ==========================================================================

  // VISTA 1: CATÁLOGO (HU03–HU06, HU22, HU23)
  const renderVistaCatalogo = () => {
    const categoriasFiltro = ['Todas', ...MARCA_INFO.categorias];

    return (
      <FlatList
        data={productosVisibles}
        keyExtractor={(item) => item.id}
        renderItem={renderTarjetaProducto}
        contentContainerStyle={styles.listaContenedor}
        ListHeaderComponent={
          <View
            style={[
              styles.panelFiltrosContainer,
              { backgroundColor: tema.tarjeta, borderColor: tema.borde },
            ]}
          >
            {comparacion.length > 0 && (
              <Pressable
                onPress={() => irAVista('comparador')}
                style={[
                  styles.bannerComparadorRapido,
                  { backgroundColor: tema.infoFondo, borderColor: tema.info },
                ]}
              >
                <Text style={[styles.bannerComparadorTxt, { color: tema.info, fontSize: fs(12) }]}>
                  ⚖️ {comparacion.length}/3 producto(s) en comparación · Toca aquí para abrir Comparador →
                </Text>
              </Pressable>
            )}

            <Text style={[styles.seccionSubtitulo, { color: tema.textoSuave, fontSize: fs(11) }]}>
              BUSCADOR (HU04) Y FILTROS COMBINADOS (HU23)
            </Text>
            <View style={styles.buscadorRow}>
              <TextInput
                style={[
                  styles.inputBuscador,
                  {
                    backgroundColor: tema.inputFondo,
                    color: tema.textoPrincipal,
                    borderColor: tema.borde,
                    fontSize: fs(13),
                  },
                ]}
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Buscar por nombre o marca..."
                placeholderTextColor={tema.placeholder}
              />
              {busqueda.length > 0 && (
                <Pressable
                  onPress={() => setBusqueda('')}
                  style={[styles.btnLimpiarBusqueda, { backgroundColor: tema.superficie }]}
                >
                  <Text
                    style={[
                      styles.btnLimpiarBusquedaTexto,
                      { color: tema.textoPrincipal, fontSize: fs(12) },
                    ]}
                  >
                    ✕
                  </Text>
                </Pressable>
              )}
            </View>

            <Text style={[styles.seccionSubtitulo, { color: tema.textoSuave, fontSize: fs(11) }]}>
              CATEGORÍA (HU05)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {categoriasFiltro.map((cat) => {
                const activa = categoriaSeleccionada === cat;
                const iconoCat = cat === 'Todas' ? '🌐' : CATEGORIAS_CONFIG[cat]?.icono || '📦';
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategoriaSeleccionada(cat)}
                    style={[
                      styles.chipCategoria,
                      {
                        backgroundColor: activa ? tema.primarioFondo : tema.superficie,
                        borderColor: activa ? tema.primario : tema.borde,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipCategoriaTexto,
                        { color: activa ? tema.primario : tema.textoSecundario, fontSize: fs(12) },
                      ]}
                    >
                      {iconoCat} {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[styles.seccionSubtitulo, { color: tema.textoSuave, fontSize: fs(11) }]}>
              MARCA (HU23)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {marcasDisponibles.map((m) => {
                const activa = marcaSeleccionada === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMarcaSeleccionada(m)}
                    style={[
                      styles.chipCategoria,
                      {
                        backgroundColor: activa ? tema.infoFondo : tema.superficie,
                        borderColor: activa ? tema.info : tema.borde,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipCategoriaTexto,
                        { color: activa ? tema.info : tema.textoSecundario, fontSize: fs(12) },
                      ]}
                    >
                      🏷️ {m}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[styles.seccionSubtitulo, { color: tema.textoSuave, fontSize: fs(11) }]}>
              RANGO DE PRECIO EN COP Y DISPONIBILIDAD (HU23)
            </Text>
            <View style={styles.rangoPrecioRow}>
              <TextInput
                style={[
                  styles.inputPrecioRango,
                  {
                    backgroundColor: tema.inputFondo,
                    color: tema.textoPrincipal,
                    borderColor: tema.borde,
                    fontSize: fs(12),
                  },
                ]}
                value={precioMinInput}
                onChangeText={setPrecioMinInput}
                keyboardType="numeric"
                placeholder="Mínimo $"
                placeholderTextColor={tema.placeholder}
              />
              <TextInput
                style={[
                  styles.inputPrecioRango,
                  {
                    backgroundColor: tema.inputFondo,
                    color: tema.textoPrincipal,
                    borderColor: tema.borde,
                    fontSize: fs(12),
                  },
                ]}
                value={precioMaxInput}
                onChangeText={setPrecioMaxInput}
                keyboardType="numeric"
                placeholder="Máximo $"
                placeholderTextColor={tema.placeholder}
              />
              <Pressable
                onPress={aplicarRangoPrecioFiltro}
                style={[
                  styles.btnAplicarRango,
                  { backgroundColor: tema.infoFondo, borderColor: tema.info },
                ]}
              >
                <Text style={[styles.btnAplicarRangoTxt, { color: tema.info, fontSize: fs(12) }]}>
                  Aplicar rango
                </Text>
              </Pressable>
            </View>

            {errorFiltroPrecio ? (
              <Text style={[styles.errorInlineTxt, { color: tema.error, fontSize: fs(12) }]}>
                ⚠️ {errorFiltroPrecio}
              </Text>
            ) : null}

            <View style={styles.filtrosExtrasRow}>
              <Pressable
                onPress={() => setSoloDisponibles((v) => !v)}
                style={[
                  styles.btnToggleDisp,
                  {
                    backgroundColor: soloDisponibles ? tema.primarioFondo : tema.superficie,
                    borderColor: soloDisponibles ? tema.primario : tema.borde,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.btnToggleDispTxt,
                    { color: soloDisponibles ? tema.primario : tema.textoSecundario, fontSize: fs(12) },
                  ]}
                >
                  {soloDisponibles ? '☑ Solo disponibles' : '☐ Solo disponibles'}
                </Text>
              </Pressable>

              <Pressable
                onPress={restablecerFiltrosCatalogo}
                style={[
                  styles.btnRestablecer,
                  { backgroundColor: tema.secundarioFondo, borderColor: tema.secundario },
                ]}
              >
                <Text style={[styles.btnRestablecerTxt, { color: tema.secundario, fontSize: fs(12) }]}>
                  🔄 Restablecer
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.seccionSubtitulo, { color: tema.textoSuave, fontSize: fs(11) }]}>
              ORDENAR POR PRECIO (HU06)
            </Text>
            <View style={styles.ordenRow}>
              {[
                { id: 'ninguno', label: 'Por defecto' },
                { id: 'asc', label: '↑ Menor a mayor' },
                { id: 'desc', label: '↓ Mayor a menor' },
              ].map((op) => {
                const activo = ordenPrecio === op.id;
                return (
                  <Pressable
                    key={op.id}
                    onPress={() => setOrdenPrecio(op.id)}
                    style={[
                      styles.btnOrden,
                      {
                        backgroundColor: activo ? tema.secundarioFondo : tema.superficie,
                        borderColor: activo ? tema.secundario : tema.borde,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.btnOrdenTexto,
                        { color: activo ? tema.secundario : tema.textoSuave, fontSize: fs(12) },
                      ]}
                    >
                      {op.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.barraEstadoCatalogo, { borderTopColor: tema.borde }]}>
              <Text style={[styles.barraEstadoCatalogoTexto, { color: tema.textoSuave, fontSize: fs(11) }]}>
                Mostrando {productosVisibles.length} de {productos.length} suministros
                {marcaSeleccionada !== 'Todas' ? ` · Marca: ${marcaSeleccionada}` : ''}
                {soloDisponibles ? ' · Con stock' : ''}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View
            style={[
              styles.estadoVacioBox,
              { backgroundColor: tema.tarjeta, borderColor: tema.borde },
            ]}
          >
            <Text style={styles.estadoVacioIcono}>🛰️</Text>
            <Text style={[styles.estadoVacioTitulo, { color: tema.textoPrincipal, fontSize: fs(18) }]}>
              No encontramos productos
            </Text>
            <Text style={[styles.estadoVacioSubtitulo, { color: tema.textoSuave, fontSize: fs(13) }]}>
              Ningún suministro coincide con la combinación actual de búsqueda y filtros. Prueba ajustarlos o presiona Restablecer.
            </Text>
            <Pressable
              onPress={restablecerFiltrosCatalogo}
              style={[
                styles.btnAccionVacio,
                { backgroundColor: tema.primarioBoton, borderColor: tema.primario },
              ]}
            >
              <Text style={[styles.btnAccionVacioTexto, { fontSize: fs(13) }]}>
                🔄 Restablecer filtros
              </Text>
            </Pressable>
          </View>
        }
      />
    );
  };

  // VISTA 2: DETALLE (HU07, HU19, HU21, HU24, HU30, HU31, HU35)
  const renderVistaDetalle = () => {
    if (!productoDetalle) return null;

    const esFavorito = favoritos.includes(productoDetalle.id);
    const enComparador = comparacion.includes(productoDetalle.id);
    const variantes = Array.isArray(productoDetalle.variantes) ? productoDetalle.variantes : [];
    const multiVar = tieneMultiplesVariantes(productoDetalle);
    const varianteActiva = obtenerVarianteProducto(productoDetalle, varianteSeleccionadaId);
    const stockGlobal = obtenerStockProducto(productoDetalle);
    const precioMostrado = varianteActiva ? varianteActiva.precio : productoDetalle.precio;
    const stockMostrado = varianteActiva ? varianteActiva.stock : stockGlobal;
    const agotadoMostrado = stockMostrado <= 0;

    const enCarritoTotal = obtenerUnidadesProductoEnCarrito(productoDetalle.id);
    const infoEstrellas = calcularPromedioEstrellas(productoDetalle.resenas);
    const configCat =
      CATEGORIAS_CONFIG[productoDetalle.categoria] || CATEGORIAS_CONFIG['Armaduras Mjolnir'];

    const preguntasProducto = consultas.filter((c) => c.productoId === productoDetalle.id);
    const recomendaciones = obtenerRecomendacionesRelacionadas(
      productoDetalle,
      productos,
      REGLAS_V2.MAX_RECOMENDACIONES
    );

    const varianteParaReposicion =
      varianteActiva && varianteActiva.stock === 0
        ? varianteActiva
        : variantes.find((v) => v.stock === 0) || null;

    const suscritoReposicion = varianteParaReposicion
      ? suscripcionesReposicion.some(
          (s) =>
            s.productoId === productoDetalle.id &&
            s.varianteId === varianteParaReposicion.id &&
            s.activa
        )
      : false;

    return (
      <ScrollView contentContainerStyle={styles.scrollVistaContenedor}>
        <View style={styles.detalleTopBar}>
          <Pressable
            onPress={volverDeDetalle}
            style={[styles.btnVolver, { backgroundColor: tema.superficie, borderColor: tema.info }]}
          >
            <Text style={[styles.btnVolverTexto, { color: tema.info, fontSize: fs(13) }]}>
              ← Volver
            </Text>
          </Pressable>

          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <Pressable
              onPress={() => manejarToggleComparar(productoDetalle)}
              style={[
                styles.btnFavoritoDetalle,
                {
                  backgroundColor: enComparador ? tema.infoFondo : tema.superficie,
                  borderColor: enComparador ? tema.info : tema.borde,
                },
              ]}
            >
              <Text style={[styles.btnFavoritoTexto, { color: tema.info, fontSize: fs(12) }]}>
                {enComparador ? '✓ Comparando' : '⚖️ Comparar'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => alternarFavorito(productoDetalle)}
              style={[
                styles.btnFavoritoDetalle,
                {
                  backgroundColor: esFavorito ? tema.primarioFondo : tema.superficie,
                  borderColor: esFavorito ? tema.primario : tema.borde,
                },
              ]}
            >
              <Text
                style={[
                  styles.btnFavoritoTexto,
                  { color: esFavorito ? tema.primario : tema.textoSecundario, fontSize: fs(12) },
                ]}
              >
                {esFavorito ? '★ Favorito' : '☆ Favorito'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Ficha Principal */}
        <View
          style={[
            styles.detalleCard,
            { backgroundColor: tema.tarjeta, borderColor: tema.borde },
          ]}
        >
          <View
            style={[
              styles.detalleHeroBanner,
              {
                backgroundColor: tema.tarjetaSecundaria,
                borderBottomColor: tema.borde,
              },
            ]}
          >
            <View
              style={[
                styles.detalleImagenWrapper,
                { backgroundColor: tema.tarjeta, borderColor: tema.borde },
              ]}
            >
              <Image
                source={obtenerFuenteImagen(productoDetalle)}
                style={styles.detalleImagenOficial}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.detalleInsigniaCodigo, { color: tema.primario, fontSize: fs(12) }]}>
              {productoDetalle.id} · {productoDetalle.marca || 'Materials Group UNSC'}
            </Text>
            <Text style={[styles.detalleCategoriaTexto, { color: tema.textoSecundario, fontSize: fs(13) }]}>
              Categoría: {productoDetalle.categoria}
            </Text>
          </View>

          <View style={styles.detalleContenido}>
            <Text style={[styles.detalleTitulo, { color: tema.textoPrincipal, fontSize: fs(20) }]}>
              {productoDetalle.nombre}
            </Text>

            <View style={styles.detalleMetricasRow}>
              <View
                style={[
                  styles.detalleMetricaCaja,
                  { backgroundColor: tema.tarjetaSecundaria, borderColor: tema.borde },
                ]}
              >
                <Text style={[styles.detalleMetricaLabel, { color: tema.textoSuave, fontSize: fs(9) }]}>
                  {varianteActiva ? 'PRECIO VARIANTE' : 'PRECIO BASE'}
                </Text>
                <Text style={[styles.detallePrecioValor, { color: tema.primario, fontSize: fs(14) }]}>
                  {formatearCOP(precioMostrado)} COP
                </Text>
              </View>

              <View
                style={[
                  styles.detalleMetricaCaja,
                  { backgroundColor: tema.tarjetaSecundaria, borderColor: tema.borde },
                ]}
              >
                <Text style={[styles.detalleMetricaLabel, { color: tema.textoSuave, fontSize: fs(9) }]}>
                  {varianteActiva ? 'STOCK VARIANTE' : 'STOCK TOTAL'}
                </Text>
                <Text
                  style={[
                    styles.detalleStockValor,
                    { color: agotadoMostrado ? tema.error : tema.primario, fontSize: fs(13) },
                  ]}
                >
                  {agotadoMostrado ? 'AGOTADO (0)' : `${stockMostrado} uds.`}
                </Text>
              </View>

              <View
                style={[
                  styles.detalleMetricaCaja,
                  { backgroundColor: tema.tarjetaSecundaria, borderColor: tema.borde },
                ]}
              >
                <Text style={[styles.detalleMetricaLabel, { color: tema.textoSuave, fontSize: fs(9) }]}>
                  VALORACIÓN
                </Text>
                <Text style={[styles.detalleEstrellasValor, { color: tema.secundario, fontSize: fs(13) }]}>
                  {infoEstrellas.texto}
                </Text>
              </View>
            </View>

            {/* HU21 · Selector de Variantes */}
            <View
              style={[
                styles.variantesPanel,
                { backgroundColor: tema.tarjetaSecundaria, borderColor: tema.borde },
              ]}
            >
              <Text style={[styles.detalleSeccionLabel, { color: tema.secundario, fontSize: fs(11) }]}>
                {multiVar
                  ? '🔀 ELIGE UNA VARIANTE OBLIGATORIA (HU21):'
                  : '📦 PRESENTACIÓN ÚNICA:'}
              </Text>

              <View style={styles.variantesWrap}>
                {variantes.map((v) => {
                  const sel = varianteSeleccionadaId === v.id;
                  const sinStock = v.stock <= 0;
                  return (
                    <Pressable
                      key={v.id}
                      onPress={() => {
                        setVarianteSeleccionadaId(v.id);
                        setCantidadDetalle(1);
                      }}
                      style={[
                        styles.chipVariante,
                        {
                          backgroundColor: sel
                            ? tema.primarioFondo
                            : sinStock
                            ? tema.errorFondo
                            : tema.superficie,
                          borderColor: sel
                            ? tema.primario
                            : sinStock
                            ? tema.error
                            : tema.borde,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipVarianteTitulo,
                          {
                            color: sel
                              ? tema.primario
                              : sinStock
                              ? tema.error
                              : tema.textoPrincipal,
                            fontSize: fs(12),
                          },
                        ]}
                      >
                        {sel ? '✓ ' : ''}
                        {v.etiqueta}
                      </Text>
                      <Text
                        style={[
                          styles.chipVarianteMeta,
                          { color: tema.textoSecundario, fontSize: fs(11) },
                        ]}
                      >
                        {formatearCOP(v.precio)} · {sinStock ? 'Agotado (0)' : `Stock: ${v.stock}`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {multiVar && !varianteActiva && (
                <Text style={[styles.avisoElegirVariante, { color: tema.secundario, fontSize: fs(12) }]}>
                  ⚠️ Selecciona una talla, color o edición para ver su stock específico y habilitar la compra.
                </Text>
              )}

              {/* Selector de cantidad en detalle para probar HU21-CA03 y CA04 */}
              <View style={styles.cantidadDetalleRow}>
                <Text style={[styles.cantidadDetalleLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>
                  Cantidad a agregar:
                </Text>
                <View style={styles.cantidadControlesGroup}>
                  <Pressable
                    onPress={() => setCantidadDetalle((q) => Math.max(1, q - 1))}
                    style={[styles.btnCantidad, { backgroundColor: tema.superficie, borderColor: tema.info }]}
                  >
                    <Text style={[styles.btnCantidadTexto, { color: tema.info }]}>−</Text>
                  </Pressable>
                  <View style={styles.cantidadValorBox}>
                    <Text style={[styles.cantidadValorTexto, { color: tema.textoPrincipal, fontSize: fs(15) }]}>
                      {cantidadDetalle}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setCantidadDetalle((q) => q + 1)}
                    style={[styles.btnCantidad, { backgroundColor: tema.superficie, borderColor: tema.info }]}
                  >
                    <Text style={[styles.btnCantidadTexto, { color: tema.info }]}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <Text style={[styles.detalleSeccionLabel, { color: tema.textoSuave, fontSize: fs(11) }]}>
              DESCRIPCIÓN DEL PRODUCTO
            </Text>
            <Text style={[styles.detalleDescripcionTexto, { color: tema.textoSecundario, fontSize: fs(14) }]}>
              {productoDetalle.descripcion}
            </Text>

            {productoDetalle.especificaciones && (
              <View
                style={[
                  styles.detalleSpecsBox,
                  { backgroundColor: tema.tarjetaSecundaria, borderLeftColor: tema.secundario },
                ]}
              >
                <Text style={[styles.detalleSpecsTitulo, { color: tema.secundario, fontSize: fs(11) }]}>
                  ESPECIFICACIONES:
                </Text>
                <Text style={[styles.detalleSpecsTexto, { color: tema.textoSecundario, fontSize: fs(12) }]}>
                  {productoDetalle.especificaciones}
                </Text>
              </View>
            )}

            {enCarritoTotal > 0 && (
              <View
                style={[
                  styles.indicadorEnCarrito,
                  { backgroundColor: tema.infoFondo, borderColor: tema.info },
                ]}
              >
                <Text style={[styles.indicadorEnCarritoTexto, { color: tema.info, fontSize: fs(12) }]}>
                  🛒 En carrito: {enCarritoTotal} unidad(es) de este producto.
                </Text>
              </View>
            )}

            <Pressable
              onPress={() =>
                agregarAlCarritoConVariante(
                  productoDetalle,
                  varianteSeleccionadaId,
                  cantidadDetalle
                )
              }
              style={[
                styles.btnAgregarGrande,
                {
                  backgroundColor:
                    varianteActiva && agotadoMostrado ? tema.errorFondo : tema.primarioBoton,
                  borderColor:
                    varianteActiva && agotadoMostrado ? tema.error : tema.primario,
                },
              ]}
            >
              <Text
                style={[
                  styles.btnAgregarGrandeTexto,
                  {
                    color: varianteActiva && agotadoMostrado ? tema.error : '#F8FAFC',
                    fontSize: fs(13),
                  },
                ]}
              >
                {multiVar && !varianteActiva
                  ? '🔀 ELIGE UNA VARIANTE ARRIBA PARA AGREGAR'
                  : agotadoMostrado
                  ? '🚫 VARIANTE AGOTADA · NO DISPONIBLE PARA COMPRA'
                  : `➕ AGREGAR ${cantidadDetalle} UNIDAD(ES) AL CARRITO`}
              </Text>
            </Pressable>

            {/* HU35 · Compartir producto */}
            <Pressable
              onPress={() => manejarCompartirProducto(productoDetalle, varianteActiva)}
              style={[
                styles.btnCompartir,
                { backgroundColor: tema.infoFondo, borderColor: tema.info },
              ]}
            >
              <Text style={[styles.btnCompartirTxt, { color: tema.info, fontSize: fs(12) }]}>
                📤 Compartir resumen del producto (HU35)
              </Text>
            </Pressable>

            {textoCompartirVisible ? (
              <View
                style={[
                  styles.cajaCompartirPreview,
                  { backgroundColor: tema.tarjetaSecundaria, borderColor: tema.info },
                ]}
              >
                <Text style={[styles.cajaCompartirTitulo, { color: tema.info, fontSize: fs(11) }]}>
                  MENSAJE LISTO PARA COMPARTIR (SIN ENLACE PÚBLICO REAL):
                </Text>
                <Text style={[styles.cajaCompartirTexto, { color: tema.textoPrincipal, fontSize: fs(12) }]}>
                  {textoCompartirVisible}
                </Text>
              </View>
            ) : null}

            {/* HU30 · Avisos de reposición y simulación de stock en agotados */}
            {varianteParaReposicion && (
              <View
                style={[
                  styles.reposicionBox,
                  { backgroundColor: tema.secundarioFondo, borderColor: tema.secundario },
                ]}
              >
                <Text style={[styles.reposicionTitulo, { color: tema.secundario, fontSize: fs(12) }]}>
                  🔔 AVISO DE REPOSICIÓN PARA VARIANTE AGOTADA (HU30)
                </Text>
                <Text style={[styles.reposicionSub, { color: tema.textoSecundario, fontSize: fs(12) }]}>
                  Variante agotada: {varianteParaReposicion.etiqueta} (Stock: 0)
                </Text>

                <View style={styles.reposicionBtnsRow}>
                  <Pressable
                    onPress={() =>
                      manejarToggleSuscripcionStock(productoDetalle, varianteParaReposicion)
                    }
                    style={[
                      styles.btnSuscripcion,
                      {
                        backgroundColor: suscritoReposicion
                          ? tema.errorFondo
                          : tema.primarioBoton,
                        borderColor: suscritoReposicion ? tema.error : tema.primario,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.btnSuscripcionTxt,
                        { color: suscritoReposicion ? tema.error : '#F8FAFC', fontSize: fs(12) },
                      ]}
                    >
                      {suscritoReposicion
                        ? '🔕 Cancelar aviso de reposición'
                        : '🔔 Avisarme cuando haya stock'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      manejarSimularReposicion(productoDetalle, varianteParaReposicion)
                    }
                    style={[
                      styles.btnSimularRepo,
                      { backgroundColor: tema.infoFondo, borderColor: tema.info },
                    ]}
                  >
                    <Text style={[styles.btnSimularRepoTxt, { color: tema.info, fontSize: fs(12) }]}>
                      🧪 Simular reposición (+{REGLAS_V2.UNIDADES_REPOSICION_DEMO} uds.)
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* HU24 · Preguntas frecuentes del producto */}
        <View
          style={[
            styles.resenasPanel,
            { backgroundColor: tema.tarjeta, borderColor: tema.borde, marginBottom: 16 },
          ]}
        >
          <Text style={[styles.resenasTitulo, { color: tema.info, fontSize: fs(14) }]}>
            ❓ PREGUNTAS SOBRE ESTE PRODUCTO (HU24)
          </Text>
          <Text style={[styles.resenasPromedioSub, { color: tema.textoSuave, fontSize: fs(12) }]}>
            Formula dudas antes de comprar (mín. {REGLAS_V2.MIN_CHARS_PREGUNTA} caracteres). Las respuestas son simulaciones académicas.
          </Text>

          <TextInput
            style={[
              styles.inputCampo,
              {
                backgroundColor: tema.inputFondo,
                color: tema.textoPrincipal,
                borderColor: tema.borde,
                fontSize: fs(13),
              },
            ]}
            value={preguntaInput}
            onChangeText={setPreguntaInput}
            placeholder="Escribe tu pregunta sobre este artículo..."
            placeholderTextColor={tema.placeholder}
          />

          <Pressable
            onPress={() => manejarEnviarPregunta(productoDetalle.id)}
            style={[
              styles.btnGuardarResena,
              { backgroundColor: tema.infoFondo, borderColor: tema.info },
            ]}
          >
            <Text style={[styles.btnGuardarResenaTexto, { color: tema.info, fontSize: fs(13) }]}>
              📩 Enviar pregunta
            </Text>
          </Pressable>

          {preguntasProducto.length === 0 ? (
            <Text style={[styles.vacioSuaveTxt, { color: tema.textoSuave, fontSize: fs(12) }]}>
              Aún no hay preguntas para este producto. Sé el primero en preguntar.
            </Text>
          ) : (
            preguntasProducto.map((preg) => {
              const pendiente = preg.estado === 'Pendiente';
              return (
                <View
                  key={preg.id}
                  style={[
                    styles.resenaItemCard,
                    { backgroundColor: tema.tarjetaSecundaria, borderColor: tema.borde },
                  ]}
                >
                  <View style={styles.resenaItemHeader}>
                    <Text style={[styles.resenaItemAutor, { color: tema.textoSuave, fontSize: fs(11) }]}>
                      🕒 {preg.fecha}
                    </Text>
                    <Text
                      style={[
                        styles.resenaItemEstrellas,
                        { color: pendiente ? tema.secundario : tema.primario, fontSize: fs(11) },
                      ]}
                    >
                      {preg.estado.toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.resenaItemComentario,
                      { color: tema.textoPrincipal, fontSize: fs(13), fontWeight: '700' },
                    ]}
                  >
                    P: {preg.pregunta}
                  </Text>

                  {preg.respuestaSimulada ? (
                    <Text
                      style={[
                        styles.respuestaSimuladaPregunta,
                        { color: tema.primario, fontSize: fs(12) },
                      ]}
                    >
                      {preg.respuestaSimulada}
                    </Text>
                  ) : null}

                  {pendiente && (
                    <Pressable
                      onPress={() => manejarSimularRespuestaPregunta(preg.id, productoDetalle)}
                      style={[
                        styles.btnSimularRespuestaPreg,
                        { backgroundColor: tema.secundarioFondo, borderColor: tema.secundario },
                      ]}
                    >
                      <Text
                        style={[
                          styles.btnSimularRespuestaPregTxt,
                          { color: tema.secundario, fontSize: fs(11) },
                        ]}
                      >
                        🧪 Simular respuesta (Demo)
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* HU31 · Productos relacionados */}
        <View
          style={[
            styles.resenasPanel,
            { backgroundColor: tema.tarjeta, borderColor: tema.borde, marginBottom: 16 },
          ]}
        >
          <Text style={[styles.resenasTitulo, { color: tema.primario, fontSize: fs(14) }]}>
            ✨ PRODUCTOS RELACIONADOS EN {productoDetalle.categoria.toUpperCase()} (HU31)
          </Text>
          <Text style={[styles.resenasPromedioSub, { color: tema.textoSuave, fontSize: fs(12) }]}>
            Hasta 4 alternativas de la misma categoría con stock disponible.
          </Text>

          {recomendaciones.length === 0 ? (
            <View
              style={[
                styles.estadoVacioBox,
                { backgroundColor: tema.tarjetaSecundaria, borderColor: tema.borde, padding: 14 },
              ]}
            >
              <Text style={[styles.estadoVacioSubtitulo, { color: tema.textoSuave, fontSize: fs(12), marginBottom: 0 }]}>
                No hay otros productos disponibles en esta categoría para recomendar en este momento.
              </Text>
            </View>
          ) : (
            recomendaciones.map((rec) => (
              <Pressable
                key={rec.id}
                onPress={() => abrirDetalleProducto(rec.id)}
                style={[
                  styles.recomendacionRow,
                  { backgroundColor: tema.tarjetaSecundaria, borderColor: tema.borde },
                ]}
              >
                <View style={styles.miniaturaWrapper}>
                  <Image
                    source={obtenerFuenteImagen(rec)}
                    style={styles.miniaturaImagen}
                    resizeMode="contain"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.recomendacionNombre,
                      { color: tema.textoPrincipal, fontSize: fs(13) },
                    ]}
                  >
                    {rec.nombre}
                  </Text>
                  <Text style={[styles.recomendacionMeta, { color: tema.primario, fontSize: fs(12) }]}>
                    {formatearCOP(rec.precio)} COP · {rec.variantesDisponibles.length} variante(s) con stock
                  </Text>
                </View>
                <Text style={{ color: tema.info, fontWeight: '800', fontSize: fs(12) }}>
                  Ver →
                </Text>
              </Pressable>
            ))
          )}
        </View>

        {/* HU19 · Reseñas existentes conservadas */}
        <View
          style={[
            styles.resenasPanel,
            { backgroundColor: tema.tarjeta, borderColor: tema.borde },
          ]}
        >
          <Text style={[styles.resenasTitulo, { color: tema.secundario, fontSize: fs(14) }]}>
            ★ BITÁCORA DE RESEÑAS Y VALORACIONES (HU19)
          </Text>
          <Text style={[styles.resenasPromedioSub, { color: tema.textoSecundario, fontSize: fs(12) }]}>
            Promedio calculado: {infoEstrellas.texto}
          </Text>

          <View style={styles.estrellasBotonesRow}>
            {[1, 2, 3, 4, 5].map((num) => {
              const seleccionada = Number(resenaEstrellasInput) === num;
              return (
                <Pressable
                  key={num}
                  onPress={() => setResenaEstrellasInput(String(num))}
                  style={[
                    styles.btnEstrellaOpcion,
                    {
                      backgroundColor: seleccionada ? tema.secundarioFondo : tema.superficie,
                      borderColor: seleccionada ? tema.secundario : tema.borde,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.btnEstrellaOpcionTexto,
                      { color: seleccionada ? tema.secundario : tema.textoSuave, fontSize: fs(12) },
                    ]}
                  >
                    {num} ★
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.resenaInputsRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.inputLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>
                Valor (1 a 5):
              </Text>
              <TextInput
                style={[
                  styles.inputCampo,
                  {
                    backgroundColor: tema.inputFondo,
                    color: tema.textoPrincipal,
                    borderColor: tema.borde,
                    fontSize: fs(13),
                  },
                ]}
                value={resenaEstrellasInput}
                onChangeText={setResenaEstrellasInput}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={[styles.inputLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>
                Autor (opcional):
              </Text>
              <TextInput
                style={[
                  styles.inputCampo,
                  {
                    backgroundColor: tema.inputFondo,
                    color: tema.textoPrincipal,
                    borderColor: tema.borde,
                    fontSize: fs(13),
                  },
                ]}
                value={resenaAutorInput}
                onChangeText={setResenaAutorInput}
                placeholder="Ej. Spartan-117"
                placeholderTextColor={tema.placeholder}
              />
            </View>
          </View>

          <Text style={[styles.inputLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>
            Comentario (opcional):
          </Text>
          <TextInput
            style={[
              styles.inputCampo,
              {
                backgroundColor: tema.inputFondo,
                color: tema.textoPrincipal,
                borderColor: tema.borde,
                fontSize: fs(13),
              },
            ]}
            value={resenaComentarioInput}
            onChangeText={setResenaComentarioInput}
            placeholder="Evaluación del artículo..."
            placeholderTextColor={tema.placeholder}
          />

          <Pressable
            onPress={() => registrarResenaProducto(productoDetalle.id)}
            style={[
              styles.btnGuardarResena,
              { backgroundColor: tema.infoFondo, borderColor: tema.info },
            ]}
          >
            <Text style={[styles.btnGuardarResenaTexto, { color: tema.info, fontSize: fs(13) }]}>
              💾 Registrar valoración
            </Text>
          </Pressable>

          {(productoDetalle.resenas || []).map((rev) => (
            <View
              key={rev.id}
              style={[
                styles.resenaItemCard,
                { backgroundColor: tema.tarjetaSecundaria, borderColor: tema.borde },
              ]}
            >
              <View style={styles.resenaItemHeader}>
                <Text style={[styles.resenaItemAutor, { color: tema.primario, fontSize: fs(12) }]}>
                  🪖 {rev.autor}
                </Text>
                <Text style={[styles.resenaItemEstrellas, { color: tema.secundario, fontSize: fs(12) }]}>
                  {'★'.repeat(rev.estrellas)}
                  {'☆'.repeat(Math.max(0, 5 - rev.estrellas))} ({rev.estrellas}/5)
                </Text>
              </View>
              <Text style={[styles.resenaItemComentario, { color: tema.textoSecundario, fontSize: fs(12) }]}>
                {rev.comentario}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // VISTA 3: FAVORITOS (HU08)
  const renderVistaFavoritos = () => (
    <FlatList
      data={productosFavoritos}
      keyExtractor={(item) => item.id}
      renderItem={renderTarjetaProducto}
      contentContainerStyle={styles.listaContenedor}
      ListHeaderComponent={
        <View
          style={[
            styles.encabezadoSeccionBox,
            { backgroundColor: tema.tarjeta, borderLeftColor: tema.primario },
          ]}
        >
          <Text style={[styles.encabezadoSeccionTitulo, { color: tema.textoPrincipal, fontSize: fs(15) }]}>
            ★ ARSENAL DE FAVORITOS (HU08)
          </Text>
          <Text style={[styles.encabezadoSeccionSub, { color: tema.textoSuave, fontSize: fs(12) }]}>
            Tienes {productosFavoritos.length} suministro(s) marcados como prioritarios.
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View
          style={[
            styles.estadoVacioBox,
            { backgroundColor: tema.tarjeta, borderColor: tema.borde },
          ]}
        >
          <Text style={styles.estadoVacioIcono}>☆</Text>
          <Text style={[styles.estadoVacioTitulo, { color: tema.textoPrincipal, fontSize: fs(18) }]}>
            Tu lista de favoritos está vacía
          </Text>
          <Text style={[styles.estadoVacioSubtitulo, { color: tema.textoSuave, fontSize: fs(13) }]}>
            Marca productos con ★ desde el catálogo o su detalle.
          </Text>
          <Pressable
            onPress={() => irAVista('catalogo')}
            style={[
              styles.btnAccionVacio,
              { backgroundColor: tema.primarioBoton, borderColor: tema.primario },
            ]}
          >
            <Text style={[styles.btnAccionVacioTexto, { fontSize: fs(13) }]}>
              🛡️ Volver al Catálogo
            </Text>
          </Pressable>
        </View>
      }
    />
  );

  // VISTA 4: CARRITO, ENVÍO POR MUNICIPIO (HU26) Y CHECKOUT CON DIRECCIONES (HU25)
  const renderVistaCarrito = () => (
    <ScrollView contentContainerStyle={styles.scrollVistaContenedor}>
      <View
        style={[
          styles.encabezadoSeccionBox,
          { backgroundColor: tema.tarjeta, borderLeftColor: tema.primario },
        ]}
      >
        <Text style={[styles.encabezadoSeccionTitulo, { color: tema.textoPrincipal, fontSize: fs(15) }]}>
          🛒 CARRITO Y CHECKOUT 2.0 (HU21, HU25, HU26)
        </Text>
        <Text style={[styles.encabezadoSeccionSub, { color: tema.textoSuave, fontSize: fs(12) }]}>
          Verifica variantes, selecciona dirección ficticia y modalidad de envío para calcular el total sin duplicar cargos.
        </Text>
      </View>

      {ultimoPedidoConfirmado && (
        <View
          style={[
            styles.confirmacionPedidoBox,
            { backgroundColor: tema.primarioFondo, borderColor: tema.primario },
          ]}
        >
          <Text style={[styles.confirmacionPedidoTag, { color: tema.primario, fontSize: fs(11) }]}>
            ✅ PEDIDO CONFIRMADO EN MODO SIMULACIÓN
          </Text>
          <Text style={[styles.confirmacionPedidoCodigo, { color: tema.textoPrincipal, fontSize: fs(18) }]}>
            {ultimoPedidoConfirmado.codigo}
          </Text>
          <Text style={[styles.confirmacionPedidoDetalle, { color: tema.textoSecundario, fontSize: fs(12) }]}>
            Estado: {ultimoPedidoConfirmado.estado} · Destino: {ultimoPedidoConfirmado.comprador.municipio}
          </Text>
          <Text style={[styles.confirmacionPedidoTotal, { color: tema.secundario, fontSize: fs(16) }]}>
            Total: {formatearCOP(ultimoPedidoConfirmado.total)} COP
          </Text>
          <Pressable
            onPress={() => {
              setPedidoDetalleCodigo(ultimoPedidoConfirmado.codigo);
              irAVista('historial');
            }}
            style={[
              styles.btnIrHistorialConfirm,
              { backgroundColor: tema.tarjeta, borderColor: tema.primario },
            ]}
          >
            <Text style={[styles.btnIrHistorialConfirmTexto, { color: tema.primario, fontSize: fs(12) }]}>
              📜 Hacer seguimiento en Mis Pedidos →
            </Text>
          </Pressable>
        </View>
      )}

      {carrito.length === 0 ? (
        <View
          style={[
            styles.estadoVacioBox,
            { backgroundColor: tema.tarjeta, borderColor: tema.borde },
          ]}
        >
          <Text style={styles.estadoVacioIcono}>🛒</Text>
          <Text style={[styles.estadoVacioTitulo, { color: tema.textoPrincipal, fontSize: fs(18) }]}>
            El carrito está vacío
          </Text>
          <Text style={[styles.estadoVacioSubtitulo, { color: tema.textoSuave, fontSize: fs(13) }]}>
            Agrega productos y variantes desde el catálogo para calcular envío y confirmar pedidos.
          </Text>
          <Pressable
            onPress={() => irAVista('catalogo')}
            style={[
              styles.btnAccionVacio,
              { backgroundColor: tema.primarioBoton, borderColor: tema.primario },
            ]}
          >
            <Text style={[styles.btnAccionVacioTexto, { fontSize: fs(13) }]}>
              🚀 Explorar Catálogo
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.listaCarritoBox}>
          <View style={styles.listaCarritoHeaderRow}>
            <Text style={[styles.seccionSubtitulo, { color: tema.textoSuave, fontSize: fs(11) }]}>
              ÍTEMS EN EL CARRITO ({carrito.length})
            </Text>
            <Pressable onPress={vaciarCarritoCompleto}>
              <Text style={[styles.linkVaciarCarrito, { color: tema.error, fontSize: fs(12) }]}>
                Vaciar todo
              </Text>
            </Pressable>
          </View>

          {carrito.map((item) => {
            const prodCatalogo = productos.find((p) => p.id === (item.productoId || item.id));
            const varCatalogo = obtenerVarianteProducto(prodCatalogo, item.varianteId);
            const stockMax = varCatalogo ? varCatalogo.stock : item.cantidad;
            const subtotalLinea = item.precio * item.cantidad;

            return (
              <View
                key={item.claveCarrito}
                style={[
                  styles.carritoItemCard,
                  { backgroundColor: tema.tarjeta, borderColor: tema.borde },
                ]}
              >
                <View style={styles.carritoItemTop}>
                  <View style={styles.miniaturaWrapper}>
                    <Image
                      source={obtenerFuenteImagen(prodCatalogo || item)}
                      style={styles.miniaturaImagen}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.carritoItemNombre, { color: tema.textoPrincipal, fontSize: fs(14) }]}>
                      {item.nombre}
                    </Text>
                    <Text style={[styles.carritoVariantTag, { color: tema.info, fontSize: fs(12) }]}>
                      Variante: {item.varianteEtiqueta || 'Estándar'}
                    </Text>
                    <Text style={[styles.carritoItemMeta, { color: tema.textoSuave, fontSize: fs(11) }]}>
                      Unitario: {formatearCOP(item.precio)} COP · Stock variante: {stockMax}
                    </Text>
                  </View>
                </View>

                <View style={[styles.carritoItemControlesRow, { borderTopColor: tema.borde }]}>
                  <View style={styles.cantidadControlesGroup}>
                    <Pressable
                      onPress={() => disminuirCantidadCarrito(item.claveCarrito)}
                      style={[styles.btnCantidad, { backgroundColor: tema.superficie, borderColor: tema.info }]}
                    >
                      <Text style={[styles.btnCantidadTexto, { color: tema.info }]}>−</Text>
                    </Pressable>
                    <View style={styles.cantidadValorBox}>
                      <Text style={[styles.cantidadValorTexto, { color: tema.textoPrincipal, fontSize: fs(15) }]}>
                        {item.cantidad}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => aumentarCantidadCarrito(item.claveCarrito)}
                      style={[styles.btnCantidad, { backgroundColor: tema.superficie, borderColor: tema.info }]}
                    >
                      <Text style={[styles.btnCantidadTexto, { color: tema.info }]}>+</Text>
                    </Pressable>
                  </View>

                  <View style={styles.subtotalLineaBox}>
                    <Text style={[styles.subtotalLineaLabel, { color: tema.textoSuave, fontSize: fs(10) }]}>
                      Subtotal
                    </Text>
                    <Text style={[styles.subtotalLineaValor, { color: tema.primario, fontSize: fs(13) }]}>
                      {formatearCOP(subtotalLinea)} COP
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => eliminarDelCarrito(item.claveCarrito)}
                    style={[styles.btnEliminarItem, { backgroundColor: tema.errorFondo, borderColor: tema.error }]}
                  >
                    <Text style={[styles.btnEliminarItemTexto, { color: tema.error, fontSize: fs(11) }]}>
                      🗑 Eliminar
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Cupón (HU17) */}
      <View
        style={[
          styles.panelSeccionCard,
          { backgroundColor: tema.tarjeta, borderColor: tema.borde },
        ]}
      >
        <Text style={[styles.panelSeccionTitulo, { color: tema.secundario, fontSize: fs(13) }]}>
          🎟️ CUPÓN PROMOCIONAL (HU17)
        </Text>
        <Text style={[styles.panelSeccionAyuda, { color: tema.textoSuave, fontSize: fs(12) }]}>
          Código válido: BIENVENIDO10 (10% de descuento sobre el subtotal).
        </Text>
        <View style={styles.cuponRow}>
          <TextInput
            style={[
              styles.inputCampo,
              {
                flex: 1,
                marginBottom: 0,
                marginRight: 8,
                backgroundColor: tema.inputFondo,
                color: tema.textoPrincipal,
                borderColor: tema.borde,
                fontSize: fs(13),
              },
            ]}
            value={codigoCuponInput}
            onChangeText={setCodigoCuponInput}
            placeholder="BIENVENIDO10"
            placeholderTextColor={tema.placeholder}
            autoCapitalize="characters"
          />
          <Pressable
            onPress={aplicarCupon}
            style={[styles.btnAplicarCupon, { backgroundColor: tema.infoFondo, borderColor: tema.info }]}
          >
            <Text style={[styles.btnAplicarCuponTexto, { color: tema.info, fontSize: fs(13) }]}>
              Aplicar
            </Text>
          </Pressable>
        </View>
        {cuponAplicado && (
          <View
            style={[
              styles.cuponActivoBanner,
              { backgroundColor: tema.primarioFondo, borderColor: tema.primario },
            ]}
          >
            <Text style={[styles.cuponActivoTexto, { color: tema.primario, fontSize: fs(12) }]}>
              ✅ {cuponAplicado} activo (-{formatearCOP(resumenCarrito.descuento)} COP)
            </Text>
            <Pressable onPress={quitarCupon}>
              <Text style={[styles.linkQuitarCupon, { color: tema.error, fontSize: fs(12) }]}>
                Quitar
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* HU25 y HU26 · Selección de Dirección + Estimador de Envío */}
      <View
        style={[
          styles.panelSeccionCard,
          { backgroundColor: tema.tarjeta, borderColor: tema.borde },
        ]}
      >
        <View style={styles.listaCarritoHeaderRow}>
          <Text style={[styles.panelSeccionTitulo, { color: tema.secundario, fontSize: fs(13) }]}>
            📍 DIRECCIÓN Y MODALIDAD DE ENVÍO (HU25 & HU26)
          </Text>
          <Pressable onPress={() => irAVista('direcciones')}>
            <Text style={{ color: tema.info, fontWeight: '800', fontSize: fs(12) }}>
              Gestionar →
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.inputLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>
          1. Dirección de entrega ficticia:
        </Text>
        <View style={styles.municipiosChipsRow}>
          {direcciones.map((dir) => {
            const sel = dir.id === direccionSeleccionadaId;
            return (
              <Pressable
                key={dir.id}
                onPress={() => manejarSeleccionarDireccion(dir.id)}
                style={[
                  styles.chipMunicipio,
                  {
                    backgroundColor: sel ? tema.primarioFondo : tema.superficie,
                    borderColor: sel ? tema.primario : tema.borde,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipMunicipioTexto,
                    { color: sel ? tema.primario : tema.textoSecundario, fontSize: fs(11) },
                  ]}
                >
                  {dir.principal ? '★ ' : '📍 '}
                  {dir.alias} ({dir.municipio})
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => {
              setDireccionSeleccionadaId(null);
              setResumenRevisado(false);
            }}
            style={[
              styles.chipMunicipio,
              {
                backgroundColor: !direccionSeleccionadaId ? tema.errorFondo : tema.superficie,
                borderColor: !direccionSeleccionadaId ? tema.error : tema.borde,
              },
            ]}
          >
            <Text
              style={[
                styles.chipMunicipioTexto,
                { color: !direccionSeleccionadaId ? tema.error : tema.textoSuave, fontSize: fs(11) },
              ]}
            >
              Sin selección
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.inputLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>
          2. Modalidad de envío:
        </Text>
        <View style={styles.municipiosChipsRow}>
          {MODALIDADES_ENVIO.map((mod) => {
            const sel = modalidadEnvio === mod.id;
            return (
              <Pressable
                key={mod.id}
                onPress={() => {
                  setModalidadEnvio(mod.id);
                  setResumenRevisado(false);
                }}
                style={[
                  styles.chipMunicipio,
                  {
                    backgroundColor: sel ? tema.infoFondo : tema.superficie,
                    borderColor: sel ? tema.info : tema.borde,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipMunicipioTexto,
                    { color: sel ? tema.info : tema.textoSecundario, fontSize: fs(11) },
                  ]}
                >
                  🚚 {mod.nombre}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => {
              setModalidadEnvio(null);
              setResumenRevisado(false);
            }}
            style={[
              styles.chipMunicipio,
              {
                backgroundColor: !modalidadEnvio ? tema.errorFondo : tema.superficie,
                borderColor: !modalidadEnvio ? tema.error : tema.borde,
              },
            ]}
          >
            <Text
              style={[
                styles.chipMunicipioTexto,
                { color: !modalidadEnvio ? tema.error : tema.textoSuave, fontSize: fs(11) },
              ]}
            >
              Sin modalidad
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.avisoSimulacionBox,
            {
              backgroundColor: envioCalculado.disponible ? tema.primarioFondo : tema.secundarioFondo,
              borderColor: envioCalculado.disponible ? tema.primario : tema.secundario,
            },
          ]}
        >
          <Text
            style={[
              styles.avisoSimulacionTexto,
              {
                color: envioCalculado.disponible ? tema.primario : tema.secundario,
                fontSize: fs(12),
              },
            ]}
          >
            {envioCalculado.disponible ? '🚚 ' : '⚠️ '}
            {envioCalculado.mensaje}
          </Text>
        </View>
      </View>

      {/* Resumen de Compra (HU11 + HU26) */}
      <View
        style={[
          styles.panelSeccionCard,
          { backgroundColor: tema.tarjeta, borderColor: tema.borde },
        ]}
      >
        <Text style={[styles.panelSeccionTitulo, { color: tema.secundario, fontSize: fs(13) }]}>
          📊 RESUMEN DE COMPRA Y ENVÍO (HU26)
        </Text>
        <Text style={[styles.panelSeccionAyuda, { color: tema.textoSuave, fontSize: fs(11) }]}>
          Tarifas de práctica: Mosquera ($6.000 / $10.000) · Funza ($8.000 / $12.000) · Madrid ($10.000 / $14.000).
        </Text>

        <View style={styles.resumenLinea}>
          <Text style={[styles.resumenLabel, { color: tema.textoSecundario, fontSize: fs(13) }]}>
            Subtotal ({resumenCarrito.totalUnidades} uds.):
          </Text>
          <Text style={[styles.resumenValor, { color: tema.textoPrincipal, fontSize: fs(13) }]}>
            {formatearCOP(resumenCarrito.subtotal)} COP
          </Text>
        </View>

        {cuponAplicado && (
          <View style={styles.resumenLinea}>
            <Text style={[styles.resumenLabel, { color: tema.primario, fontSize: fs(13) }]}>
              Descuento ({cuponAplicado}):
            </Text>
            <Text style={[styles.resumenValor, { color: tema.primario, fontSize: fs(13) }]}>
              -{formatearCOP(resumenCarrito.descuento)} COP
            </Text>
          </View>
        )}

        <View style={styles.resumenLinea}>
          <Text style={[styles.resumenLabel, { color: tema.textoSecundario, fontSize: fs(13) }]}>
            Envío {resumenCarrito.plazoEnvio ? `(${resumenCarrito.plazoEnvio})` : ''}:
          </Text>
          <Text style={[styles.resumenValor, { color: tema.textoPrincipal, fontSize: fs(13) }]}>
            {envioCalculado.disponible
              ? `${formatearCOP(resumenCarrito.envio)} COP`
              : 'Pendiente'}
          </Text>
        </View>

        <View style={[styles.resumenSeparador, { backgroundColor: tema.borde }]} />

        <View style={styles.resumenLineaTotal}>
          <Text style={[styles.resumenTotalLabel, { color: tema.secundario, fontSize: fs(15) }]}>
            TOTAL ESTIMADO:
          </Text>
          <Text style={[styles.resumenTotalValor, { color: tema.primario, fontSize: fs(19) }]}>
            {formatearCOP(resumenCarrito.total)} COP
          </Text>
        </View>
      </View>

      {/* Datos básicos comprador + Confirmación */}
      <View
        style={[
          styles.panelSeccionCard,
          { backgroundColor: tema.tarjeta, borderColor: tema.borde },
        ]}
      >
        <Text style={[styles.panelSeccionTitulo, { color: tema.secundario, fontSize: fs(13) }]}>
          🧑‍✈️ DATOS FICTICIOS DEL COMPRADOR Y CONFIRMACIÓN
        </Text>

        <Text style={[styles.inputLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>
          Nombre ficticio *:
        </Text>
        <TextInput
          style={[
            styles.inputCampo,
            {
              backgroundColor: tema.inputFondo,
              color: tema.textoPrincipal,
              borderColor: tema.borde,
              fontSize: fs(13),
            },
          ]}
          value={compradorNombre}
          onChangeText={(t) => {
            setCompradorNombre(t);
            setResumenRevisado(false);
          }}
          placeholder="Ej. Operador Demo 117"
          placeholderTextColor={tema.placeholder}
        />

        <Text style={[styles.inputLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>
          Teléfono ficticio *:
        </Text>
        <TextInput
          style={[
            styles.inputCampo,
            {
              backgroundColor: tema.inputFondo,
              color: tema.textoPrincipal,
              borderColor: tema.borde,
              fontSize: fs(13),
            },
          ]}
          value={compradorTelefono}
          onChangeText={(t) => {
            setCompradorTelefono(t);
            setResumenRevisado(false);
          }}
          keyboardType="phone-pad"
          placeholder="Ej. 3000000117"
          placeholderTextColor={tema.placeholder}
        />

        <Pressable
          onPress={revisarDatosYResumen}
          style={[styles.btnValidarPrevia, { backgroundColor: tema.infoFondo, borderColor: tema.info }]}
        >
          <Text style={[styles.btnValidarPreviaTexto, { color: tema.info, fontSize: fs(12) }]}>
            📋 1. Validar dirección, envío y resumen
          </Text>
        </Pressable>

        {resumenRevisado && carrito.length > 0 && direccionActiva && (
          <View
            style={[
              styles.preConfirmacionResumenBox,
              { backgroundColor: tema.primarioFondo, borderColor: tema.primario },
            ]}
          >
            <Text style={[styles.preConfirmacionTitulo, { color: tema.primario, fontSize: fs(12) }]}>
              ✓ RESUMEN LISTO PARA CONFIRMAR:
            </Text>
            <Text style={[styles.preConfirmacionTexto, { color: tema.textoPrincipal, fontSize: fs(12) }]}>
              • Destino: {direccionActiva.alias} ({direccionActiva.municipio}) · Plazo: {resumenCarrito.plazoEnvio}
            </Text>
            <Text style={[styles.preConfirmacionTexto, { color: tema.textoPrincipal, fontSize: fs(12) }]}>
              • Total final: {formatearCOP(resumenCarrito.total)} COP
            </Text>
          </View>
        )}

        <Pressable
          onPress={confirmarCompraSimulada}
          style={[
            styles.btnConfirmarCompra,
            {
              backgroundColor: carrito.length === 0 ? tema.errorFondo : tema.primarioBoton,
              borderColor: carrito.length === 0 ? tema.error : tema.primario,
            },
          ]}
        >
          <Text style={[styles.btnConfirmarCompraTexto, { fontSize: fs(13) }]}>
            ✅ 2. Confirmar compra simulada ({formatearCOP(resumenCarrito.total)} COP)
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  // VISTA 5: MIS PEDIDOS · SEGUIMIENTO (HU27), CANCELACIÓN (HU28), DEVOLUCIÓN (HU34)
  const renderVistaHistorial = () => {
    const pedidoSeleccionado =
      historialPedidos.find((p) => p.codigo === pedidoDetalleCodigo) ||
      historialPedidos[0];

    const colorEstado = (estado) => {
      if (estado === 'Entregado') return tema.primario;
      if (estado === 'Cancelado') return tema.error;
      if (estado === 'En camino') return tema.info;
      return tema.secundario;
    };

    const siguienteEstado = pedidoSeleccionado
      ? obtenerSiguienteEstadoPedido(pedidoSeleccionado.estado)
      : null;
    const evalCancelacion = evaluarCancelacionPedido(pedidoSeleccionado);
    const evalDevolucion = evaluarDevolucionPedido(pedidoSeleccionado);

    return (
      <ScrollView contentContainerStyle={styles.scrollVistaContenedor}>
        <View
          style={[
            styles.encabezadoSeccionBox,
            { backgroundColor: tema.tarjeta, borderLeftColor: tema.primario },
          ]}
        >
          <Text style={[styles.encabezadoSeccionTitulo, { color: tema.textoPrincipal, fontSize: fs(15) }]}>
            📜 MIS PEDIDOS · SEGUIMIENTO Y POSVENTA (HU27, HU28, HU34)
          </Text>
          <Text style={[styles.encabezadoSeccionSub, { color: tema.textoSuave, fontSize: fs(12) }]}>
            Consulta el historial cronológico, simula avances de entrega, cancela antes del despacho o solicita devolución en entregados.
          </Text>
        </View>

        {historialPedidos.length === 0 ? (
          <View
            style={[
              styles.estadoVacioBox,
              { backgroundColor: tema.tarjeta, borderColor: tema.borde },
            ]}
          >
            <Text style={styles.estadoVacioIcono}>📜</Text>
            <Text style={[styles.estadoVacioTitulo, { color: tema.textoPrincipal, fontSize: fs(18) }]}>
              No hay pedidos registrados
            </Text>
            <Pressable
              onPress={() => irAVista('catalogo')}
              style={[
                styles.btnAccionVacio,
                { backgroundColor: tema.primarioBoton, borderColor: tema.primario },
              ]}
            >
              <Text style={[styles.btnAccionVacioTexto, { fontSize: fs(13) }]}>
                🛒 Ir al Catálogo
              </Text>
            </Pressable>
          </View>
        ) : (
          <View>
            {historialPedidos.map((pedido) => {
              const seleccionado =
                pedidoSeleccionado && pedidoSeleccionado.codigo === pedido.codigo;
              const estColor = colorEstado(pedido.estado || 'Confirmado');

              return (
                <Pressable
                  key={pedido.codigo}
                  onPress={() => {
                    setPedidoDetalleCodigo(pedido.codigo);
                    setPedidoConfirmandoCancelacion(null);
                    setPedidoDevolucionId(null);
                  }}
                  style={[
                    styles.pedidoListaCard,
                    {
                      backgroundColor: seleccionado ? tema.primarioFondo : tema.tarjeta,
                      borderColor: seleccionado ? tema.primario : tema.borde,
                    },
                  ]}
                >
                  <View style={styles.pedidoListaTop}>
                    <Text style={[styles.pedidoCodigoTexto, { color: tema.textoPrincipal, fontSize: fs(14) }]}>
                      📦 {pedido.codigo}
                    </Text>
                    <Text style={[styles.pedidoEstadoPill, { color: estColor, borderColor: estColor, fontSize: fs(11) }]}>
                      {pedido.estado || 'Confirmado'}
                    </Text>
                  </View>
                  <Text style={[styles.pedidoFechaTexto, { color: tema.textoSuave, fontSize: fs(12) }]}>
                    🕒 {pedido.fechaHora} · Total: {formatearCOP(pedido.total)} COP
                  </Text>
                  <Text style={[styles.pedidoCompradorTexto, { color: tema.textoSecundario, fontSize: fs(12) }]}>
                    📍 {pedido.comprador?.municipio} · {pedido.comprador?.nombre}
                  </Text>
                </Pressable>
              );
            })}

            {pedidoSeleccionado && (
              <View
                style={[
                  styles.pedidoDetallePanel,
                  { backgroundColor: tema.tarjeta, borderColor: tema.info },
                ]}
              >
                <Text style={[styles.pedidoDetalleTitulo, { color: tema.info, fontSize: fs(15) }]}>
                  🔍 DETALLE DEL PEDIDO {pedidoSeleccionado.codigo}
                </Text>
                <Text style={[styles.pedidoDetalleMeta, { color: tema.textoSecundario, fontSize: fs(12) }]}>
                  Estado actual:{' '}
                  <Text style={{ fontWeight: '900', color: colorEstado(pedidoSeleccionado.estado) }}>
                    {pedidoSeleccionado.estado}
                  </Text>
                </Text>
                <Text style={[styles.pedidoDetalleMeta, { color: tema.textoSecundario, fontSize: fs(12) }]}>
                  Destino: {pedidoSeleccionado.comprador?.direccion} ({pedidoSeleccionado.comprador?.municipio})
                </Text>

                {/* HU27 · Historial cronológico de estados */}
                <View style={[styles.resumenSeparador, { backgroundColor: tema.borde }]} />
                <Text style={[styles.seccionSubtitulo, { color: tema.secundario, fontSize: fs(11) }]}>
                  HISTORIAL CRONOLÓGICO DE ESTADOS (HU27):
                </Text>
                {(pedidoSeleccionado.historialEstados || []).map((ev, idx) => (
                  <View
                    key={`${ev.estado}-${idx}`}
                    style={[
                      styles.timelineItem,
                      { borderLeftColor: colorEstado(ev.estado) },
                    ]}
                  >
                    <Text style={[styles.timelineEstado, { color: tema.textoPrincipal, fontSize: fs(12) }]}>
                      • {ev.estado} ({ev.fecha})
                    </Text>
                    <Text style={[styles.timelineDetalle, { color: tema.textoSuave, fontSize: fs(11) }]}>
                      {ev.detalle}
                    </Text>
                  </View>
                ))}

                {/* HU27 · Control exacto: "Simular avance de entrega" */}
                <Pressable
                  onPress={() => manejarAvanzarEstadoPedido(pedidoSeleccionado.codigo)}
                  style={[
                    styles.btnAvanceEntrega,
                    {
                      backgroundColor: siguienteEstado ? tema.infoFondo : tema.superficie,
                      borderColor: siguienteEstado ? tema.info : tema.borde,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.btnAvanceEntregaTxt,
                      { color: siguienteEstado ? tema.info : tema.textoSuave, fontSize: fs(12) },
                    ]}
                  >
                    {siguienteEstado
                      ? `🚚 Simular avance de entrega (→ ${siguienteEstado})`
                      : `🚫 Simular avance de entrega (Bloqueado en "${pedidoSeleccionado.estado}")`}
                  </Text>
                </Pressable>

                {/* HU28 · Cancelación controlada y reintegro único */}
                <Pressable
                  onPress={() => {
                    if (!evalCancelacion.permitida) {
                      notificar('error', 'CANCELACIÓN BLOQUEADA (HU28)', evalCancelacion.razon);
                      return;
                    }
                    setPedidoConfirmandoCancelacion(pedidoSeleccionado.codigo);
                  }}
                  style={[
                    styles.btnCancelarPedido,
                    {
                      backgroundColor: evalCancelacion.permitida
                        ? tema.errorFondo
                        : tema.superficie,
                      borderColor: evalCancelacion.permitida ? tema.error : tema.borde,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.btnCancelarPedidoTxt,
                      {
                        color: evalCancelacion.permitida ? tema.error : tema.textoSuave,
                        fontSize: fs(12),
                      },
                    ]}
                  >
                    {evalCancelacion.permitida
                      ? '🛑 Cancelar pedido (restituye stock por variante)'
                      : `🔒 Cancelación deshabilitada (${pedidoSeleccionado.estado})`}
                  </Text>
                </Pressable>

                {pedidoConfirmandoCancelacion === pedidoSeleccionado.codigo && (
                  <View
                    style={[
                      styles.confirmacionCancelBox,
                      { backgroundColor: tema.errorFondo, borderColor: tema.error },
                    ]}
                  >
                    <Text style={[styles.confirmacionCancelTxt, { color: tema.error, fontSize: fs(12) }]}>
                      ¿Confirmas cancelar lógicamente {pedidoSeleccionado.codigo}? Se restituirán las unidades exactas una sola vez.
                    </Text>
                    <View style={styles.confirmacionCancelBtns}>
                      <Pressable
                        onPress={() => manejarConfirmarCancelacion(pedidoSeleccionado.codigo)}
                        style={[styles.btnConfirmarSi, { backgroundColor: tema.error }]}
                      >
                        <Text style={[styles.btnConfirmarSiTxt, { fontSize: fs(12) }]}>
                          Sí, confirmar cancelación
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setPedidoConfirmandoCancelacion(null)}
                        style={[styles.btnConfirmarNo, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}
                      >
                        <Text style={[styles.btnConfirmarNoTxt, { color: tema.textoPrincipal, fontSize: fs(12) }]}>
                          Mantener pedido
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* HU34 · Solicitud de devolución simulada (solo Entregado) */}
                <Pressable
                  onPress={() => {
                    if (!evalDevolucion.permitida) {
                      notificar('alerta', 'DEVOLUCIÓN NO HABILITADA (HU34)', evalDevolucion.razon);
                      return;
                    }
                    setPedidoDevolucionId(pedidoSeleccionado.codigo);
                  }}
                  style={[
                    styles.btnDevolucion,
                    {
                      backgroundColor: evalDevolucion.permitida
                        ? tema.secundarioFondo
                        : tema.superficie,
                      borderColor: evalDevolucion.permitida ? tema.secundario : tema.borde,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.btnDevolucionTxt,
                      {
                        color: evalDevolucion.permitida ? tema.secundario : tema.textoSuave,
                        fontSize: fs(12),
                      },
                    ]}
                  >
                    {pedidoSeleccionado.devolucionSolicitada
                      ? '✓ Devolución simulada ya solicitada'
                      : evalDevolucion.permitida
                      ? '↩️ Solicitar devolución simulada (HU34)'
                      : `↩️ Devolución deshabilitada (requiere estado "Entregado")`}
                  </Text>
                </Pressable>

                {pedidoDevolucionId === pedidoSeleccionado.codigo && (
                  <View
                    style={[
                      styles.confirmacionCancelBox,
                      { backgroundColor: tema.secundarioFondo, borderColor: tema.secundario },
                    ]}
                  >
                    <Text style={[styles.confirmacionCancelTxt, { color: tema.secundario, fontSize: fs(12) }]}>
                      Describe el motivo de la devolución simulada:
                    </Text>
                    <TextInput
                      style={[
                        styles.inputCampo,
                        {
                          backgroundColor: tema.inputFondo,
                          color: tema.textoPrincipal,
                          borderColor: tema.borde,
                          fontSize: fs(12),
                        },
                      ]}
                      value={motivoDevolucionInput}
                      onChangeText={setMotivoDevolucionInput}
                      placeholder="Ej. Talla no corresponde..."
                      placeholderTextColor={tema.placeholder}
                    />
                    <Pressable
                      onPress={() => manejarSolicitarDevolucion(pedidoSeleccionado.codigo)}
                      style={[styles.btnConfirmarSi, { backgroundColor: tema.secundario }]}
                    >
                      <Text style={[styles.btnConfirmarSiTxt, { fontSize: fs(12) }]}>
                        Confirmar solicitud de devolución
                      </Text>
                    </Pressable>
                  </View>
                )}

                {/* Atajo HU32 · Centro de ayuda */}
                <Pressable
                  onPress={() => {
                    setPedidoSoportePreseleccionado(pedidoSeleccionado.codigo);
                    irAVista('soporte');
                  }}
                  style={[styles.btnAyudaPedido, { backgroundColor: tema.superficie, borderColor: tema.borde }]}
                >
                  <Text style={[styles.btnAyudaPedidoTxt, { color: tema.textoPrincipal, fontSize: fs(12) }]}>
                    🛟 Solicitar ayuda sobre este pedido (HU32)
                  </Text>
                </Pressable>

                {/* Artículos congelados e inmutables */}
                <View style={[styles.resumenSeparador, { backgroundColor: tema.borde }]} />
                <Text style={[styles.seccionSubtitulo, { color: tema.textoSuave, fontSize: fs(11) }]}>
                  ARTÍCULOS INMUTABLES DEL PEDIDO:
                </Text>
                {(pedidoSeleccionado.articulos || []).map((art, i) => (
                  <View
                    key={`${art.id}-${art.varianteId || i}`}
                    style={[styles.pedidoArticuloRow, { borderBottomColor: tema.borde }]}
                  >
                    <View style={styles.miniaturaWrapper}>
                      <Image
                        source={obtenerFuenteImagen(art)}
                        style={styles.miniaturaImagen}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pedidoArticuloNombre, { color: tema.textoPrincipal, fontSize: fs(13) }]}>
                        {art.nombre}
                      </Text>
                      <Text style={[styles.pedidoArticuloDetalle, { color: tema.info, fontSize: fs(11) }]}>
                        Variante: {art.varianteEtiqueta || 'Estándar'}
                      </Text>
                      <Text style={[styles.pedidoArticuloDetalle, { color: tema.textoSuave, fontSize: fs(11) }]}>
                        {art.cantidad} × {formatearCOP(art.precioUnitario)} COP
                      </Text>
                    </View>
                    <Text style={[styles.pedidoArticuloSubtotal, { color: tema.primario, fontSize: fs(13) }]}>
                      {formatearCOP(art.subtotalLinea)} COP
                    </Text>
                  </View>
                ))}

                <View style={styles.resumenLinea}>
                  <Text style={[styles.resumenLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>
                    Subtotal:
                  </Text>
                  <Text style={[styles.resumenValor, { color: tema.textoPrincipal, fontSize: fs(12) }]}>
                    {formatearCOP(pedidoSeleccionado.subtotal)} COP
                  </Text>
                </View>
                <View style={styles.resumenLinea}>
                  <Text style={[styles.resumenLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>
                    Envío ({pedidoSeleccionado.modalidadEnvio || 'estándar'}):
                  </Text>
                  <Text style={[styles.resumenValor, { color: tema.textoPrincipal, fontSize: fs(12) }]}>
                    {formatearCOP(pedidoSeleccionado.envio)} COP
                  </Text>
                </View>
                <View style={styles.resumenLineaTotal}>
                  <Text style={[styles.resumenTotalLabel, { color: tema.secundario, fontSize: fs(14) }]}>
                    TOTAL REGISTRADO:
                  </Text>
                  <Text style={[styles.resumenTotalValor, { color: tema.primario, fontSize: fs(17) }]}>
                    {formatearCOP(pedidoSeleccionado.total)} COP
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  // VISTA 6: PANEL VENDEDOR (HU18 + HU20)
  const renderVistaVendedor = () => (
    <ScrollView contentContainerStyle={styles.scrollVistaContenedor}>
      <View
        style={[
          styles.encabezadoSeccionBox,
          { backgroundColor: tema.tarjeta, borderLeftColor: tema.primario },
        ]}
      >
        <Text style={[styles.encabezadoSeccionTitulo, { color: tema.textoPrincipal, fontSize: fs(15) }]}>
          ⚙️ PANEL DE VENDEDOR (HU18)
        </Text>
        <Text style={[styles.encabezadoSeccionSub, { color: tema.textoSuave, fontSize: fs(12) }]}>
          Crea o edita productos manteniendo sincronizada la única fuente de stock por variante.
        </Text>
      </View>

      <View
        style={[
          styles.panelSeccionCard,
          { backgroundColor: tema.tarjeta, borderColor: tema.borde },
        ]}
      >
        <Text style={[styles.panelSeccionTitulo, { color: tema.secundario, fontSize: fs(13) }]}>
          {editandoId ? `✏️ EDITAR ${editandoId}` : '➕ NUEVO PRODUCTO'}
        </Text>

        <Text style={[styles.inputLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>Nombre *:</Text>
        <TextInput
          style={[styles.inputCampo, { backgroundColor: tema.inputFondo, color: tema.textoPrincipal, borderColor: tema.borde, fontSize: fs(13) }]}
          value={vendNombre}
          onChangeText={setVendNombre}
          placeholder="Nombre del producto"
          placeholderTextColor={tema.placeholder}
        />

        <Text style={[styles.inputLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>Marca *:</Text>
        <TextInput
          style={[styles.inputCampo, { backgroundColor: tema.inputFondo, color: tema.textoPrincipal, borderColor: tema.borde, fontSize: fs(13) }]}
          value={vendMarca}
          onChangeText={setVendMarca}
          placeholder="Ej. Materials Group UNSC"
          placeholderTextColor={tema.placeholder}
        />

        <Text style={[styles.inputLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>Categoría *:</Text>
        <View style={styles.categoriasVendedorGrid}>
          {MARCA_INFO.categorias.map((cat) => {
            const activa = vendCategoria === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setVendCategoria(cat)}
                style={[
                  styles.chipCategoria,
                  {
                    backgroundColor: activa ? tema.primarioFondo : tema.superficie,
                    borderColor: activa ? tema.primario : tema.borde,
                    marginBottom: 8,
                  },
                ]}
              >
                <Text style={[styles.chipCategoriaTexto, { color: activa ? tema.primario : tema.textoSecundario, fontSize: fs(12) }]}>
                  {CATEGORIAS_CONFIG[cat]?.icono} {cat}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.resenaInputsRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.inputLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>Precio COP *:</Text>
            <TextInput
              style={[styles.inputCampo, { backgroundColor: tema.inputFondo, color: tema.textoPrincipal, borderColor: tema.borde, fontSize: fs(13) }]}
              value={vendPrecio}
              onChangeText={setVendPrecio}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.inputLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>Stock total *:</Text>
            <TextInput
              style={[styles.inputCampo, { backgroundColor: tema.inputFondo, color: tema.textoPrincipal, borderColor: tema.borde, fontSize: fs(13) }]}
              value={vendStock}
              onChangeText={setVendStock}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={[styles.inputLabel, { color: tema.textoSecundario, fontSize: fs(12) }]}>Descripción (mín. 15 chars) *:</Text>
        <TextInput
          style={[styles.inputCampo, { backgroundColor: tema.inputFondo, color: tema.textoPrincipal, borderColor: tema.borde, fontSize: fs(13) }]}
          value={vendDescripcion}
          onChangeText={setVendDescripcion}
        />

        <View style={styles.vendedorBotonesRow}>
          <Pressable
            onPress={guardarProductoVendedor}
            style={[styles.btnConfirmarCompra, { flex: 1, backgroundColor: tema.primarioBoton, borderColor: tema.primario }]}
          >
            <Text style={[styles.btnConfirmarCompraTexto, { fontSize: fs(13) }]}>
              {editandoId ? '💾 Actualizar producto' : '➕ Registrar producto'}
            </Text>
          </Pressable>
          {editandoId && (
            <Pressable
              onPress={limpiarFormularioVendedor}
              style={[styles.btnCancelarEdicion, { backgroundColor: tema.errorFondo, borderColor: tema.error }]}
            >
              <Text style={[styles.btnCancelarEdicionTexto, { color: tema.error, fontSize: fs(12) }]}>
                Cancelar
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View
        style={[
          styles.panelSeccionCard,
          { backgroundColor: tema.tarjeta, borderColor: tema.borde },
        ]}
      >
        <Text style={[styles.panelSeccionTitulo, { color: tema.secundario, fontSize: fs(13) }]}>
          📦 INVENTARIO ({productos.length} PRODUCTOS)
        </Text>
        {productos.map((prod) => (
          <View key={prod.id} style={[styles.inventarioItemRow, { borderBottomColor: tema.borde }]}>
            <View style={styles.miniaturaWrapper}>
              <Image source={obtenerFuenteImagen(prod)} style={styles.miniaturaImagen} resizeMode="contain" />
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.inventarioItemNombre, { color: tema.textoPrincipal, fontSize: fs(12) }]}>
                [{prod.id}] {prod.nombre}
              </Text>
              <Text style={[styles.inventarioItemMeta, { color: tema.textoSuave, fontSize: fs(11) }]}>
                {prod.marca} · {formatearCOP(prod.precio)} COP · Stock sumado: {obtenerStockProducto(prod)}
              </Text>
            </View>
            <Pressable
              onPress={() => cargarProductoParaEditar(prod)}
              style={[styles.btnEditarInventario, { backgroundColor: tema.infoFondo, borderColor: tema.info }]}
            >
              <Text style={[styles.btnEditarInventarioTexto, { color: tema.info, fontSize: fs(11) }]}>
                ✏️ Editar
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.panelSeccionCard,
          { backgroundColor: tema.tarjeta, borderColor: tema.borde },
        ]}
      >
        <Text style={[styles.panelSeccionTitulo, { color: tema.secundario, fontSize: fs(13) }]}>
          🔄 REINICIO DE PRUEBAS (HU20)
        </Text>
        <Pressable
          onPress={restaurarSimulacionCompleta}
          style={[styles.btnRestaurarFabrica, { backgroundColor: tema.secundarioFondo, borderColor: tema.secundario }]}
        >
          <Text style={[styles.btnRestaurarFabricaTexto, { color: tema.secundario, fontSize: fs(12) }]}>
            ⚠️ Restaurar datos iniciales de fábrica v2.0
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  // VISTA 7: MARCA (HU01)
  const renderVistaMarca = () => (
    <ScrollView contentContainerStyle={styles.scrollVistaContenedor}>
      <View
        style={[
          styles.encabezadoSeccionBox,
          { backgroundColor: tema.tarjeta, borderLeftColor: tema.primario },
        ]}
      >
        <Text style={[styles.encabezadoSeccionTitulo, { color: tema.textoPrincipal, fontSize: fs(15) }]}>
          ⬡ IDENTIDAD DE MARCA (HU01)
        </Text>
        <Text style={[styles.encabezadoSeccionSub, { color: tema.textoSuave, fontSize: fs(12) }]}>
          Marca propia heredada del Taller 4 y ampliada para Marketplace 2.0.
        </Text>
      </View>

      <View
        style={[
          styles.panelSeccionCard,
          { backgroundColor: tema.tarjeta, borderColor: tema.borde },
        ]}
      >
        <Text style={[styles.marcaFichaLabel, { color: tema.secundario, fontSize: fs(11) }]}>
          1. NOMBRE COMERCIAL
        </Text>
        <Text style={[styles.marcaFichaValorGrande, { color: tema.primario, fontSize: fs(20) }]}>
          {MARCA_INFO.icono} {MARCA_INFO.nombre} [{MARCA_INFO.codigoMarca}]
        </Text>
        <Text style={[styles.marcaFichaLabel, { color: tema.secundario, fontSize: fs(11) }]}>
          2. ESLOGAN 2.0
        </Text>
        <Text style={[styles.marcaFichaValor, { color: tema.textoPrincipal, fontSize: fs(13) }]}>
          {MARCA_INFO.eslogan}
        </Text>
        <Text style={[styles.marcaFichaLabel, { color: tema.secundario, fontSize: fs(11) }]}>
          3. PROPUESTA DE VALOR
        </Text>
        <Text style={[styles.marcaFichaValor, { color: tema.textoSecundario, fontSize: fs(13) }]}>
          {MARCA_INFO.propuestaValor}
        </Text>
      </View>
    </ScrollView>
  );

  // ==========================================================================
  // 13. BARRA DE NAVEGACIÓN, ACCESIBILIDAD (HU33) Y SHELL PRINCIPAL
  // ==========================================================================
  const pestanasNavegacion = [
    { id: 'catalogo', label: `Catálogo (${productos.length})`, icono: '🛡️' },
    { id: 'comparador', label: `Comparar (${comparacion.length})`, icono: '⚖️' },
    { id: 'favoritos', label: `Favoritos (${favoritos.length})`, icono: '★' },
    { id: 'carrito', label: `Carrito (${resumenCarrito.totalUnidades})`, icono: '🛒' },
    { id: 'direcciones', label: `Direcciones (${direcciones.length})`, icono: '📍' },
    { id: 'historial', label: `Pedidos (${historialPedidos.length})`, icono: '📜' },
    { id: 'notificaciones', label: `Avisos (${noLeidasCount})`, icono: '🔔' },
    { id: 'soporte', label: `Ayuda (${ticketsSoporte.length})`, icono: '🛟' },
    { id: 'vendedor', label: 'Vendedor', icono: '⚙️' },
    { id: 'marca', label: 'Marca', icono: '⬡' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tema.fondo }]}>
      <StatusBar style={tema.statusBar} />

      <View
        style={[
          styles.headerMarca,
          { backgroundColor: tema.headerFondo, borderBottomColor: '#38BDF8' },
        ]}
      >
        <View style={styles.headerTopRow}>
          <View style={[styles.logoBadge, { borderColor: '#38BDF8' }]}>
            <Text style={styles.logoIconoTexto}>{MARCA_INFO.icono}</Text>
            <Text style={[styles.logoCodigoTexto, { color: '#7DD3FC' }]}>
              {MARCA_INFO.codigoMarca}
            </Text>
          </View>

          <View style={styles.headerTextosBox}>
            <Text style={[styles.headerNombreMarca, { fontSize: fs(18) }]}>
              {MARCA_INFO.nombre} 2.0
            </Text>
            <Text style={[styles.headerEslogan, { fontSize: fs(11) }]} numberOfLines={2}>
              {MARCA_INFO.eslogan}
            </Text>
          </View>

          {/* HU33 · Controles de tema oscuro/claro y accesibilidad (letra grande) */}
          <View style={styles.accesibilidadControls}>
            <Pressable
              onPress={() => setModoOscuro((v) => !v)}
              style={styles.btnAccesibilidad}
            >
              <Text style={styles.btnAccesibilidadTxt}>
                {modoOscuro ? '☀️ Claro' : '🌙 Oscuro'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setLetraGrande((v) => !v)}
              style={[
                styles.btnAccesibilidad,
                letraGrande && { borderColor: '#38BDF8', backgroundColor: '#0C2D48' },
              ]}
            >
              <Text style={styles.btnAccesibilidadTxt}>
                {letraGrande ? 'A+ Activa' : 'A / A+'}
              </Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.navBarScroll}
          contentContainerStyle={styles.navBarContent}
        >
          {pestanasNavegacion.map((tab) => {
            const activa =
              vistaActual === tab.id ||
              (vistaActual === 'detalle' && vistaAnterior === tab.id);
            return (
              <Pressable
                key={tab.id}
                onPress={() => irAVista(tab.id)}
                style={[styles.navTab, activa && styles.navTabActiva]}
              >
                <Text
                  style={[
                    styles.navTabTexto,
                    { fontSize: fs(12) },
                    activa && styles.navTabTextoActivo,
                  ]}
                >
                  {tab.icono} {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {retroalimentacion.visible && (
        <View
          style={[
            styles.toastBanner,
            { backgroundColor: tema.infoFondo, borderLeftColor: tema.info },
            retroalimentacion.tipo === 'exito' && {
              backgroundColor: tema.primarioFondo,
              borderLeftColor: tema.primario,
            },
            retroalimentacion.tipo === 'error' && {
              backgroundColor: tema.errorFondo,
              borderLeftColor: tema.error,
            },
            retroalimentacion.tipo === 'alerta' && {
              backgroundColor: tema.secundarioFondo,
              borderLeftColor: tema.secundario,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.toastTitulo, { color: tema.textoPrincipal, fontSize: fs(11) }]}>
              {retroalimentacion.titulo}
            </Text>
            <Text style={[styles.toastMensaje, { color: tema.textoSecundario, fontSize: fs(12) }]}>
              {retroalimentacion.mensaje}
            </Text>
          </View>
          <Pressable
            onPress={() => setRetroalimentacion((prev) => ({ ...prev, visible: false }))}
            style={styles.toastCerrarBtn}
          >
            <Text style={[styles.toastCerrarTexto, { color: tema.textoSuave }]}>✕</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.contenidoPrincipal}>
        {vistaActual === 'catalogo' && renderVistaCatalogo()}
        {vistaActual === 'detalle' && renderVistaDetalle()}
        {vistaActual === 'comparador' && (
          <PanelComparador
            productosComparados={productosComparados}
            tema={tema}
            escala={escala}
            onRetirar={(id) => setComparacion((prev) => prev.filter((x) => x !== id))}
            onLimpiar={() => setComparacion([])}
            onAbrirDetalle={abrirDetalleProducto}
            onIrCatalogo={() => irAVista('catalogo')}
          />
        )}
        {vistaActual === 'favoritos' && renderVistaFavoritos()}
        {vistaActual === 'carrito' && renderVistaCarrito()}
        {vistaActual === 'direcciones' && (
          <VistaDirecciones
            direcciones={direcciones}
            direccionSeleccionadaId={direccionSeleccionadaId}
            tema={tema}
            escala={escala}
            onGuardarDireccion={manejarGuardarDireccion}
            onMarcarPrincipal={manejarMarcarPrincipal}
            onSeleccionarParaCompra={manejarSeleccionarDireccion}
            onEliminarDireccion={manejarEliminarDireccion}
            onIrCarrito={() => irAVista('carrito')}
          />
        )}
        {vistaActual === 'historial' && renderVistaHistorial()}
        {vistaActual === 'notificaciones' && (
          <VistaNotificaciones
            notificaciones={notificaciones}
            tema={tema}
            escala={escala}
            onMarcarLeida={(id) =>
              setNotificaciones((prev) => marcarNotificacionLeida(prev, id))
            }
            onMarcarTodasLeidas={() =>
              setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
            }
            onIrPedidos={() => irAVista('historial')}
          />
        )}
        {vistaActual === 'soporte' && (
          <VistaSoporte
            pedidos={historialPedidos}
            tickets={ticketsSoporte}
            pedidoPreseleccionado={pedidoSoportePreseleccionado}
            tema={tema}
            escala={escala}
            onCrearTicket={manejarCrearTicketSoporte}
            onSimularRespuesta={manejarSimularRespuestaTicket}
          />
        )}
        {vistaActual === 'vendedor' && renderVistaVendedor()}
        {vistaActual === 'marca' && renderVistaMarca()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 28 : 0,
  },
  headerMarca: {
    borderBottomWidth: 2,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconoTexto: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '900',
  },
  logoCodigoTexto: {
    fontSize: 9,
    fontWeight: '800',
  },
  headerTextosBox: {
    flex: 1,
    minWidth: 140,
  },
  headerNombreMarca: {
    color: '#F8FAFC',
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  headerEslogan: {
    color: '#CBD5E1',
    fontWeight: '500',
    marginTop: 2,
  },
  accesibilidadControls: {
    flexDirection: 'row',
    gap: 6,
  },
  btnAccesibilidad: {
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  btnAccesibilidadTxt: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  navBarScroll: {
    marginTop: 2,
  },
  navBarContent: {
    paddingVertical: 2,
  },
  navTab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
    marginRight: 8,
  },
  navTabActiva: {
    backgroundColor: '#0284C7',
    borderColor: '#7DD3FC',
  },
  navTabTexto: {
    color: '#CBD5E1',
    fontWeight: '700',
  },
  navTabTextoActivo: {
    color: '#FFFFFF',
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
  },
  toastTitulo: {
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  toastMensaje: {
    marginTop: 2,
  },
  toastCerrarBtn: {
    padding: 6,
    marginLeft: 8,
  },
  toastCerrarTexto: {
    fontSize: 14,
    fontWeight: '800',
  },
  contenidoPrincipal: {
    flex: 1,
  },
  listaContenedor: {
    padding: 12,
    paddingBottom: 32,
  },
  scrollVistaContenedor: {
    padding: 12,
    paddingBottom: 36,
  },
  panelFiltrosContainer: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  bannerComparadorRapido: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 9,
    marginBottom: 8,
  },
  bannerComparadorTxt: {
    fontWeight: '800',
  },
  seccionSubtitulo: {
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 6,
  },
  buscadorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputBuscador: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  btnLimpiarBusqueda: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  btnLimpiarBusquedaTexto: {
    fontWeight: '800',
  },
  chipsScroll: {
    marginBottom: 8,
  },
  chipCategoria: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipCategoriaTexto: {
    fontWeight: '700',
  },
  rangoPrecioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  inputPrecioRango: {
    flex: 1,
    minWidth: 95,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  btnAplicarRango: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  btnAplicarRangoTxt: {
    fontWeight: '800',
  },
  errorInlineTxt: {
    fontWeight: '800',
    marginBottom: 6,
  },
  filtrosExtrasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  btnToggleDisp: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  btnToggleDispTxt: {
    fontWeight: '800',
  },
  btnRestablecer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  btnRestablecerTxt: {
    fontWeight: '800',
  },
  ordenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  btnOrden: {
    flex: 1,
    minWidth: 95,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnOrdenTexto: {
    fontWeight: '700',
  },
  barraEstadoCatalogo: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
  },
  barraEstadoCatalogoTexto: {
    fontWeight: '600',
  },
  cardProducto: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardVisualHeader: {
    padding: 12,
    borderBottomWidth: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  badgeCodigo: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeCodigoTexto: {
    fontWeight: '800',
  },
  btnFavoritoIcono: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  btnFavoritoIconoActivo: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  btnFavoritoTexto: {
    color: '#0284C7',
    fontWeight: '800',
  },
  cardImagenWrapper: {
    width: '100%',
    height: 170,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginBottom: 8,
  },
  cardImagenOficial: {
    width: '100%',
    height: '100%',
  },
  cardFooterHudRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategoriaTag: {
    fontWeight: '800',
  },
  cardEstrellasTexto: {
    fontWeight: '700',
  },
  cardBody: {
    padding: 12,
  },
  cardNombre: {
    fontWeight: '800',
    marginBottom: 4,
  },
  cardDescripcionBreve: {
    lineHeight: 17,
    marginBottom: 8,
  },
  badgeVariantesCard: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  badgeVariantesCardTxt: {
    fontWeight: '700',
  },
  cardPrecioStockRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardPrecioLabel: {
    fontWeight: '700',
  },
  cardPrecioValor: {
    fontWeight: '900',
  },
  badgeStock: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeStockTexto: {
    fontWeight: '800',
  },
  indicadorEnCarrito: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  indicadorEnCarritoTexto: {
    fontWeight: '700',
  },
  cardActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  btnSecundarioCard: {
    flex: 1,
    minWidth: 110,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnSecundarioCardTexto: {
    fontWeight: '700',
  },
  btnPrimarioCard: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPrimarioCardTexto: {
    fontWeight: '800',
  },
  miniaturaWrapper: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    padding: 4,
  },
  miniaturaImagen: {
    width: '100%',
    height: '100%',
  },
  estadoVacioBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    marginVertical: 10,
  },
  estadoVacioIcono: {
    fontSize: 40,
    marginBottom: 8,
  },
  estadoVacioTitulo: {
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  estadoVacioSubtitulo: {
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 14,
  },
  btnAccionVacio: {
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
  },
  btnAccionVacioTexto: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  detalleTopBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  btnVolver: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnVolverTexto: {
    fontWeight: '800',
  },
  btnFavoritoDetalle: {
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detalleCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  detalleHeroBanner: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  detalleImagenWrapper: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 10,
  },
  detalleImagenOficial: {
    width: '100%',
    height: '100%',
  },
  detalleInsigniaCodigo: {
    fontWeight: '900',
  },
  detalleCategoriaTexto: {
    fontWeight: '600',
    marginTop: 4,
  },
  detalleContenido: {
    padding: 16,
  },
  detalleTitulo: {
    fontWeight: '900',
    marginBottom: 12,
  },
  detalleMetricasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  detalleMetricaCaja: {
    flex: 1,
    minWidth: 95,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  detalleMetricaLabel: {
    fontWeight: '800',
    marginBottom: 2,
  },
  detallePrecioValor: {
    fontWeight: '900',
  },
  detalleStockValor: {
    fontWeight: '800',
  },
  detalleEstrellasValor: {
    fontWeight: '800',
  },
  variantesPanel: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  variantesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  chipVariante: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chipVarianteTitulo: {
    fontWeight: '800',
  },
  chipVarianteMeta: {
    marginTop: 2,
    fontWeight: '600',
  },
  avisoElegirVariante: {
    fontWeight: '700',
    marginBottom: 8,
  },
  cantidadDetalleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  cantidadDetalleLabel: {
    fontWeight: '700',
  },
  detalleSeccionLabel: {
    fontWeight: '800',
    marginBottom: 4,
  },
  detalleDescripcionTexto: {
    lineHeight: 21,
    marginBottom: 14,
  },
  detalleSpecsBox: {
    borderLeftWidth: 3,
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
  },
  detalleSpecsTitulo: {
    fontWeight: '800',
    marginBottom: 3,
  },
  detalleSpecsTexto: {
    lineHeight: 17,
  },
  btnAgregarGrande: {
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnAgregarGrandeTexto: {
    fontWeight: '900',
    textAlign: 'center',
  },
  btnCompartir: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnCompartirTxt: {
    fontWeight: '800',
  },
  cajaCompartirPreview: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  cajaCompartirTitulo: {
    fontWeight: '900',
    marginBottom: 4,
  },
  cajaCompartirTexto: {
    lineHeight: 18,
  },
  reposicionBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  reposicionTitulo: {
    fontWeight: '900',
    marginBottom: 4,
  },
  reposicionSub: {
    marginBottom: 8,
  },
  reposicionBtnsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  btnSuscripcion: {
    flex: 1,
    minWidth: 150,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  btnSuscripcionTxt: {
    fontWeight: '800',
    textAlign: 'center',
  },
  btnSimularRepo: {
    flex: 1,
    minWidth: 150,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  btnSimularRepoTxt: {
    fontWeight: '800',
    textAlign: 'center',
  },
  resenasPanel: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  resenasTitulo: {
    fontWeight: '900',
  },
  resenasPromedioSub: {
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 10,
  },
  vacioSuaveTxt: {
    fontStyle: 'italic',
  },
  respuestaSimuladaPregunta: {
    marginTop: 6,
    fontWeight: '700',
    lineHeight: 18,
  },
  btnSimularRespuestaPreg: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  btnSimularRespuestaPregTxt: {
    fontWeight: '800',
  },
  recomendacionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  recomendacionNombre: {
    fontWeight: '800',
  },
  recomendacionMeta: {
    fontWeight: '700',
    marginTop: 2,
  },
  estrellasBotonesRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  btnEstrellaOpcion: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },
  btnEstrellaOpcionTexto: {
    fontWeight: '800',
  },
  resenaInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnGuardarResena: {
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  btnGuardarResenaTexto: {
    fontWeight: '800',
  },
  resenaItemCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  resenaItemHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resenaItemAutor: {
    fontWeight: '800',
  },
  resenaItemEstrellas: {
    fontWeight: '800',
  },
  resenaItemComentario: {
    lineHeight: 18,
  },
  encabezadoSeccionBox: {
    borderRadius: 10,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 12,
  },
  encabezadoSeccionTitulo: {
    fontWeight: '900',
  },
  encabezadoSeccionSub: {
    marginTop: 2,
    lineHeight: 17,
  },
  panelSeccionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  panelSeccionTitulo: {
    fontWeight: '900',
    marginBottom: 4,
  },
  panelSeccionAyuda: {
    lineHeight: 17,
    marginBottom: 10,
  },
  listaCarritoBox: {
    marginBottom: 14,
  },
  listaCarritoHeaderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  linkVaciarCarrito: {
    fontWeight: '700',
  },
  carritoItemCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  carritoItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  carritoItemNombre: {
    fontWeight: '800',
  },
  carritoVariantTag: {
    fontWeight: '700',
    marginTop: 2,
  },
  carritoItemMeta: {
    marginTop: 2,
  },
  carritoItemControlesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  cantidadControlesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnCantidad: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCantidadTexto: {
    fontSize: 18,
    fontWeight: '900',
  },
  cantidadValorBox: {
    paddingHorizontal: 12,
  },
  cantidadValorTexto: {
    fontWeight: '900',
  },
  subtotalLineaBox: {
    alignItems: 'flex-end',
  },
  subtotalLineaLabel: {},
  subtotalLineaValor: {
    fontWeight: '800',
  },
  btnEliminarItem: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnEliminarItemTexto: {
    fontWeight: '800',
  },
  cuponRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnAplicarCupon: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnAplicarCuponTexto: {
    fontWeight: '800',
  },
  cuponActivoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  cuponActivoTexto: {
    fontWeight: '700',
  },
  linkQuitarCupon: {
    fontWeight: '800',
  },
  resumenLinea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  resumenLabel: {},
  resumenValor: {
    fontWeight: '800',
  },
  resumenSeparador: {
    height: 1,
    marginVertical: 8,
  },
  resumenLineaTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  resumenTotalLabel: {
    fontWeight: '900',
  },
  resumenTotalValor: {
    fontWeight: '900',
  },
  avisoSimulacionBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  avisoSimulacionTexto: {
    fontWeight: '700',
    lineHeight: 17,
  },
  inputLabel: {
    fontWeight: '700',
    marginBottom: 4,
  },
  inputCampo: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
  },
  municipiosChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  chipMunicipio: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  chipMunicipioTexto: {
    fontWeight: '700',
  },
  btnValidarPrevia: {
    borderWidth: 1,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnValidarPreviaTexto: {
    fontWeight: '800',
  },
  preConfirmacionResumenBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  preConfirmacionTitulo: {
    fontWeight: '900',
    marginBottom: 4,
  },
  preConfirmacionTexto: {
    marginBottom: 2,
  },
  btnConfirmarCompra: {
    borderWidth: 1,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnConfirmarCompraTexto: {
    color: '#F8FAFC',
    fontWeight: '900',
  },
  confirmacionPedidoBox: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  confirmacionPedidoTag: {
    fontWeight: '900',
  },
  confirmacionPedidoCodigo: {
    fontWeight: '900',
    marginVertical: 4,
  },
  confirmacionPedidoDetalle: {},
  confirmacionPedidoTotal: {
    fontWeight: '900',
    marginVertical: 4,
  },
  btnIrHistorialConfirm: {
    marginTop: 10,
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnIrHistorialConfirmTexto: {
    fontWeight: '800',
  },
  pedidoListaCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  pedidoListaTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pedidoCodigoTexto: {
    fontWeight: '900',
  },
  pedidoEstadoPill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontWeight: '900',
  },
  pedidoFechaTexto: {},
  pedidoCompradorTexto: {
    marginTop: 2,
  },
  pedidoDetallePanel: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  pedidoDetalleTitulo: {
    fontWeight: '900',
    marginBottom: 6,
  },
  pedidoDetalleMeta: {
    marginBottom: 2,
  },
  timelineItem: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 4,
    marginBottom: 6,
  },
  timelineEstado: {
    fontWeight: '800',
  },
  timelineDetalle: {
    marginTop: 1,
  },
  btnAvanceEntrega: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  btnAvanceEntregaTxt: {
    fontWeight: '800',
    textAlign: 'center',
  },
  btnCancelarPedido: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnCancelarPedidoTxt: {
    fontWeight: '800',
    textAlign: 'center',
  },
  confirmacionCancelBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  confirmacionCancelTxt: {
    fontWeight: '800',
    marginBottom: 8,
  },
  confirmacionCancelBtns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  btnConfirmarSi: {
    flex: 1,
    minWidth: 130,
    borderRadius: 6,
    paddingVertical: 9,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  btnConfirmarSiTxt: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  btnConfirmarNo: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 9,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  btnConfirmarNoTxt: {
    fontWeight: '800',
  },
  btnDevolucion: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDevolucionTxt: {
    fontWeight: '800',
    textAlign: 'center',
  },
  btnAyudaPedido: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnAyudaPedidoTxt: {
    fontWeight: '700',
    textAlign: 'center',
  },
  pedidoArticuloRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  pedidoArticuloNombre: {
    fontWeight: '700',
  },
  pedidoArticuloDetalle: {},
  pedidoArticuloSubtotal: {
    fontWeight: '800',
  },
  categoriasVendedorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  vendedorBotonesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  btnCancelarEdicion: {
    marginLeft: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 8,
  },
  btnCancelarEdicionTexto: {
    fontWeight: '800',
  },
  inventarioItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  inventarioItemNombre: {
    fontWeight: '700',
  },
  inventarioItemMeta: {},
  btnEditarInventario: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnEditarInventarioTexto: {
    fontWeight: '800',
  },
  btnRestaurarFabrica: {
    borderWidth: 1,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnRestaurarFabricaTexto: {
    fontWeight: '800',
  },
  marcaFichaLabel: {
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 4,
  },
  marcaFichaValorGrande: {
    fontWeight: '900',
  },
  marcaFichaValor: {
    lineHeight: 19,
  },
});
