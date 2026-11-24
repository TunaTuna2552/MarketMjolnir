import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  FlatList,
  Pressable,
  SafeAreaView,
  Platform,
} from 'react-native';

import {
  INFO_MARCA,
  CATEGORIAS,
  CATEGORIAS_VENDEDOR,
  COLORES_CATEGORIA,
  REGLAS_NEGOCIO,
} from './src/data/productosIniciales.js';

import {
  formatearCOP,
  calcularPromedioResenas,
  clonarProductosIniciales,
  cargarEstadoLocal,
  guardarEstadoLocal,
  limpiarEstadoLocal,
  sanitizarEstadoRecuperado,
} from './src/utils/persistencia.js';

export default function App() {
  // =========================================================================
  // 1. ESTADOS PRINCIPALES DEL MARKETPLACE (useState)
  // =========================================================================
  const [productos, setProductos] = useState(() => clonarProductosIniciales());
  const [favoritos, setFavoritos] = useState([]); // Arreglo de IDs de productos favoritos (HU08)
  const [carrito, setCarrito] = useState([]); // Arreglo de objetos { id, nombre, precio, categoria, icono, cantidad }
  const [historialPedidos, setHistorialPedidos] = useState([]); // Pedidos confirmados (HU15)

  // Navegación entre vistas (HU02): 'catalogo' | 'detalle' | 'favoritos' | 'carrito' | 'historial' | 'vendedor'
  const [vistaActual, setVistaActual] = useState('catalogo');
  const [vistaAnterior, setVistaAnterior] = useState('catalogo');
  const [productoDetalleId, setProductoDetalleId] = useState(null);
  const [pedidoDetalleId, setPedidoDetalleId] = useState(null);

  // Filtros y ordenamiento del catálogo (HU04, HU05, HU06)
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [ordenPrecio, setOrdenPrecio] = useState('ninguno'); // 'ninguno' | 'asc' | 'desc'

  // Cupón promocional en carrito (HU17)
  const [textoCupon, setTextoCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null); // 'BIENVENIDO10' | null

  // Datos básicos del comprador (HU12)
  const [datosComprador, setDatosComprador] = useState({
    nombre: '',
    telefono: '',
    municipio: 'Mosquera',
    direccion: '',
  });
  const [mostrarRevisionPrevia, setMostrarRevisionPrevia] = useState(false);
  const [ultimoPedidoConfirmado, setUltimoPedidoConfirmado] = useState(null);

  // Estado para formulario de Panel de Vendedor (HU18)
  const [idProductoEditando, setIdProductoEditando] = useState(null);
  const [formVendedor, setFormVendedor] = useState({
    nombre: '',
    categoria: 'Tecnología',
    precio: '',
    stock: '',
    descripcion: '',
    icono: '',
  });

  // Estado para Reseñas ficticias en el detalle del producto (HU19)
  const [calificacionInput, setCalificacionInput] = useState('5');

  // Paneles desplegables de cabecera (HU01 Ficha de Marca y HU20 Persistencia)
  const [mostrarFichaMarca, setMostrarFichaMarca] = useState(false);
  const [mostrarPanelPersistencia, setMostrarPanelPersistencia] = useState(false);

  // Retroalimentación visual global de la interfaz (HU16)
  const [feedback, setFeedback] = useState({
    visible: false,
    tipo: 'info', // 'exito' | 'error' | 'advertencia' | 'info'
    mensaje: '',
  });

  const [hidratado, setHidratado] = useState(false);

  // =========================================================================
  // 2. PERSISTENCIA LOCAL AL INICIAR Y ACTUALIZAR (HU20)
  // =========================================================================
  useEffect(() => {
    const estadoRecuperado = cargarEstadoLocal();
    if (estadoRecuperado.fueRecuperado) {
      setProductos(estadoRecuperado.productos);
      setFavoritos(estadoRecuperado.favoritos);
      setCarrito(estadoRecuperado.carrito);
      setHistorialPedidos(estadoRecuperado.historialPedidos);
      setCuponAplicado(estadoRecuperado.cuponAplicado);
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    guardarEstadoLocal({
      productos,
      favoritos,
      carrito,
      historialPedidos,
      cuponAplicado,
    });
  }, [productos, favoritos, carrito, historialPedidos, cuponAplicado, hidratado]);

  // Función auxiliar para mostrar mensajes claros al usuario (HU16)
  const mostrarMensaje = (mensaje, tipo = 'info') => {
    setFeedback({ visible: true, tipo, mensaje });
  };

  const cerrarMensaje = () => {
    setFeedback({ visible: false, tipo: 'info', mensaje: '' });
  };

  // =========================================================================
  // 3. LÓGICA DE NAVEGACIÓN (HU02 y HU07)
  // =========================================================================
  const irAVista = (nuevaVista) => {
    setVistaActual(nuevaVista);
    if (nuevaVista !== 'carrito') {
      setMostrarRevisionPrevia(false);
    }
  };

  const abrirDetalleProducto = (idProducto, origenVista = 'catalogo') => {
    setVistaAnterior(origenVista);
    setProductoDetalleId(idProducto);
    setCalificacionInput('5');
    setVistaActual('detalle');
  };

  const volverDeDetalle = () => {
    const destino = vistaAnterior || 'catalogo';
    setVistaActual(destino);
  };

  // =========================================================================
  // 4. FILTRADO Y ORDENAMIENTO DEL CATÁLOGO (HU03, HU04, HU05, HU06)
  // =========================================================================
  const terminoLimpio = busqueda.trim().toLowerCase();

  // Aplicamos conjuntamente filtro de categoría y búsqueda por palabra clave (.filter)
  const productosFiltrados = productos.filter((prod) => {
    const coincideCategoria =
      categoriaSeleccionada === 'Todas' || prod.categoria === categoriaSeleccionada;
    const coincideBusqueda =
      terminoLimpio === '' || prod.nombre.toLowerCase().includes(terminoLimpio);
    return coincideCategoria && coincideBusqueda;
  });

  // Ordenamos por precio sobre una copia inmutable del conjunto ya filtrado (.sort)
  const productosVisibles = [...productosFiltrados].sort((a, b) => {
    if (ordenPrecio === 'asc') {
      return a.precio - b.precio;
    }
    if (ordenPrecio === 'desc') {
      return b.precio - a.precio;
    }
    return 0;
  });

  const limpiarFiltrosCatalogo = () => {
    setBusqueda('');
    setCategoriaSeleccionada('Todas');
    setOrdenPrecio('ninguno');
    mostrarMensaje('Se restablecieron los filtros y la búsqueda del catálogo.', 'info');
  };

  // =========================================================================
  // 5. GESTIÓN DE FAVORITOS (HU08)
  // =========================================================================
  const alternarFavorito = (idProducto) => {
    const prod = productos.find((p) => p.id === idProducto);
    const nombreProd = prod ? prod.nombre : idProducto;
    const yaEsFavorito = favoritos.includes(idProducto);

    if (yaEsFavorito) {
      setFavoritos(favoritos.filter((id) => id !== idProducto));
      mostrarMensaje(`"${nombreProd}" se eliminó de tu lista de favoritos.`, 'info');
    } else {
      setFavoritos([...favoritos, idProducto]);
      mostrarMensaje(`❤️ "${nombreProd}" se guardó en tus favoritos.`, 'exito');
    }
  };

  const listaProductosFavoritos = productos.filter((p) => favoritos.includes(p.id));

  // =========================================================================
  // 6. GESTIÓN DEL CARRITO Y REGLAS DE STOCK (HU09 y HU10)
  // =========================================================================
  const obtenerCantidadEnCarrito = (idProducto) => {
    const item = carrito.find((i) => i.id === idProducto);
    return item ? item.cantidad : 0;
  };

  const agregarAlCarrito = (producto) => {
    if (!producto) return;

    // HU09 CA03: Producto agotado (stock === 0) no puede agregarse
    if (producto.stock <= 0) {
      mostrarMensaje(
        `No es posible agregar "${producto.nombre}" porque está AGOTADO (stock: 0).`,
        'error'
      );
      return;
    }

    const itemExistente = carrito.find((item) => item.id === producto.id);
    const cantidadActual = itemExistente ? itemExistente.cantidad : 0;

    // HU09 CA02: Impedir superar el stock disponible con advertencia clara
    if (cantidadActual + 1 > producto.stock) {
      mostrarMensaje(
        `Advertencia de stock: Ya tienes en el carrito el máximo disponible (${producto.stock} uds.) de "${producto.nombre}".`,
        'advertencia'
      );
      return;
    }

    setUltimoPedidoConfirmado(null);

    if (itemExistente) {
      // Actualización inmutable con .map()
      const nuevoCarrito = carrito.map((item) =>
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      );
      setCarrito(nuevoCarrito);
      mostrarMensaje(
        `Se aumentó a ${cantidadActual + 1} uds. de "${producto.nombre}" en el carrito.`,
        'exito'
      );
    } else {
      const nuevaLinea = {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        categoria: producto.categoria,
        icono: producto.icono,
        cantidad: 1,
      };
      setCarrito([...carrito, nuevaLinea]);
      mostrarMensaje(`🛒 "${producto.nombre}" se agregó al carrito (1 unidad).`, 'exito');
    }
  };

  const cambiarCantidadCarrito = (idProducto, delta) => {
    const itemCarrito = carrito.find((i) => i.id === idProducto);
    const prodCatalogo = productos.find((p) => p.id === idProducto);
    if (!itemCarrito || !prodCatalogo) return;

    const nuevaCantidad = itemCarrito.cantidad + delta;

    // HU10 CA04: Si tiene cantidad 1 e intenta disminuir a 0, exigir usar Eliminar sin permitir 0 ni negativos
    if (nuevaCantidad < 1) {
      mostrarMensaje(
        `La cantidad mínima es 1 unidad. Si deseas quitar "${itemCarrito.nombre}", presiona el botón "Eliminar".`,
        'advertencia'
      );
      return;
    }

    // HU10 CA01: Solo aumentar si existe stock suficiente en el catálogo
    if (nuevaCantidad > prodCatalogo.stock) {
      mostrarMensaje(
        `Stock insuficiente: Solo existen ${prodCatalogo.stock} unidades disponibles de "${itemCarrito.nombre}".`,
        'advertencia'
      );
      return;
    }

    const carritoActualizado = carrito.map((item) =>
      item.id === idProducto ? { ...item, cantidad: nuevaCantidad } : item
    );
    setCarrito(carritoActualizado);
    mostrarMensaje(
      `Cantidad de "${itemCarrito.nombre}" actualizada a ${nuevaCantidad} ${
        nuevaCantidad === 1 ? 'unidad' : 'unidades'
      }.`,
      'info'
    );
  };

  const eliminarDelCarrito = (idProducto) => {
    const item = carrito.find((i) => i.id === idProducto);
    const nuevoCarrito = carrito.filter((i) => i.id !== idProducto);
    setCarrito(nuevoCarrito);
    if (nuevoCarrito.length === 0) {
      setCuponAplicado(null);
      setMostrarRevisionPrevia(false);
    }
    if (item) {
      mostrarMensaje(`"${item.nombre}" fue eliminado del carrito.`, 'info');
    }
  };

  // =========================================================================
  // 7. CÁLCULOS DE SUBTOTAL, CUPÓN, ENVÍO Y TOTAL (HU11 y HU17)
  // =========================================================================
  const totalUnidadesCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  // Subtotal = suma(cantidad * precio unitario) mediante .reduce() (HU11 CA01)
  const subtotalCarrito = carrito.reduce((acc, item) => acc + item.cantidad * item.precio, 0);

  // Descuento del cupón promocional BIENVENIDO10 (10 % del subtotal, HU17 CA01 y CA03)
  const valorDescuento =
    carrito.length > 0 && cuponAplicado === REGLAS_NEGOCIO.CODIGO_CUPON_VALIDO
      ? Math.round(subtotalCarrito * REGLAS_NEGOCIO.PORCENTAJE_DESCUENTO_CUPON)
      : 0;

  // Envío simulado (HU11 CA02, CA03, CA04):
  // - $0 si el carrito está vacío
  // - $8.000 si subtotal < $150.000
  // - $0 (GRATIS) si subtotal >= $150.000
  const costoEnvio =
    carrito.length === 0
      ? 0
      : subtotalCarrito >= REGLAS_NEGOCIO.TOPE_ENVIO_GRATIS
      ? 0
      : REGLAS_NEGOCIO.COSTO_ENVIO_ESTANDAR;

  // Total = (subtotal - descuento) + envío, garantizando que nunca sea negativo
  const totalPagar =
    carrito.length === 0 ? 0 : Math.max(0, subtotalCarrito - valorDescuento) + costoEnvio;

  const aplicarCupon = () => {
    if (carrito.length === 0) {
      mostrarMensaje('Agrega productos al carrito antes de aplicar un cupón.', 'advertencia');
      return;
    }

    const codigoNormalizado = textoCupon.trim().toUpperCase();
    if (!codigoNormalizado) {
      mostrarMensaje('Por favor escribe un código de cupón para validarlo.', 'advertencia');
      return;
    }

    if (codigoNormalizado === REGLAS_NEGOCIO.CODIGO_CUPON_VALIDO) {
      setCuponAplicado(REGLAS_NEGOCIO.CODIGO_CUPON_VALIDO);
      setTextoCupon('BIENVENIDO10');
      mostrarMensaje(
        '🎉 Cupón BIENVENIDO10 aplicado con éxito: tienes 10% de descuento sobre el subtotal.',
        'exito'
      );
    } else {
      // HU17 CA02: Código desconocido se rechaza sin modificar el total
      mostrarMensaje(
        `El código "${textoCupon.trim()}" no es válido. Fue rechazado sin modificar el total.`,
        'error'
      );
    }
  };

  const quitarCupon = () => {
    setCuponAplicado(null);
    setTextoCupon('');
    mostrarMensaje('Se retiró el cupón promocional del carrito.', 'info');
  };

  // =========================================================================
  // 8. VALIDACIÓN DEL COMPRADOR Y CONFIRMACIÓN DE COMPRA (HU12, HU13, HU14)
  // =========================================================================
  const obtenerCamposFaltantesComprador = () => {
    const faltantes = [];
    if (!datosComprador.nombre || datosComprador.nombre.trim().length === 0) {
      faltantes.push('Nombre completo');
    }
    if (!datosComprador.telefono || datosComprador.telefono.trim().length === 0) {
      faltantes.push('Teléfono de contacto');
    }
    if (!datosComprador.municipio || datosComprador.municipio.trim().length === 0) {
      faltantes.push('Municipio');
    }
    if (!datosComprador.direccion || datosComprador.direccion.trim().length === 0) {
      faltantes.push('Dirección de entrega');
    }
    return faltantes;
  };

  const revisarResumenAntesDeConfirmar = () => {
    if (carrito.length === 0) {
      mostrarMensaje('El carrito está vacío. Agrega productos antes de continuar.', 'error');
      return;
    }

    const faltantes = obtenerCamposFaltantesComprador();
    if (faltantes.length > 0) {
      setMostrarRevisionPrevia(false);
      mostrarMensaje(
        `No puedes continuar. Faltan los siguientes datos obligatorios: ${faltantes.join(', ')}.`,
        'error'
      );
      return;
    }

    setMostrarRevisionPrevia(true);
    mostrarMensaje(
      '✅ Datos del comprador completos. Revisa el resumen final y presiona "Confirmar compra simulada".',
      'exito'
    );
  };

  const confirmarCompraSimulada = () => {
    if (carrito.length === 0) {
      mostrarMensaje('No hay productos en el carrito para confirmar un pedido.', 'error');
      return;
    }

    // 1. Validar datos obligatorios del comprador (HU12 CA02)
    const faltantes = obtenerCamposFaltantesComprador();
    if (faltantes.length > 0) {
      mostrarMensaje(
        `Operación impedida. Completa los campos obligatorios faltantes: ${faltantes.join(', ')}.`,
        'error'
      );
      return;
    }

    // 2. Verificar existencias de TODOS los artículos antes de descontar (HU13 CA02)
    const articuloSinStock = carrito.find((itemCarrito) => {
      const prodActual = productos.find((p) => p.id === itemCarrito.id);
      return !prodActual || prodActual.stock < itemCarrito.cantidad || itemCarrito.cantidad <= 0;
    });

    if (articuloSinStock) {
      mostrarMensaje(
        `Operación cancelada: "${articuloSinStock.nombre}" no cuenta con stock suficiente. No se descontó ningún artículo del inventario.`,
        'error'
      );
      return;
    }

    // 3. Descontar inventario de forma inmutable y sin stock negativo (HU14 CA01, CA03)
    const productosActualizados = productos.map((prod) => {
      const itemComprado = carrito.find((i) => i.id === prod.id);
      if (!itemComprado) return prod;
      const nuevoStock = Math.max(0, prod.stock - itemComprado.cantidad);
      return { ...prod, stock: nuevoStock };
    });

    // 4. Generar código único de pedido y copia independiente para el historial (HU13 CA01 y HU15 CA03)
    const consecutivo = historialPedidos.length + 1;
    const sufijoTiempo = Date.now().toString().slice(-4);
    const codigoUnico = `PED-MM-${String(consecutivo).padStart(3, '0')}-${sufijoTiempo}`;

    const ahora = new Date();
    const fechaFormateada = `${ahora.toLocaleDateString('es-CO')} · ${ahora.toLocaleTimeString(
      'es-CO',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    )}`;

    const articulosCopiaInmutable = carrito.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      categoria: item.categoria,
      precioUnitario: item.precio,
      cantidad: item.cantidad,
      subtotalLinea: item.precio * item.cantidad,
    }));

    const nuevoPedido = {
      idPedido: codigoUnico,
      fechaHora: fechaFormateada,
      comprador: {
        nombre: datosComprador.nombre.trim(),
        telefono: datosComprador.telefono.trim(),
        municipio: datosComprador.municipio.trim(),
        direccion: datosComprador.direccion.trim(),
      },
      articulos: articulosCopiaInmutable,
      subtotal: subtotalCarrito,
      cupon: cuponAplicado,
      descuento: valorDescuento,
      envio: costoEnvio,
      total: totalPagar,
      notaSimulacion:
        'Simulación académica local realizada en MarketMjolnir. Sin cobro bancario ni transacción financiera real.',
    };

    // 5. Actualizar estados: catálogo, historial y vaciar carrito (HU13 CA03)
    setProductos(productosActualizados);
    setHistorialPedidos([nuevoPedido, ...historialPedidos]);
    setCarrito([]);
    setCuponAplicado(null);
    setTextoCupon('');
    setMostrarRevisionPrevia(false);
    setUltimoPedidoConfirmado(nuevoPedido);
    setPedidoDetalleId(nuevoPedido.idPedido);

    mostrarMensaje(
      `🎉 ¡Pedido ${codigoUnico} confirmado! Es una simulación académica sin cobro real. El inventario fue actualizado.`,
      'exito'
    );
  };

  // =========================================================================
  // 9. PANEL DE VENDEDOR: CREAR Y EDITAR PRODUCTOS (HU18)
  // =========================================================================
  const cargarProductoParaEditar = (producto) => {
    setIdProductoEditando(producto.id);
    setFormVendedor({
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: String(producto.precio),
      stock: String(producto.stock),
      descripcion: producto.descripcion,
      icono: producto.icono || '',
    });
    mostrarMensaje(
      `Editando "${producto.nombre}" (${producto.id}). Modifica los campos y guarda los cambios.`,
      'info'
    );
  };

  const limpiarFormularioVendedor = () => {
    setIdProductoEditando(null);
    setFormVendedor({
      nombre: '',
      categoria: 'Tecnología',
      precio: '',
      stock: '',
      descripcion: '',
      icono: '',
    });
  };

  const guardarProductoVendedor = () => {
    const nombreLimpio = formVendedor.nombre.trim();
    const descripcionLimpia = formVendedor.descripcion.trim();
    const precioNum = Number(formVendedor.precio);
    const stockNum = Number(formVendedor.stock);

    // Validaciones (HU18 CA03 y reglas de negocio Sección 6)
    if (!nombreLimpio) {
      mostrarMensaje('Error de validación: El nombre del producto no puede estar vacío.', 'error');
      return;
    }

    if (!CATEGORIAS_VENDEDOR.includes(formVendedor.categoria)) {
      mostrarMensaje('Error de validación: Selecciona una categoría válida.', 'error');
      return;
    }

    if (
      formVendedor.precio.toString().trim() === '' ||
      !Number.isInteger(precioNum) ||
      precioNum <= 0
    ) {
      mostrarMensaje(
        'Error de validación: El precio debe ser un número entero positivo mayor a $0 COP (sin decimales).',
        'error'
      );
      return;
    }

    if (
      formVendedor.stock.toString().trim() === '' ||
      !Number.isInteger(stockNum) ||
      stockNum < 0
    ) {
      mostrarMensaje(
        'Error de validación: El stock debe ser un número entero no negativo (0 o mayor).',
        'error'
      );
      return;
    }

    if (descripcionLimpia.length < 15) {
      mostrarMensaje(
        `Error de validación: La descripción debe tener al menos 15 caracteres (actual: ${descripcionLimpia.length}).`,
        'error'
      );
      return;
    }

    const inicialesGeneradas =
      formVendedor.icono.trim().length > 0
        ? formVendedor.icono.trim().slice(0, 3).toUpperCase()
        : nombreLimpio
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0].toUpperCase())
            .join('');

    if (idProductoEditando) {
      // HU18 CA02: Actualizar producto existente sin duplicar la referencia (.map)
      const catalogoActualizado = productos.map((prod) =>
        prod.id === idProductoEditando
          ? {
              ...prod,
              nombre: nombreLimpio,
              categoria: formVendedor.categoria,
              precio: precioNum,
              stock: stockNum,
              descripcion: descripcionLimpia,
              icono: inicialesGeneradas,
            }
          : prod
      );
      setProductos(catalogoActualizado);

      // Sincronizar datos básicos e inventario máximo en carrito si el producto estaba en el carrito
      setCarrito((carritoPrevio) =>
        carritoPrevio
          .filter((item) => (item.id === idProductoEditando ? stockNum > 0 : true))
          .map((item) =>
            item.id === idProductoEditando
              ? {
                  ...item,
                  nombre: nombreLimpio,
                  precio: precioNum,
                  categoria: formVendedor.categoria,
                  icono: inicialesGeneradas,
                  cantidad: Math.min(item.cantidad, stockNum),
                }
              : item
          )
      );

      mostrarMensaje(
        `✅ Producto ${idProductoEditando} ("${nombreLimpio}") actualizado correctamente sin duplicar referencia.`,
        'exito'
      );
      limpiarFormularioVendedor();
    } else {
      // HU18 CA01: Crear nuevo producto con id único
      const numerosIds = productos.map((p) => {
        const partes = p.id.split('-');
        const num = parseInt(partes[1], 10);
        return Number.isNaN(num) ? 0 : num;
      });
      const siguienteNum = Math.max(0, ...numerosIds) + 1;
      const nuevoId = `PROD-${String(siguienteNum).padStart(3, '0')}`;

      const nuevoProducto = {
        id: nuevoId,
        nombre: nombreLimpio,
        categoria: formVendedor.categoria,
        precio: precioNum,
        stock: stockNum,
        descripcion: descripcionLimpia,
        icono: inicialesGeneradas,
        resenas: [5],
      };

      setProductos([nuevoProducto, ...productos]);
      mostrarMensaje(
        `✅ Nuevo producto registrado en el catálogo con ID único ${nuevoId}: "${nombreLimpio}".`,
        'exito'
      );
      limpiarFormularioVendedor();
    }
  };

  // =========================================================================
  // 10. RESEÑAS FICTICIAS CON ESTRELLAS (HU19)
  // =========================================================================
  const registrarCalificacionProducto = (idProducto, valorTexto) => {
    const numeroCalificacion = Number(valorTexto);

    // HU19 CA02: Valoración fuera del rango 1..5 o no entera muestra error
    if (
      valorTexto.toString().trim() === '' ||
      !Number.isInteger(numeroCalificacion) ||
      numeroCalificacion < 1 ||
      numeroCalificacion > 5
    ) {
      mostrarMensaje(
        'Error de calificación: Debes ingresar una valoración entera entre 1 y 5 estrellas.',
        'error'
      );
      return;
    }

    // HU19 CA01 y CA03: Agregar valoración al producto y recalcular promedio
    const productosActualizados = productos.map((prod) => {
      if (prod.id !== idProducto) return prod;
      const nuevasResenas = Array.isArray(prod.resenas)
        ? [...prod.resenas, numeroCalificacion]
        : [numeroCalificacion];
      return { ...prod, resenas: nuevasResenas };
    });

    setProductos(productosActualizados);
    mostrarMensaje(
      `⭐ ¡Gracias! Se registró tu calificación de ${numeroCalificacion} ${
        numeroCalificacion === 1 ? 'estrella' : 'estrellas'
      } y se actualizó el promedio.`,
      'exito'
    );
  };

  // =========================================================================
  // 11. ACCIONES DE DEMOSTRACIÓN DE PERSISTENCIA LOCAL (HU20)
  // =========================================================================
  const simularReinicioApp = () => {
    const recuperado = cargarEstadoLocal();
    setProductos(recuperado.productos);
    setFavoritos(recuperado.favoritos);
    setCarrito(recuperado.carrito);
    setHistorialPedidos(recuperado.historialPedidos);
    setCuponAplicado(recuperado.cuponAplicado);
    mostrarMensaje(
      `🔄 Simulación de reinicio completada (HU20 CA01): Se restauraron ${recuperado.carrito.length} ref. en carrito y ${recuperado.favoritos.length} favoritos desde el almacenamiento local.`,
      'exito'
    );
  };

  const probarSanitizacionDatosCorruptos = () => {
    // Simulamos datos corruptos (stock negativo -5, precio negativo -1000, cantidad 0) para verificar HU20 CA02
    const datosCorruptosPrueba = {
      productos: productos.map((p, index) =>
        index === 0 ? { ...p, stock: -8, precio: -50000 } : p
      ),
      favoritos: [...favoritos, 'ID-INEXISTENTE-999'],
      carrito: [...carrito, { id: 'PROD-001', cantidad: -3 }],
      historialPedidos,
      cuponAplicado,
    };

    const estadoSanitizado = sanitizarEstadoRecuperado(datosCorruptosPrueba);
    setProductos(estadoSanitizado.productos);
    setFavoritos(estadoSanitizado.favoritos);
    setCarrito(estadoSanitizado.carrito);
    mostrarMensaje(
      '🛡️ Prueba HU20 CA02 exitosa: Se detectaron y corrigieron valores corruptos/inventarios negativos al iniciar (ningún producto quedó con stock negativo).',
      'exito'
    );
  };

  const restaurarEstadoInicialFabrica = () => {
    limpiarEstadoLocal();
    const estadoInicial = sanitizarEstadoRecuperado(null);
    setProductos(estadoInicial.productos);
    setFavoritos(estadoInicial.favoritos);
    setCarrito(estadoInicial.carrito);
    setHistorialPedidos(estadoInicial.historialPedidos);
    setCuponAplicado(null);
    setTextoCupon('');
    setUltimoPedidoConfirmado(null);
    setMostrarRevisionPrevia(false);
    mostrarMensaje(
      '🗑️ Almacenamiento local limpiado (HU20 CA03): La aplicación inició con su catálogo y estado inicial seguro.',
      'info'
    );
  };

  // =========================================================================
  // 12. RENDERIZADO DE TARJETA DE PRODUCTO (HU03, HU08, HU09)
  // =========================================================================
  const renderTarjetaProducto = ({ item, origenVista = 'catalogo' }) => {
    const esFavorito = favoritos.includes(item.id);
    const cantidadEnCarrito = obtenerCantidadEnCarrito(item.id);
    const agotado = item.stock <= 0;
    const topeAlcanzado = !agotado && cantidadEnCarrito >= item.stock;
    const promedioEstrellas = calcularPromedioResenas(item.resenas);
    const estiloCat = COLORES_CATEGORIA[item.categoria] || {
      fondo: '#E2E8F0',
      texto: '#1E293B',
      icono: '📦',
    };

    return (
      <View style={styles.tarjetaProducto}>
        {/* Fila superior: Icono de marca/producto + Información principal + Botón Favorito */}
        <View style={styles.tarjetaFilaSuperior}>
          <Pressable
            onPress={() => abrirDetalleProducto(item.id, origenVista)}
            style={[styles.marcadorImagen, { backgroundColor: estiloCat.fondo }]}
          >
            <Text style={[styles.marcadorIniciales, { color: estiloCat.texto }]}>{item.icono}</Text>
            <Text style={styles.marcadorEmoji}>{estiloCat.icono}</Text>
          </Pressable>

          <View style={styles.tarjetaInfoCentral}>
            <View style={styles.filaEtiquetasTarjeta}>
              <View style={[styles.etiquetaCategoria, { backgroundColor: estiloCat.fondo }]}>
                <Text style={[styles.textoEtiquetaCategoria, { color: estiloCat.texto }]}>
                  {estiloCat.icono} {item.categoria}
                </Text>
              </View>
              <Text style={styles.textoIdProducto}>{item.id}</Text>
            </View>

            <Pressable onPress={() => abrirDetalleProducto(item.id, origenVista)}>
              <Text style={styles.nombreProductoTarjeta}>{item.nombre}</Text>
            </Pressable>

            <Text style={styles.precioProductoTarjeta}>{formatearCOP(item.precio)} COP</Text>

            <View style={styles.filaStockYEstrellas}>
              <View
                style={[
                  styles.insigniaStock,
                  agotado ? styles.insigniaAgotado : styles.insigniaDisponible,
                ]}
              >
                <Text
                  style={[
                    styles.textoInsigniaStock,
                    agotado ? styles.textoAgotado : styles.textoDisponible,
                  ]}
                >
                  {agotado ? 'AGOTADO (Stock: 0)' : `Disponible: ${item.stock} uds.`}
                </Text>
              </View>

              <Text style={styles.textoEstrellasTarjeta}>
                ★ {promedioEstrellas.toFixed(1)} ({item.resenas ? item.resenas.length : 0})
              </Text>
            </View>

            {cantidadEnCarrito > 0 && (
              <Text style={styles.textoEnCarritoIndicador}>
                🛒 En tu carrito: {cantidadEnCarrito} {cantidadEnCarrito === 1 ? 'unidad' : 'uds.'}
              </Text>
            )}
          </View>

          {/* Control de Favorito (HU08 CA01 y CA02) */}
          <Pressable
            onPress={() => alternarFavorito(item.id)}
            style={[styles.botonFavoritoIcono, esFavorito && styles.botonFavoritoActivo]}
          >
            <Text style={styles.textoFavoritoIcono}>{esFavorito ? '❤️' : '🤍'}</Text>
          </Pressable>
        </View>

        {/* Fila inferior de acciones: Ver detalle y Agregar al carrito */}
        <View style={styles.tarjetaFilaBotones}>
          <Pressable
            onPress={() => abrirDetalleProducto(item.id, origenVista)}
            style={styles.botonSecundarioTarjeta}
          >
            <Text style={styles.textoBotonSecundarioTarjeta}>🔍 Ver detalle</Text>
          </Pressable>

          <Pressable
            onPress={() => agregarAlCarrito(item)}
            style={[
              styles.botonPrimarioTarjeta,
              agotado && styles.botonDeshabilitado,
              topeAlcanzado && styles.botonTopeStock,
            ]}
          >
            <Text style={styles.textoBotonPrimarioTarjeta}>
              {agotado
                ? '🚫 Sin existencias'
                : topeAlcanzado
                ? '⚠️ Máx. en carrito'
                : '🛒 Agregar al carrito'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // =========================================================================
  // 13. VISTAS ESPECÍFICAS DE LA APLICACIÓN
  // =========================================================================

  // VISTA DETALLE DEL PRODUCTO (HU07, HU08, HU09, HU19)
  const renderVistaDetalle = () => {
    const producto = productos.find((p) => p.id === productoDetalleId);

    if (!producto) {
      return (
        <View style={styles.contenedorEstadoVacio}>
          <Text style={styles.iconoEstadoVacio}>🔎</Text>
          <Text style={styles.tituloEstadoVacio}>Producto no encontrado</Text>
          <Text style={styles.subtituloEstadoVacio}>
            El artículo seleccionado ya no está disponible.
          </Text>
          <Pressable onPress={volverDeDetalle} style={styles.botonAccionVacio}>
            <Text style={styles.textoBotonAccionVacio}>← Volver al catálogo</Text>
          </Pressable>
        </View>
      );
    }

    const esFavorito = favoritos.includes(producto.id);
    const cantidadEnCarrito = obtenerCantidadEnCarrito(producto.id);
    const agotado = producto.stock <= 0;
    const promedio = calcularPromedioResenas(producto.resenas);
    const estiloCat = COLORES_CATEGORIA[producto.categoria] || {
      fondo: '#E2E8F0',
      texto: '#1E293B',
      icono: '📦',
    };

    return (
      <ScrollView style={styles.contenedorScroll} contentContainerStyle={styles.contenidoScroll}>
        {/* Botón Volver (HU02 CA03 y HU07 CA03) */}
        <View style={styles.filaNavegacionDetalle}>
          <Pressable onPress={volverDeDetalle} style={styles.botonVolver}>
            <Text style={styles.textoBotonVolver}>
              ← Volver a {vistaAnterior === 'favoritos' ? 'Favoritos' : 'Catálogo'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => alternarFavorito(producto.id)}
            style={[styles.botonFavoritoDetalle, esFavorito && styles.botonFavoritoActivo]}
          >
            <Text style={styles.textoBotonFavoritoDetalle}>
              {esFavorito ? '❤️ En Favoritos' : '🤍 Guardar en Favoritos'}
            </Text>
          </Pressable>
        </View>

        {/* Tarjeta principal del detalle (HU07 CA01 y CA02) */}
        <View style={styles.tarjetaDetalle}>
          <View style={[styles.cabeceraVisualDetalle, { backgroundColor: estiloCat.fondo }]}>
            <Text style={[styles.inicialesGigantesDetalle, { color: estiloCat.texto }]}>
              {producto.icono}
            </Text>
            <View style={styles.insigniaCategoriaDetalle}>
              <Text style={[styles.textoCategoriaDetalle, { color: estiloCat.texto }]}>
                {estiloCat.icono} Categoría: {producto.categoria} · ID: {producto.id}
              </Text>
            </View>
          </View>

          <Text style={styles.tituloDetalle}>{producto.nombre}</Text>
          <Text style={styles.precioDetalle}>{formatearCOP(producto.precio)} COP</Text>

          <View style={styles.filaEstadoDetalle}>
            <View
              style={[
                styles.insigniaStockGrande,
                agotado ? styles.insigniaAgotado : styles.insigniaDisponible,
              ]}
            >
              <Text
                style={[
                  styles.textoInsigniaStockGrande,
                  agotado ? styles.textoAgotado : styles.textoDisponible,
                ]}
              >
                {agotado
                  ? '🚫 PRODUCTO AGOTADO (Stock: 0 unidades)'
                  : `✅ Stock disponible en tienda: ${producto.stock} unidades`}
              </Text>
            </View>
          </View>

          {cantidadEnCarrito > 0 && (
            <View style={styles.cajaInfoCarritoDetalle}>
              <Text style={styles.textoInfoCarritoDetalle}>
                🛒 Actualmente tienes {cantidadEnCarrito}{' '}
                {cantidadEnCarrito === 1 ? 'unidad seleccionada' : 'unidades seleccionadas'} en tu
                carrito (Subtotal ref.: {formatearCOP(cantidadEnCarrito * producto.precio)} COP).
              </Text>
            </View>
          )}

          <Text style={styles.subtituloSeccionDetalle}>Descripción del producto</Text>
          <Text style={styles.descripcionDetalle}>{producto.descripcion}</Text>

          {/* Acción de agregar al carrito desde el detalle (HU07 CA02 y HU09) */}
          <Pressable
            onPress={() => agregarAlCarrito(producto)}
            disabled={agotado}
            style={[styles.botonAgregarDetalle, agotado && styles.botonDeshabilitado]}
          >
            <Text style={styles.textoBotonAgregarDetalle}>
              {agotado
                ? '🚫 Agotado — No se pueden agregar unidades'
                : '🛒 Agregar 1 unidad al carrito'}
            </Text>
          </Pressable>
        </View>

        {/* Sección de Reseñas Ficticias (HU19 CA01, CA02, CA03) */}
        <View style={styles.tarjetaDetalle}>
          <Text style={styles.subtituloSeccionDetalle}>
            ⭐ Reseñas y Valoraciones de Compradores (HU19)
          </Text>

          <View style={styles.cajaPromedioResenas}>
            <Text style={styles.numeroPromedioResenas}>★ {promedio.toFixed(1)} / 5.0</Text>
            <Text style={styles.conteoPromedioResenas}>
              Promedio calculado sobre {producto.resenas ? producto.resenas.length : 0}{' '}
              {producto.resenas && producto.resenas.length === 1 ? 'valoración' : 'valoraciones'}
            </Text>
            <Text style={styles.historialEstrellasTexto}>
              Calificaciones registradas:{' '}
              {producto.resenas && producto.resenas.length > 0
                ? producto.resenas.map((r) => `${r}★`).join(' · ')
                : 'Sin calificaciones aún'}
            </Text>
          </View>

          <Text style={styles.etiquetaInput}>
            Selecciona o escribe una valoración entera entre 1 y 5 estrellas:
          </Text>
          <View style={styles.filaBotonesEstrellas}>
            {[1, 2, 3, 4, 5].map((estrella) => (
              <Pressable
                key={estrella}
                onPress={() => {
                  setCalificacionInput(String(estrella));
                  registrarCalificacionProducto(producto.id, estrella);
                }}
                style={[
                  styles.botonEstrellaRapida,
                  Number(calificacionInput) === estrella && styles.botonEstrellaActiva,
                ]}
              >
                <Text
                  style={[
                    styles.textoBotonEstrella,
                    Number(calificacionInput) === estrella && styles.textoBotonEstrellaActiva,
                  ]}
                >
                  {estrella} ★
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.filaInputCalificacion}>
            <TextInput
              style={styles.inputCalificacion}
              value={calificacionInput}
              onChangeText={setCalificacionInput}
              keyboardType="numeric"
              placeholder="1 a 5"
            />
            <Pressable
              onPress={() => registrarCalificacionProducto(producto.id, calificacionInput)}
              style={styles.botonGuardarCalificacion}
            >
              <Text style={styles.textoBotonGuardarCalificacion}>Guardar valoración</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  };

  // VISTA FAVORITOS (HU08)
  const renderVistaFavoritos = () => {
    return (
      <View style={styles.contenedorVista}>
        <View style={styles.encabezadoSeccion}>
          <Text style={styles.tituloSeccion}>❤️ Mis Productos Favoritos</Text>
          <Text style={styles.subtituloSeccion}>
            Guarda los productos que te interesan para revisarlos y agregarlos al carrito cuando
            quieras.
          </Text>
        </View>

        <FlatList
          data={listaProductosFavoritos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderTarjetaProducto({ item, origenVista: 'favoritos' })}
          contentContainerStyle={styles.listaContenido}
          ListEmptyComponent={
            <View style={styles.contenedorEstadoVacio}>
              <Text style={styles.iconoEstadoVacio}>🤍</Text>
              <Text style={styles.tituloEstadoVacio}>Tu lista de favoritos está vacía</Text>
              <Text style={styles.subtituloEstadoVacio}>
                Aún no has guardado artículos en favoritos. Explora el catálogo y presiona el
                corazón en los productos que te gusten.
              </Text>
              <Pressable onPress={() => irAVista('catalogo')} style={styles.botonAccionVacio}>
                <Text style={styles.textoBotonAccionVacio}>🛍️ Volver al catálogo</Text>
              </Pressable>
            </View>
          }
        />
      </View>
    );
  };

  // VISTA CARRITO Y CHECKOUT SIMULADO (HU10, HU11, HU12, HU13, HU14, HU17)
  const renderVistaCarrito = () => {
    const faltaParaEnvioGratis = Math.max(0, REGLAS_NEGOCIO.TOPE_ENVIO_GRATIS - subtotalCarrito);

    return (
      <ScrollView style={styles.contenedorScroll} contentContainerStyle={styles.contenidoScroll}>
        <View style={styles.encabezadoSeccion}>
          <Text style={styles.tituloSeccion}>🛒 Tu Carrito de Compras</Text>
          <Text style={styles.subtituloSeccion}>
            Envío estándar $8.000 COP · ¡Envío GRATIS en compras desde $150.000 COP!
          </Text>
        </View>

        {/* Si acaba de confirmar un pedido, mostrar el comprobante de confirmación (HU13 CA01 y CA04) */}
        {ultimoPedidoConfirmado && (
          <View style={styles.tarjetaConfirmacionPedido}>
            <Text style={styles.tituloConfirmacionPedido}>
              ✅ ¡Pedido Confirmado Exitosamente!
            </Text>
            <Text style={styles.codigoConfirmacionPedido}>
              Código único de pedido: {ultimoPedidoConfirmado.idPedido}
            </Text>
            <Text style={styles.detalleConfirmacionPedido}>
              Comprador: {ultimoPedidoConfirmado.comprador.nombre} (
              {ultimoPedidoConfirmado.comprador.municipio})
            </Text>
            <Text style={styles.detalleConfirmacionPedido}>
              Total registrado: {formatearCOP(ultimoPedidoConfirmado.total)} COP
            </Text>
            <View style={styles.cajaAvisoSimulacion}>
              <Text style={styles.textoAvisoSimulacion}>
                ℹ️ {ultimoPedidoConfirmado.notaSimulacion}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setPedidoDetalleId(ultimoPedidoConfirmado.idPedido);
                irAVista('historial');
              }}
              style={styles.botonIrHistorial}
            >
              <Text style={styles.textoBotonIrHistorial}>
                📦 Ver pedido en el Historial
              </Text>
            </Pressable>
          </View>
        )}

        {/* Estado vacío del carrito (HU11 CA04 y HU16 CA03) */}
        {carrito.length === 0 ? (
          <View>
            <View style={styles.contenedorEstadoVacio}>
              <Text style={styles.iconoEstadoVacio}>🛒</Text>
              <Text style={styles.tituloEstadoVacio}>Tu carrito está vacío</Text>
              <Text style={styles.subtituloEstadoVacio}>
                Agrega productos disponibles desde el catálogo para armar tu pedido simulado.
              </Text>
              <Pressable onPress={() => irAVista('catalogo')} style={styles.botonAccionVacio}>
                <Text style={styles.textoBotonAccionVacio}>🛍️ Explorar catálogo</Text>
              </Pressable>
            </View>

            {/* Resumen con carrito vacío ($0 y sin cobro de envío - HU11 CA04) */}
            <View style={styles.tarjetaResumenCompra}>
              <Text style={styles.tituloResumenCompra}>📋 Resumen de Compra (Carrito Vacío)</Text>
              <View style={styles.filaResumen}>
                <Text style={styles.etiquetaResumen}>Subtotal productos:</Text>
                <Text style={styles.valorResumen}>{formatearCOP(0)} COP</Text>
              </View>
              <View style={styles.filaResumen}>
                <Text style={styles.etiquetaResumen}>Envío simulado:</Text>
                <Text style={styles.valorResumen}>{formatearCOP(0)} COP (No se cobra envío)</Text>
              </View>
              <View style={[styles.filaResumen, styles.filaTotalResumen]}>
                <Text style={styles.etiquetaTotalResumen}>Total estimado:</Text>
                <Text style={styles.valorTotalResumen}>{formatearCOP(0)} COP</Text>
              </View>
            </View>
          </View>
        ) : (
          <View>
            {/* Lista de artículos en el carrito (HU10) */}
            {carrito.map((item) => {
              const prodCatalogo = productos.find((p) => p.id === item.id);
              const stockMax = prodCatalogo ? prodCatalogo.stock : item.cantidad;
              const subtotalLinea = item.cantidad * item.precio;

              return (
                <View key={item.id} style={styles.tarjetaItemCarrito}>
                  <View style={styles.filaSuperiorItemCarrito}>
                    <View style={styles.infoItemCarrito}>
                      <Text style={styles.nombreItemCarrito}>{item.nombre}</Text>
                      <Text style={styles.detalleUnitarioItemCarrito}>
                        Precio unitario: {formatearCOP(item.precio)} COP · Stock máx.: {stockMax}{' '}
                        uds.
                      </Text>
                      <Text style={styles.subtotalLineaItemCarrito}>
                        Subtotal línea: {formatearCOP(subtotalLinea)} COP
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => eliminarDelCarrito(item.id)}
                      style={styles.botonEliminarItem}
                    >
                      <Text style={styles.textoBotonEliminarItem}>🗑️ Eliminar</Text>
                    </Pressable>
                  </View>

                  <View style={styles.filaControlesCantidad}>
                    <Text style={styles.etiquetaCantidadCarrito}>Cantidad:</Text>
                    <View style={styles.grupoBotonesCantidad}>
                      <Pressable
                        onPress={() => cambiarCantidadCarrito(item.id, -1)}
                        style={[
                          styles.botonCantidad,
                          item.cantidad <= 1 && styles.botonCantidadMinima,
                        ]}
                      >
                        <Text style={styles.textoBotonCantidad}>−</Text>
                      </Pressable>

                      <View style={styles.cajaNumeroCantidad}>
                        <Text style={styles.textoNumeroCantidad}>{item.cantidad}</Text>
                      </View>

                      <Pressable
                        onPress={() => cambiarCantidadCarrito(item.id, 1)}
                        style={[
                          styles.botonCantidad,
                          item.cantidad >= stockMax && styles.botonTopeStock,
                        ]}
                      >
                        <Text style={styles.textoBotonCantidad}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Sección de Cupón Promocional (HU17) */}
            <View style={styles.tarjetaCupon}>
              <Text style={styles.tituloSubseccion}>🎟️ Cupón Promocional (HU17)</Text>
              <Text style={styles.textoAyudaCupon}>
                Usa el código de prueba <Text style={styles.textoNegrita}>BIENVENIDO10</Text> para
                obtener 10% de descuento sobre el subtotal.
              </Text>
              <View style={styles.filaInputCupon}>
                <TextInput
                  style={styles.inputCupon}
                  value={textoCupon}
                  onChangeText={setTextoCupon}
                  placeholder="Ej. BIENVENIDO10"
                  autoCapitalize="characters"
                />
                <Pressable onPress={aplicarCupon} style={styles.botonAplicarCupon}>
                  <Text style={styles.textoBotonAplicarCupon}>Aplicar</Text>
                </Pressable>
                {cuponAplicado && (
                  <Pressable onPress={quitarCupon} style={styles.botonQuitarCupon}>
                    <Text style={styles.textoBotonQuitarCupon}>Quitar</Text>
                  </Pressable>
                )}
              </View>
              {cuponAplicado && (
                <Text style={styles.textoCuponActivo}>
                  ✅ Cupón {cuponAplicado} activo: descuentas {formatearCOP(valorDescuento)} COP
                  (10%).
                </Text>
              )}
            </View>

            {/* Resumen de Compra y Envío (HU11) */}
            <View style={styles.tarjetaResumenCompra}>
              <Text style={styles.tituloResumenCompra}>📋 Resumen de Compra y Envío (HU11)</Text>

              <View style={styles.filaResumen}>
                <Text style={styles.etiquetaResumen}>
                  Subtotal ({totalUnidadesCarrito}{' '}
                  {totalUnidadesCarrito === 1 ? 'artículo' : 'artículos'}):
                </Text>
                <Text style={styles.valorResumen}>{formatearCOP(subtotalCarrito)} COP</Text>
              </View>

              {cuponAplicado && (
                <View style={styles.filaResumen}>
                  <Text style={styles.etiquetaDescuento}>
                    Descuento cupón ({cuponAplicado} - 10%):
                  </Text>
                  <Text style={styles.valorDescuento}>- {formatearCOP(valorDescuento)} COP</Text>
                </View>
              )}

              <View style={styles.filaResumen}>
                <Text style={styles.etiquetaResumen}>Envío simulado Sabana:</Text>
                <Text
                  style={[
                    styles.valorResumen,
                    costoEnvio === 0 && styles.textoEnvioGratisDestacado,
                  ]}
                >
                  {costoEnvio === 0 ? '¡GRATIS! ($0 COP)' : `${formatearCOP(costoEnvio)} COP`}
                </Text>
              </View>

              <Text style={styles.notaReglaEnvio}>
                {faltaParaEnvioGratis > 0
                  ? `💡 Te faltan ${formatearCOP(
                      faltaParaEnvioGratis
                    )} COP en el subtotal para obtener envío GRATIS (meta: $150.000 COP).`
                  : '🎉 ¡Tu subtotal supera o iguala los $150.000 COP! Tienes envío GRATIS.'}
              </Text>

              <View style={[styles.filaResumen, styles.filaTotalResumen]}>
                <Text style={styles.etiquetaTotalResumen}>Total a pagar (Simulado):</Text>
                <Text style={styles.valorTotalResumen}>{formatearCOP(totalPagar)} COP</Text>
              </View>
            </View>

            {/* Formulario de Datos Básicos del Comprador (HU12) */}
            <View style={styles.tarjetaFormularioComprador}>
              <Text style={styles.tituloResumenCompra}>
                👤 Datos de Contacto y Entrega (HU12)
              </Text>

              <View style={styles.cajaSeguridadAcademica}>
                <Text style={styles.textoSeguridadAcademica}>
                  🔒 Simulación académica segura (HU12 CA04): No solicitamos números de tarjeta,
                  contraseñas, documentos reales ni datos bancarios.
                </Text>
              </View>

              <Text style={styles.etiquetaInput}>1. Nombre completo del comprador *</Text>
              <TextInput
                style={styles.inputFormulario}
                value={datosComprador.nombre}
                onChangeText={(texto) =>
                  setDatosComprador({ ...datosComprador, nombre: texto })
                }
                placeholder="Ej. Carolina Gómez"
              />

              <Text style={styles.etiquetaInput}>2. Teléfono de contacto *</Text>
              <TextInput
                style={styles.inputFormulario}
                value={datosComprador.telefono}
                onChangeText={(texto) =>
                  setDatosComprador({ ...datosComprador, telefono: texto })
                }
                placeholder="Ej. 3001234567"
                keyboardType="phone-pad"
              />

              <Text style={styles.etiquetaInput}>
                3. Municipio de entrega (Sabana de Occidente) *
              </Text>
              <View style={styles.filaMunicipiosRapidos}>
                {INFO_MARCA.municipiosCobertura.map((mun) => (
                  <Pressable
                    key={mun}
                    onPress={() => setDatosComprador({ ...datosComprador, municipio: mun })}
                    style={[
                      styles.chipMunicipio,
                      datosComprador.municipio === mun && styles.chipMunicipioActivo,
                    ]}
                  >
                    <Text
                      style={[
                        styles.textoChipMunicipio,
                        datosComprador.municipio === mun && styles.textoChipMunicipioActivo,
                      ]}
                    >
                      📍 {mun}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                style={styles.inputFormulario}
                value={datosComprador.municipio}
                onChangeText={(texto) =>
                  setDatosComprador({ ...datosComprador, municipio: texto })
                }
                placeholder="Mosquera, Madrid o Funza"
              />

              <Text style={styles.etiquetaInput}>4. Dirección de entrega *</Text>
              <TextInput
                style={styles.inputFormulario}
                value={datosComprador.direccion}
                onChangeText={(texto) =>
                  setDatosComprador({ ...datosComprador, direccion: texto })
                }
                placeholder="Ej. Calle 10 # 15-30 Apto 201, Barrio Centro"
              />

              {/* Botón para revisar resumen previo (HU12 CA03) */}
              <Pressable
                onPress={revisarResumenAntesDeConfirmar}
                style={styles.botonRevisarPedido}
              >
                <Text style={styles.textoBotonRevisarPedido}>
                  🔍 Validar datos y revisar resumen antes de confirmar
                </Text>
              </Pressable>

              {/* Vista previa de confirmación cuando los campos están completos (HU12 CA03) */}
              {mostrarRevisionPrevia && (
                <View style={styles.cajaRevisionPrevia}>
                  <Text style={styles.tituloRevisionPrevia}>
                    ✅ Revisión Previa del Pedido Simulado
                  </Text>
                  <Text style={styles.textoRevisionPrevia}>
                    • Destinatario: {datosComprador.nombre.trim()} ({datosComprador.telefono.trim()}
                    )
                  </Text>
                  <Text style={styles.textoRevisionPrevia}>
                    • Entrega en: {datosComprador.direccion.trim()},{' '}
                    {datosComprador.municipio.trim()}
                  </Text>
                  <Text style={styles.textoRevisionPrevia}>
                    • Referencias: {carrito.length} ({totalUnidadesCarrito} unidades en total)
                  </Text>
                  <Text style={styles.textoRevisionPreviaDestacado}>
                    • Total final simulado: {formatearCOP(totalPagar)} COP
                  </Text>
                </View>
              )}

              {/* Botón Confirmar compra simulada (HU13) */}
              <Pressable onPress={confirmarCompraSimulada} style={styles.botonConfirmarCompra}>
                <Text style={styles.textoBotonConfirmarCompra}>
                  ⚡ Confirmar compra simulada ({formatearCOP(totalPagar)} COP)
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  // VISTA HISTORIAL Y DETALLE DE PEDIDOS (HU15)
  const renderVistaHistorial = () => {
    return (
      <ScrollView style={styles.contenedorScroll} contentContainerStyle={styles.contenidoScroll}>
        <View style={styles.encabezadoSeccion}>
          <Text style={styles.tituloSeccion}>📦 Historial de Pedidos Confirmados (HU15)</Text>
          <Text style={styles.subtituloSeccion}>
            Cada pedido guarda una copia inmutable de los productos, precios y totales al momento de
            la compra simulada.
          </Text>
        </View>

        {historialPedidos.length === 0 ? (
          <View style={styles.contenedorEstadoVacio}>
            <Text style={styles.iconoEstadoVacio}>📭</Text>
            <Text style={styles.tituloEstadoVacio}>No hay pedidos registrados</Text>
            <Text style={styles.subtituloEstadoVacio}>
              Todavía no has confirmado ninguna compra simulada en esta sesión.
            </Text>
            <Pressable onPress={() => irAVista('catalogo')} style={styles.botonAccionVacio}>
              <Text style={styles.textoBotonAccionVacio}>🛍️ Ir al catálogo para comprar</Text>
            </Pressable>
          </View>
        ) : (
          historialPedidos.map((pedido) => {
            const abierto = pedidoDetalleId === pedido.idPedido;

            return (
              <View key={pedido.idPedido} style={styles.tarjetaPedidoHistorial}>
                <View style={styles.filaEncabezadoPedido}>
                  <View>
                    <Text style={styles.codigoPedidoHistorial}>{pedido.idPedido}</Text>
                    <Text style={styles.fechaPedidoHistorial}>🕒 {pedido.fechaHora}</Text>
                  </View>
                  <View style={styles.columnaTotalPedido}>
                    <Text style={styles.etiquetaTotalPedido}>Total registrado</Text>
                    <Text style={styles.valorTotalPedido}>{formatearCOP(pedido.total)} COP</Text>
                  </View>
                </View>

                <Text style={styles.resumenCompradorPedido}>
                  👤 {pedido.comprador.nombre} · 📍 {pedido.comprador.municipio} (
                  {pedido.comprador.direccion})
                </Text>

                <Pressable
                  onPress={() => setPedidoDetalleId(abierto ? null : pedido.idPedido)}
                  style={styles.botonVerDetallePedido}
                >
                  <Text style={styles.textoBotonVerDetallePedido}>
                    {abierto ? '▲ Ocultar detalle del pedido' : '▼ Ver detalle completo del pedido'}
                  </Text>
                </Pressable>

                {/* Detalle completo del pedido seleccionado (HU15 CA02 y CA03) */}
                {abierto && (
                  <View style={styles.cajaDetallePedido}>
                    <Text style={styles.subtituloDetallePedido}>
                      Artículos comprados en este pedido:
                    </Text>
                    {pedido.articulos.map((art) => (
                      <View key={`${pedido.idPedido}-${art.id}`} style={styles.filaArticuloPedido}>
                        <View style={styles.infoArticuloPedido}>
                          <Text style={styles.nombreArticuloPedido}>
                            {art.nombre} ({art.id})
                          </Text>
                          <Text style={styles.metaArticuloPedido}>
                            {art.cantidad} uds. × {formatearCOP(art.precioUnitario)} COP c/u
                          </Text>
                        </View>
                        <Text style={styles.subtotalArticuloPedido}>
                          {formatearCOP(art.subtotalLinea)} COP
                        </Text>
                      </View>
                    ))}

                    <View style={styles.separadorDetallePedido} />

                    <View style={styles.filaResumen}>
                      <Text style={styles.etiquetaResumen}>Subtotal artículos:</Text>
                      <Text style={styles.valorResumen}>{formatearCOP(pedido.subtotal)} COP</Text>
                    </View>

                    {pedido.descuento > 0 && (
                      <View style={styles.filaResumen}>
                        <Text style={styles.etiquetaDescuento}>
                          Descuento cupón ({pedido.cupon}):
                        </Text>
                        <Text style={styles.valorDescuento}>
                          - {formatearCOP(pedido.descuento)} COP
                        </Text>
                      </View>
                    )}

                    <View style={styles.filaResumen}>
                      <Text style={styles.etiquetaResumen}>Costo de envío:</Text>
                      <Text style={styles.valorResumen}>
                        {pedido.envio === 0 ? 'GRATIS ($0 COP)' : `${formatearCOP(pedido.envio)} COP`}
                      </Text>
                    </View>

                    <View style={[styles.filaResumen, styles.filaTotalResumen]}>
                      <Text style={styles.etiquetaTotalResumen}>Total registrado:</Text>
                      <Text style={styles.valorTotalResumen}>{formatearCOP(pedido.total)} COP</Text>
                    </View>

                    <Text style={styles.notaSimulacionPedido}>{pedido.notaSimulacion}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    );
  };

  // VISTA PANEL DE VENDEDOR (HU18)
  const renderVistaVendedor = () => {
    return (
      <ScrollView style={styles.contenedorScroll} contentContainerStyle={styles.contenidoScroll}>
        <View style={styles.encabezadoSeccion}>
          <Text style={styles.tituloSeccion}>🛠️ Panel Administrativo de Vendedor (HU18)</Text>
          <Text style={styles.subtituloSeccion}>
            Crea nuevos productos o edita los existentes en el catálogo validando precios positivos
            y stock no negativo.
          </Text>
        </View>

        <View style={styles.tarjetaFormularioComprador}>
          <Text style={styles.tituloResumenCompra}>
            {idProductoEditando
              ? `✏️ Editando Producto ${idProductoEditando}`
              : '➕ Registrar Nuevo Producto en el Catálogo'}
          </Text>

          <Text style={styles.etiquetaInput}>Nombre del producto *</Text>
          <TextInput
            style={styles.inputFormulario}
            value={formVendedor.nombre}
            onChangeText={(texto) => setFormVendedor({ ...formVendedor, nombre: texto })}
            placeholder="Ej. Mouse Gamer Valhala Óptico"
          />

          <Text style={styles.etiquetaInput}>Categoría *</Text>
          <View style={styles.filaMunicipiosRapidos}>
            {CATEGORIAS_VENDEDOR.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setFormVendedor({ ...formVendedor, categoria: cat })}
                style={[
                  styles.chipMunicipio,
                  formVendedor.categoria === cat && styles.chipMunicipioActivo,
                ]}
              >
                <Text
                  style={[
                    styles.textoChipMunicipio,
                    formVendedor.categoria === cat && styles.textoChipMunicipioActivo,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.filaDosColumnas}>
            <View style={styles.columnaMitad}>
              <Text style={styles.etiquetaInput}>Precio COP (entero &gt; 0) *</Text>
              <TextInput
                style={styles.inputFormulario}
                value={formVendedor.precio}
                onChangeText={(texto) => setFormVendedor({ ...formVendedor, precio: texto })}
                placeholder="Ej. 65000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.columnaMitad}>
              <Text style={styles.etiquetaInput}>Stock (entero &gt;= 0) *</Text>
              <TextInput
                style={styles.inputFormulario}
                value={formVendedor.stock}
                onChangeText={(texto) => setFormVendedor({ ...formVendedor, stock: texto })}
                placeholder="Ej. 10"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.etiquetaInput}>
            Descripción breve (mínimo 15 caracteres) * [{formVendedor.descripcion.trim().length}/15]
          </Text>
          <TextInput
            style={[styles.inputFormulario, styles.inputMultilinea]}
            value={formVendedor.descripcion}
            onChangeText={(texto) => setFormVendedor({ ...formVendedor, descripcion: texto })}
            placeholder="Describe las características principales del producto..."
            multiline
          />

          <Text style={styles.etiquetaInput}>Iniciales o marcador gráfico (opcional, 2-3 letras)</Text>
          <TextInput
            style={styles.inputFormulario}
            value={formVendedor.icono}
            onChangeText={(texto) => setFormVendedor({ ...formVendedor, icono: texto })}
            placeholder="Ej. MV"
            maxLength={3}
          />

          <View style={styles.filaBotonesVendedor}>
            <Pressable onPress={guardarProductoVendedor} style={styles.botonGuardarVendedor}>
              <Text style={styles.textoBotonGuardarVendedor}>
                {idProductoEditando ? '💾 Guardar cambios' : '➕ Crear producto'}
              </Text>
            </Pressable>

            {idProductoEditando && (
              <Pressable onPress={limpiarFormularioVendedor} style={styles.botonCancelarEdicion}>
                <Text style={styles.textoBotonCancelarEdicion}>Cancelar edición</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Lista de inventario actual para editar (HU18 CA02) */}
        <View style={styles.tarjetaResumenCompra}>
          <Text style={styles.tituloResumenCompra}>
            📦 Inventario Actual ({productos.length} referencias)
          </Text>
          {productos.map((prod) => (
            <View key={prod.id} style={styles.filaProductoVendedor}>
              <View style={styles.infoProductoVendedor}>
                <Text style={styles.nombreProductoVendedor}>
                  {prod.id} · {prod.nombre}
                </Text>
                <Text style={styles.metaProductoVendedor}>
                  {prod.categoria} · {formatearCOP(prod.precio)} COP · Stock: {prod.stock} uds.
                </Text>
              </View>
              <Pressable
                onPress={() => cargarProductoParaEditar(prod)}
                style={styles.botonEditarProducto}
              >
                <Text style={styles.textoBotonEditarProducto}>✏️ Editar</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // VISTA CATÁLOGO PRINCIPAL (HU03, HU04, HU05, HU06)
  const renderVistaCatalogo = () => {
    return (
      <View style={styles.contenedorVista}>
        {/* Panel de búsqueda, filtros por categoría y orden por precio */}
        <View style={styles.panelControlesCatalogo}>
          {/* Buscador por palabra clave (HU04) */}
          <View style={styles.filaBuscador}>
            <TextInput
              style={styles.inputBuscador}
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="🔎 Buscar producto por nombre..."
              placeholderTextColor="#64748B"
            />
            {busqueda.length > 0 && (
              <Pressable onPress={() => setBusqueda('')} style={styles.botonLimpiarBusqueda}>
                <Text style={styles.textoBotonLimpiarBusqueda}>✕ Limpiar</Text>
              </Pressable>
            )}
          </View>

          {/* Filtro por categorías (HU05) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollCategorias}
            contentContainerStyle={styles.contenidoScrollCategorias}
          >
            {CATEGORIAS.map((cat) => {
              const activa = categoriaSeleccionada === cat;
              const infoCat = COLORES_CATEGORIA[cat];
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategoriaSeleccionada(cat)}
                  style={[styles.chipCategoria, activa && styles.chipCategoriaActiva]}
                >
                  <Text
                    style={[styles.textoChipCategoria, activa && styles.textoChipCategoriaActiva]}
                  >
                    {infoCat ? `${infoCat.icono} ${cat}` : `🌐 ${cat}`}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Ordenar por precio (HU06) */}
          <View style={styles.filaOrdenamiento}>
            <Text style={styles.etiquetaOrdenar}>Ordenar precio:</Text>
            <View style={styles.grupoBotonesOrden}>
              <Pressable
                onPress={() => setOrdenPrecio('ninguno')}
                style={[
                  styles.botonOrden,
                  ordenPrecio === 'ninguno' && styles.botonOrdenActivo,
                ]}
              >
                <Text
                  style={[
                    styles.textoBotonOrden,
                    ordenPrecio === 'ninguno' && styles.textoBotonOrdenActivo,
                  ]}
                >
                  Original
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setOrdenPrecio('asc')}
                style={[styles.botonOrden, ordenPrecio === 'asc' && styles.botonOrdenActivo]}
              >
                <Text
                  style={[
                    styles.textoBotonOrden,
                    ordenPrecio === 'asc' && styles.textoBotonOrdenActivo,
                  ]}
                >
                  Menor a mayor ↑
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setOrdenPrecio('desc')}
                style={[styles.botonOrden, ordenPrecio === 'desc' && styles.botonOrdenActivo]}
              >
                <Text
                  style={[
                    styles.textoBotonOrden,
                    ordenPrecio === 'desc' && styles.textoBotonOrdenActivo,
                  ]}
                >
                  Mayor a menor ↓
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Resumen de resultados activos */}
          <View style={styles.filaResumenResultados}>
            <Text style={styles.textoResumenResultados}>
              Mostrando {productosVisibles.length} de {productos.length} productos
              {categoriaSeleccionada !== 'Todas' ? ` · Categoría: ${categoriaSeleccionada}` : ''}
              {terminoLimpio ? ` · Búsqueda: "${busqueda.trim()}"` : ''}
            </Text>
            {(categoriaSeleccionada !== 'Todas' ||
              terminoLimpio !== '' ||
              ordenPrecio !== 'ninguno') && (
              <Pressable onPress={limpiarFiltrosCatalogo}>
                <Text style={styles.enlaceRestablecerFiltros}>Restablecer</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Lista de productos del catálogo con FlatList (HU03 CA01, CA02, CA03 y HU04 CA03) */}
        <FlatList
          data={productosVisibles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderTarjetaProducto({ item, origenVista: 'catalogo' })}
          contentContainerStyle={styles.listaContenido}
          ListEmptyComponent={
            <View style={styles.contenedorEstadoVacio}>
              <Text style={styles.iconoEstadoVacio}>🔍</Text>
              {/* HU04 CA03 exige mostrar el aviso "No encontramos productos" */}
              <Text style={styles.tituloEstadoVacio}>No encontramos productos</Text>
              <Text style={styles.subtituloEstadoVacio}>
                No hay coincidencias para tu búsqueda o filtro actual. Intenta con otra palabra
                clave o selecciona otra categoría.
              </Text>
              <Pressable onPress={limpiarFiltrosCatalogo} style={styles.botonAccionVacio}>
                <Text style={styles.textoBotonAccionVacio}>🔄 Mostrar todos los productos</Text>
              </Pressable>
            </View>
          }
        />
      </View>
    );
  };

  // =========================================================================
  // 14. RENDERIZADO PRINCIPAL DE LA INTERFAZ
  // =========================================================================
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={INFO_MARCA.colores.primario} />

      {/* ENCABEZADO DE MARCA (HU01 CA01, CA02, CA03) */}
      <View style={styles.encabezadoMarca}>
        <View style={styles.filaPrincipalMarca}>
          <View style={styles.insigniaLogo}>
            <Text style={styles.textoInsigniaLogo}>{INFO_MARCA.iniciales}</Text>
          </View>

          <View style={styles.textosMarca}>
            <Text style={styles.nombreMarca}>{INFO_MARCA.nombre}</Text>
            <Text style={styles.esloganMarca}>{INFO_MARCA.eslogan}</Text>
          </View>

          <View style={styles.botonesInfoCabecera}>
            <Pressable
              onPress={() => {
                setMostrarFichaMarca(!mostrarFichaMarca);
                setMostrarPanelPersistencia(false);
              }}
              style={[styles.botonCabecera, mostrarFichaMarca && styles.botonCabeceraActivo]}
            >
              <Text style={styles.textoBotonCabecera}>ℹ️ Marca</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMostrarPanelPersistencia(!mostrarPanelPersistencia);
                setMostrarFichaMarca(false);
              }}
              style={[styles.botonCabecera, mostrarPanelPersistencia && styles.botonCabeceraActivo]}
            >
              <Text style={styles.textoBotonCabecera}>💾 HU20</Text>
            </Pressable>
          </View>
        </View>

        {/* Tarjeta desplegable de Ficha de Marca (HU01 CA03) */}
        {mostrarFichaMarca && (
          <View style={styles.panelDesplegableCabecera}>
            <Text style={styles.tituloPanelCabecera}>
              🏷️ Ficha de Marca Oficial · {INFO_MARCA.nombre}
            </Text>
            <Text style={styles.itemPanelCabecera}>
              • <Text style={styles.textoNegrita}>Propuesta de valor:</Text>{' '}
              {INFO_MARCA.propuestaValor}
            </Text>
            <Text style={styles.itemPanelCabecera}>
              • <Text style={styles.textoNegrita}>Público objetivo:</Text>{' '}
              {INFO_MARCA.publicoObjetivo}
            </Text>
            <Text style={styles.itemPanelCabecera}>
              • <Text style={styles.textoNegrita}>4 Categorías oficiales:</Text>{' '}
              {CATEGORIAS_VENDEDOR.join(', ')}.
            </Text>
            <Text style={styles.itemPanelCabecera}>
              • <Text style={styles.textoNegrita}>Colores principales:</Text> Azul Trueno (#1E3A8A)
              y Ámbar Eléctrico (#F59E0B).
            </Text>
          </View>
        )}

        {/* Tarjeta desplegable de Persistencia Local (HU20 CA01, CA02, CA03) */}
        {mostrarPanelPersistencia && (
          <View style={styles.panelDesplegableCabecera}>
            <Text style={styles.tituloPanelCabecera}>
              💾 Control de Persistencia Local (Demostración HU20)
            </Text>
            <Text style={styles.itemPanelCabecera}>
              Tus favoritos ({favoritos.length}), carrito ({carrito.length} ref.) e inventario se
              almacenan automáticamente.
            </Text>
            <View style={styles.filaBotonesPersistencia}>
              <Pressable onPress={simularReinicioApp} style={styles.botonAccionPersistencia}>
                <Text style={styles.textoBotonPersistencia}>🔄 Simular Reapertura (CA01)</Text>
              </Pressable>
              <Pressable
                onPress={probarSanitizacionDatosCorruptos}
                style={styles.botonAccionPersistencia}
              >
                <Text style={styles.textoBotonPersistencia}>🛡️ Validar Corruptos (CA02)</Text>
              </Pressable>
              <Pressable
                onPress={restaurarEstadoInicialFabrica}
                style={[styles.botonAccionPersistencia, styles.botonPersistenciaPeligro]}
              >
                <Text style={styles.textoBotonPersistencia}>🗑️ Estado Inicial (CA03)</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* BARRA DE NAVEGACIÓN PRINCIPAL (HU02 CA01 y CA02) */}
      <View style={styles.barraNavegacion}>
        <Pressable
          onPress={() => irAVista('catalogo')}
          style={[
            styles.tabNavegacion,
            (vistaActual === 'catalogo' || vistaActual === 'detalle') && styles.tabActiva,
          ]}
        >
          <Text
            style={[
              styles.textoTab,
              (vistaActual === 'catalogo' || vistaActual === 'detalle') && styles.textoTabActiva,
            ]}
          >
            🛍️ Catálogo
          </Text>
        </Pressable>

        <Pressable
          onPress={() => irAVista('favoritos')}
          style={[styles.tabNavegacion, vistaActual === 'favoritos' && styles.tabActiva]}
        >
          <Text style={[styles.textoTab, vistaActual === 'favoritos' && styles.textoTabActiva]}>
            ❤️ Fav ({favoritos.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => irAVista('carrito')}
          style={[styles.tabNavegacion, vistaActual === 'carrito' && styles.tabActiva]}
        >
          <Text style={[styles.textoTab, vistaActual === 'carrito' && styles.textoTabActiva]}>
            🛒 Carrito ({totalUnidadesCarrito})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => irAVista('historial')}
          style={[styles.tabNavegacion, vistaActual === 'historial' && styles.tabActiva]}
        >
          <Text style={[styles.textoTab, vistaActual === 'historial' && styles.textoTabActiva]}>
            📦 Historial ({historialPedidos.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => irAVista('vendedor')}
          style={[styles.tabNavegacion, vistaActual === 'vendedor' && styles.tabActiva]}
        >
          <Text style={[styles.textoTab, vistaActual === 'vendedor' && styles.textoTabActiva]}>
            🛠️ Vendedor
          </Text>
        </Pressable>
      </View>

      {/* BANNER DE RETROALIMENTACIÓN Y ESTADOS DE LA INTERFAZ (HU16 CA01 y CA02) */}
      {feedback.visible && (
        <View
          style={[
            styles.bannerFeedback,
            feedback.tipo === 'exito' && styles.bannerExito,
            feedback.tipo === 'error' && styles.bannerError,
            feedback.tipo === 'advertencia' && styles.bannerAdvertencia,
          ]}
        >
          <Text style={styles.textoBannerFeedback}>{feedback.mensaje}</Text>
          <Pressable onPress={cerrarMensaje} style={styles.botonCerrarFeedback}>
            <Text style={styles.textoCerrarFeedback}>✕</Text>
          </Pressable>
        </View>
      )}

      {/* CONTENIDO CONDICIONAL SEGÚN LA SECCIÓN ACTIVA */}
      <View style={styles.areaContenidoPrincipal}>
        {vistaActual === 'catalogo' && renderVistaCatalogo()}
        {vistaActual === 'detalle' && renderVistaDetalle()}
        {vistaActual === 'favoritos' && renderVistaFavoritos()}
        {vistaActual === 'carrito' && renderVistaCarrito()}
        {vistaActual === 'historial' && renderVistaHistorial()}
        {vistaActual === 'vendedor' && renderVistaVendedor()}
      </View>
    </SafeAreaView>
  );
}

// =========================================================================
// 15. HOJA DE ESTILOS CON IDENTIDAD DE MARCA COHERENTE (StyleSheet)
// =========================================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: INFO_MARCA.colores.primario,
    paddingTop: Platform.OS === 'android' ? 28 : 0,
  },
  areaContenidoPrincipal: {
    flex: 1,
    backgroundColor: INFO_MARCA.colores.fondo,
  },
  contenedorVista: {
    flex: 1,
    backgroundColor: INFO_MARCA.colores.fondo,
  },
  contenedorScroll: {
    flex: 1,
    backgroundColor: INFO_MARCA.colores.fondo,
  },
  contenidoScroll: {
    padding: 14,
    paddingBottom: 36,
  },
  listaContenido: {
    padding: 12,
    paddingBottom: 32,
  },

  // --- ENCABEZADO DE MARCA (HU01) ---
  encabezadoMarca: {
    backgroundColor: INFO_MARCA.colores.primario,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: INFO_MARCA.colores.secundario,
  },
  filaPrincipalMarca: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insigniaLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: INFO_MARCA.colores.primarioOscuro,
    borderWidth: 2,
    borderColor: INFO_MARCA.colores.secundario,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textoInsigniaLogo: {
    color: INFO_MARCA.colores.secundario,
    fontWeight: '900',
    fontSize: 14,
  },
  textosMarca: {
    flex: 1,
  },
  nombreMarca: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  esloganMarca: {
    color: '#FEF3C7',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  botonesInfoCabecera: {
    flexDirection: 'row',
    gap: 6,
  },
  botonCabecera: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  botonCabeceraActivo: {
    backgroundColor: INFO_MARCA.colores.secundario,
    borderColor: INFO_MARCA.colores.secundario,
  },
  textoBotonCabecera: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  panelDesplegableCabecera: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 4,
    borderLeftColor: INFO_MARCA.colores.secundario,
  },
  tituloPanelCabecera: {
    fontSize: 13,
    fontWeight: '800',
    color: INFO_MARCA.colores.primario,
    marginBottom: 4,
  },
  itemPanelCabecera: {
    fontSize: 12,
    color: INFO_MARCA.colores.textoPrincipal,
    marginBottom: 3,
    lineHeight: 17,
  },
  filaBotonesPersistencia: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  botonAccionPersistencia: {
    backgroundColor: INFO_MARCA.colores.primario,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 6,
  },
  botonPersistenciaPeligro: {
    backgroundColor: INFO_MARCA.colores.error,
  },
  textoBotonPersistencia: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // --- BARRA DE NAVEGACIÓN (HU02) ---
  barraNavegacion: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: INFO_MARCA.colores.borde,
    paddingVertical: 6,
    paddingHorizontal: 6,
    justifyContent: 'space-between',
  },
  tabNavegacion: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  tabActiva: {
    backgroundColor: INFO_MARCA.colores.primario,
  },
  textoTab: {
    fontSize: 11,
    fontWeight: '700',
    color: INFO_MARCA.colores.textoSecundario,
    textAlign: 'center',
  },
  textoTabActiva: {
    color: '#FFFFFF',
  },

  // --- BANNER DE RETROALIMENTACIÓN (HU16) ---
  bannerFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DBEAFE',
    borderLeftWidth: 5,
    borderLeftColor: INFO_MARCA.colores.primario,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  bannerExito: {
    backgroundColor: INFO_MARCA.colores.exitoFondo,
    borderLeftColor: INFO_MARCA.colores.exito,
  },
  bannerError: {
    backgroundColor: INFO_MARCA.colores.errorFondo,
    borderLeftColor: INFO_MARCA.colores.error,
  },
  bannerAdvertencia: {
    backgroundColor: INFO_MARCA.colores.advertenciaFondo,
    borderLeftColor: INFO_MARCA.colores.advertencia,
  },
  textoBannerFeedback: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: INFO_MARCA.colores.textoPrincipal,
    paddingRight: 8,
  },
  botonCerrarFeedback: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  textoCerrarFeedback: {
    fontSize: 14,
    fontWeight: '800',
    color: INFO_MARCA.colores.textoSecundario,
  },

  // --- CONTROLES DE CATÁLOGO (HU04, HU05, HU06) ---
  panelControlesCatalogo: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: INFO_MARCA.colores.borde,
  },
  filaBuscador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputBuscador: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: INFO_MARCA.colores.textoPrincipal,
  },
  botonLimpiarBusqueda: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  textoBotonLimpiarBusqueda: {
    fontSize: 12,
    fontWeight: '700',
    color: INFO_MARCA.colores.textoPrincipal,
  },
  scrollCategorias: {
    marginTop: 8,
  },
  contenidoScrollCategorias: {
    gap: 6,
    paddingVertical: 2,
  },
  chipCategoria: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 6,
  },
  chipCategoriaActiva: {
    backgroundColor: INFO_MARCA.colores.primario,
    borderColor: INFO_MARCA.colores.primario,
  },
  textoChipCategoria: {
    fontSize: 12,
    fontWeight: '700',
    color: INFO_MARCA.colores.textoSecundario,
  },
  textoChipCategoriaActiva: {
    color: '#FFFFFF',
  },
  filaOrdenamiento: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  etiquetaOrdenar: {
    fontSize: 12,
    fontWeight: '700',
    color: INFO_MARCA.colores.textoSecundario,
  },
  grupoBotonesOrden: {
    flexDirection: 'row',
    gap: 5,
  },
  botonOrden: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  botonOrdenActivo: {
    backgroundColor: INFO_MARCA.colores.secundarioSuave,
    borderColor: INFO_MARCA.colores.secundario,
  },
  textoBotonOrden: {
    fontSize: 11,
    fontWeight: '600',
    color: INFO_MARCA.colores.textoSecundario,
  },
  textoBotonOrdenActivo: {
    color: '#92400E',
    fontWeight: '800',
  },
  filaResumenResultados: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 7,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  textoResumenResultados: {
    fontSize: 11,
    color: INFO_MARCA.colores.textoSecundario,
  },
  enlaceRestablecerFiltros: {
    fontSize: 11,
    fontWeight: '700',
    color: INFO_MARCA.colores.primario,
  },

  // --- TARJETA DE PRODUCTO (HU03, HU08, HU09) ---
  tarjetaProducto: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: INFO_MARCA.colores.borde,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tarjetaFilaSuperior: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  marcadorImagen: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  marcadorIniciales: {
    fontSize: 18,
    fontWeight: '900',
  },
  marcadorEmoji: {
    fontSize: 13,
    marginTop: 2,
  },
  tarjetaInfoCentral: {
    flex: 1,
  },
  filaEtiquetasTarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  etiquetaCategoria: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  textoEtiquetaCategoria: {
    fontSize: 10,
    fontWeight: '800',
  },
  textoIdProducto: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  nombreProductoTarjeta: {
    fontSize: 15,
    fontWeight: '800',
    color: INFO_MARCA.colores.textoPrincipal,
    marginBottom: 3,
  },
  precioProductoTarjeta: {
    fontSize: 16,
    fontWeight: '900',
    color: INFO_MARCA.colores.primario,
    marginBottom: 5,
  },
  filaStockYEstrellas: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  insigniaStock: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  insigniaDisponible: {
    backgroundColor: '#DCFCE7',
  },
  insigniaAgotado: {
    backgroundColor: '#FEE2E2',
  },
  textoInsigniaStock: {
    fontSize: 11,
    fontWeight: '700',
  },
  textoDisponible: {
    color: '#166534',
  },
  textoAgotado: {
    color: '#991B1B',
  },
  textoEstrellasTarjeta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  textoEnCarritoIndicador: {
    fontSize: 11,
    fontWeight: '700',
    color: INFO_MARCA.colores.primario,
    marginTop: 4,
  },
  botonFavoritoIcono: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  botonFavoritoActivo: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  textoFavoritoIcono: {
    fontSize: 17,
  },
  tarjetaFilaBotones: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  botonSecundarioTarjeta: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  textoBotonSecundarioTarjeta: {
    fontSize: 12,
    fontWeight: '700',
    color: INFO_MARCA.colores.textoPrincipal,
  },
  botonPrimarioTarjeta: {
    flex: 1.4,
    backgroundColor: INFO_MARCA.colores.primario,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: '#94A3B8',
  },
  botonTopeStock: {
    backgroundColor: INFO_MARCA.colores.advertencia,
  },
  textoBotonPrimarioTarjeta: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // --- DETALLE DEL PRODUCTO (HU07 y HU19) ---
  filaNavegacionDetalle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  botonVolver: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: INFO_MARCA.colores.borde,
  },
  textoBotonVolver: {
    fontSize: 13,
    fontWeight: '700',
    color: INFO_MARCA.colores.primario,
  },
  botonFavoritoDetalle: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: INFO_MARCA.colores.borde,
  },
  textoBotonFavoritoDetalle: {
    fontSize: 12,
    fontWeight: '700',
    color: INFO_MARCA.colores.textoPrincipal,
  },
  tarjetaDetalle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: INFO_MARCA.colores.borde,
  },
  cabeceraVisualDetalle: {
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  inicialesGigantesDetalle: {
    fontSize: 38,
    fontWeight: '900',
  },
  insigniaCategoriaDetalle: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  textoCategoriaDetalle: {
    fontSize: 12,
    fontWeight: '800',
  },
  tituloDetalle: {
    fontSize: 20,
    fontWeight: '800',
    color: INFO_MARCA.colores.textoPrincipal,
    marginBottom: 6,
  },
  precioDetalle: {
    fontSize: 22,
    fontWeight: '900',
    color: INFO_MARCA.colores.primario,
    marginBottom: 10,
  },
  filaEstadoDetalle: {
    marginBottom: 12,
  },
  insigniaStockGrande: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  textoInsigniaStockGrande: {
    fontSize: 13,
    fontWeight: '800',
  },
  cajaInfoCarritoDetalle: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  textoInfoCarritoDetalle: {
    fontSize: 12,
    fontWeight: '600',
    color: INFO_MARCA.colores.primario,
  },
  subtituloSeccionDetalle: {
    fontSize: 15,
    fontWeight: '800',
    color: INFO_MARCA.colores.textoPrincipal,
    marginBottom: 6,
  },
  descripcionDetalle: {
    fontSize: 14,
    lineHeight: 21,
    color: INFO_MARCA.colores.textoSecundario,
    marginBottom: 16,
  },
  botonAgregarDetalle: {
    backgroundColor: INFO_MARCA.colores.primario,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotonAgregarDetalle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // --- RESEÑAS EN DETALLE (HU19) ---
  cajaPromedioResenas: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  numeroPromedioResenas: {
    fontSize: 20,
    fontWeight: '900',
    color: '#B45309',
  },
  conteoPromedioResenas: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginTop: 2,
  },
  historialEstrellasTexto: {
    fontSize: 12,
    color: INFO_MARCA.colores.textoSecundario,
    marginTop: 4,
  },
  filaBotonesEstrellas: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  botonEstrellaRapida: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  botonEstrellaActiva: {
    backgroundColor: INFO_MARCA.colores.secundario,
    borderColor: INFO_MARCA.colores.secundario,
  },
  textoBotonEstrella: {
    fontSize: 13,
    fontWeight: '800',
    color: INFO_MARCA.colores.textoPrincipal,
  },
  textoBotonEstrellaActiva: {
    color: '#FFFFFF',
  },
  filaInputCalificacion: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  inputCalificacion: {
    width: 80,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '700',
  },
  botonGuardarCalificacion: {
    flex: 1,
    backgroundColor: INFO_MARCA.colores.primario,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotonGuardarCalificacion: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // --- ENCABEZADOS DE SECCIÓN Y ESTADOS VACÍOS (HU16 CA03) ---
  encabezadoSeccion: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: '800',
    color: INFO_MARCA.colores.primario,
  },
  subtituloSeccion: {
    fontSize: 12,
    color: INFO_MARCA.colores.textoSecundario,
    marginTop: 2,
  },
  contenedorEstadoVacio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: INFO_MARCA.colores.borde,
  },
  iconoEstadoVacio: {
    fontSize: 38,
    marginBottom: 8,
  },
  tituloEstadoVacio: {
    fontSize: 17,
    fontWeight: '800',
    color: INFO_MARCA.colores.textoPrincipal,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtituloEstadoVacio: {
    fontSize: 13,
    color: INFO_MARCA.colores.textoSecundario,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 14,
  },
  botonAccionVacio: {
    backgroundColor: INFO_MARCA.colores.primario,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoBotonAccionVacio: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // --- CARRITO DE COMPRAS (HU10, HU11, HU12, HU13, HU17) ---
  tarjetaItemCarrito: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: INFO_MARCA.colores.borde,
  },
  filaSuperiorItemCarrito: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoItemCarrito: {
    flex: 1,
    paddingRight: 8,
  },
  nombreItemCarrito: {
    fontSize: 14,
    fontWeight: '800',
    color: INFO_MARCA.colores.textoPrincipal,
  },
  detalleUnitarioItemCarrito: {
    fontSize: 12,
    color: INFO_MARCA.colores.textoSecundario,
    marginTop: 2,
  },
  subtotalLineaItemCarrito: {
    fontSize: 13,
    fontWeight: '800',
    color: INFO_MARCA.colores.primario,
    marginTop: 3,
  },
  botonEliminarItem: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  textoBotonEliminarItem: {
    fontSize: 11,
    fontWeight: '800',
    color: INFO_MARCA.colores.error,
  },
  filaControlesCantidad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  etiquetaCantidadCarrito: {
    fontSize: 12,
    fontWeight: '700',
    color: INFO_MARCA.colores.textoSecundario,
  },
  grupoBotonesCantidad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botonCantidad: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: INFO_MARCA.colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonCantidadMinima: {
    backgroundColor: '#94A3B8',
  },
  textoBotonCantidad: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  cajaNumeroCantidad: {
    minWidth: 36,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  textoNumeroCantidad: {
    fontSize: 14,
    fontWeight: '800',
    color: INFO_MARCA.colores.textoPrincipal,
  },

  // --- CUPÓN PROMOCIONAL (HU17) ---
  tarjetaCupon: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: INFO_MARCA.colores.borde,
  },
  tituloSubseccion: {
    fontSize: 14,
    fontWeight: '800',
    color: INFO_MARCA.colores.primario,
    marginBottom: 4,
  },
  textoAyudaCupon: {
    fontSize: 12,
    color: INFO_MARCA.colores.textoSecundario,
    marginBottom: 8,
  },
  textoNegrita: {
    fontWeight: '800',
    color: INFO_MARCA.colores.textoPrincipal,
  },
  filaInputCupon: {
    flexDirection: 'row',
    gap: 6,
  },
  inputCupon: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '700',
  },
  botonAplicarCupon: {
    backgroundColor: INFO_MARCA.colores.secundario,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 8,
  },
  textoBotonAplicarCupon: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  botonQuitarCupon: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: 8,
  },
  textoBotonQuitarCupon: {
    color: INFO_MARCA.colores.textoPrincipal,
    fontWeight: '700',
    fontSize: 12,
  },
  textoCuponActivo: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: INFO_MARCA.colores.exito,
  },

  // --- RESUMEN DE COMPRA Y FORMULARIO (HU11, HU12, HU13) ---
  tarjetaResumenCompra: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: INFO_MARCA.colores.borde,
  },
  tituloResumenCompra: {
    fontSize: 15,
    fontWeight: '800',
    color: INFO_MARCA.colores.primario,
    marginBottom: 10,
  },
  filaResumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  etiquetaResumen: {
    fontSize: 13,
    color: INFO_MARCA.colores.textoSecundario,
  },
  valorResumen: {
    fontSize: 13,
    fontWeight: '700',
    color: INFO_MARCA.colores.textoPrincipal,
  },
  etiquetaDescuento: {
    fontSize: 13,
    fontWeight: '700',
    color: INFO_MARCA.colores.exito,
  },
  valorDescuento: {
    fontSize: 13,
    fontWeight: '800',
    color: INFO_MARCA.colores.exito,
  },
  textoEnvioGratisDestacado: {
    color: INFO_MARCA.colores.exito,
    fontWeight: '900',
  },
  notaReglaEnvio: {
    fontSize: 11,
    color: '#92400E',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    marginVertical: 6,
    fontWeight: '600',
  },
  filaTotalResumen: {
    borderTopWidth: 1,
    borderTopColor: INFO_MARCA.colores.borde,
    paddingTop: 8,
    marginTop: 4,
  },
  etiquetaTotalResumen: {
    fontSize: 15,
    fontWeight: '800',
    color: INFO_MARCA.colores.textoPrincipal,
  },
  valorTotalResumen: {
    fontSize: 17,
    fontWeight: '900',
    color: INFO_MARCA.colores.primario,
  },
  tarjetaFormularioComprador: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: INFO_MARCA.colores.borde,
  },
  cajaSeguridadAcademica: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 9,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: INFO_MARCA.colores.primario,
  },
  textoSeguridadAcademica: {
    fontSize: 11,
    color: INFO_MARCA.colores.primario,
    fontWeight: '600',
  },
  etiquetaInput: {
    fontSize: 12,
    fontWeight: '700',
    color: INFO_MARCA.colores.textoPrincipal,
    marginBottom: 5,
    marginTop: 6,
  },
  inputFormulario: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: INFO_MARCA.colores.textoPrincipal,
    marginBottom: 4,
  },
  inputMultilinea: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  filaMunicipiosRapidos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  chipMunicipio: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chipMunicipioActivo: {
    backgroundColor: INFO_MARCA.colores.primario,
    borderColor: INFO_MARCA.colores.primario,
  },
  textoChipMunicipio: {
    fontSize: 12,
    fontWeight: '700',
    color: INFO_MARCA.colores.textoSecundario,
  },
  textoChipMunicipioActivo: {
    color: '#FFFFFF',
  },
  botonRevisarPedido: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: INFO_MARCA.colores.primario,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotonRevisarPedido: {
    color: INFO_MARCA.colores.primario,
    fontSize: 12,
    fontWeight: '800',
  },
  cajaRevisionPrevia: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  tituloRevisionPrevia: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 4,
  },
  textoRevisionPrevia: {
    fontSize: 12,
    color: '#14532D',
    marginBottom: 2,
  },
  textoRevisionPreviaDestacado: {
    fontSize: 13,
    fontWeight: '900',
    color: '#166534',
    marginTop: 4,
  },
  botonConfirmarCompra: {
    backgroundColor: INFO_MARCA.colores.secundario,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  textoBotonConfirmarCompra: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  tarjetaConfirmacionPedido: {
    backgroundColor: '#DCFCE7',
    borderWidth: 2,
    borderColor: INFO_MARCA.colores.exito,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  tituloConfirmacionPedido: {
    fontSize: 16,
    fontWeight: '900',
    color: '#166534',
    marginBottom: 4,
  },
  codigoConfirmacionPedido: {
    fontSize: 14,
    fontWeight: '800',
    color: INFO_MARCA.colores.primario,
    marginBottom: 4,
  },
  detalleConfirmacionPedido: {
    fontSize: 12,
    color: '#14532D',
    marginBottom: 2,
    fontWeight: '600',
  },
  cajaAvisoSimulacion: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  textoAvisoSimulacion: {
    fontSize: 11,
    color: INFO_MARCA.colores.textoSecundario,
    fontWeight: '600',
  },
  botonIrHistorial: {
    backgroundColor: INFO_MARCA.colores.primario,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotonIrHistorial: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // --- HISTORIAL DE PEDIDOS (HU15) ---
  tarjetaPedidoHistorial: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: INFO_MARCA.colores.borde,
  },
  filaEncabezadoPedido: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  codigoPedidoHistorial: {
    fontSize: 15,
    fontWeight: '900',
    color: INFO_MARCA.colores.primario,
  },
  fechaPedidoHistorial: {
    fontSize: 11,
    color: INFO_MARCA.colores.textoSecundario,
    marginTop: 2,
  },
  columnaTotalPedido: {
    alignItems: 'flex-end',
  },
  etiquetaTotalPedido: {
    fontSize: 10,
    color: INFO_MARCA.colores.textoSecundario,
  },
  valorTotalPedido: {
    fontSize: 15,
    fontWeight: '900',
    color: INFO_MARCA.colores.exito,
  },
  resumenCompradorPedido: {
    fontSize: 12,
    color: INFO_MARCA.colores.textoPrincipal,
    marginBottom: 8,
  },
  botonVerDetallePedido: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  textoBotonVerDetallePedido: {
    fontSize: 12,
    fontWeight: '700',
    color: INFO_MARCA.colores.primario,
  },
  cajaDetallePedido: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: INFO_MARCA.colores.borde,
  },
  subtituloDetallePedido: {
    fontSize: 13,
    fontWeight: '800',
    color: INFO_MARCA.colores.textoPrincipal,
    marginBottom: 6,
  },
  filaArticuloPedido: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoArticuloPedido: {
    flex: 1,
    paddingRight: 8,
  },
  nombreArticuloPedido: {
    fontSize: 12,
    fontWeight: '700',
    color: INFO_MARCA.colores.textoPrincipal,
  },
  metaArticuloPedido: {
    fontSize: 11,
    color: INFO_MARCA.colores.textoSecundario,
  },
  subtotalArticuloPedido: {
    fontSize: 12,
    fontWeight: '800',
    color: INFO_MARCA.colores.primario,
  },
  separadorDetallePedido: {
    height: 1,
    backgroundColor: INFO_MARCA.colores.borde,
    marginVertical: 8,
  },
  notaSimulacionPedido: {
    fontSize: 11,
    color: INFO_MARCA.colores.textoSecundario,
    fontStyle: 'italic',
    marginTop: 6,
  },

  // --- PANEL DE VENDEDOR (HU18) ---
  filaDosColumnas: {
    flexDirection: 'row',
    gap: 10,
  },
  columnaMitad: {
    flex: 1,
  },
  filaBotonesVendedor: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  botonGuardarVendedor: {
    flex: 1,
    backgroundColor: INFO_MARCA.colores.primario,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotonGuardarVendedor: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  botonCancelarEdicion: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 8,
  },
  textoBotonCancelarEdicion: {
    color: INFO_MARCA.colores.textoPrincipal,
    fontSize: 12,
    fontWeight: '700',
  },
  filaProductoVendedor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoProductoVendedor: {
    flex: 1,
    paddingRight: 8,
  },
  nombreProductoVendedor: {
    fontSize: 13,
    fontWeight: '700',
    color: INFO_MARCA.colores.textoPrincipal,
  },
  metaProductoVendedor: {
    fontSize: 11,
    color: INFO_MARCA.colores.textoSecundario,
    marginTop: 2,
  },
  botonEditarProducto: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  textoBotonEditarProducto: {
    fontSize: 11,
    fontWeight: '800',
    color: INFO_MARCA.colores.primario,
  },
});
