import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  ScrollView,
  FlatList,
  Pressable,
  SafeAreaView,
  Platform,
} from 'react-native';

import {
  MARCA_INFO,
  CATEGORIAS_CONFIG,
  PRODUCTOS_INICIALES,
  obtenerFuenteImagen,
} from './src/data/catalogoHalo';

import {
  formatearCOP,
  calcularResumenCarrito,
  calcularPromedioEstrellas,
  validarFormularioComprador,
  validarProductoVendedor,
  validarValoracionResena,
  cargarEstadoLocal,
  guardarEstadoLocal,
  limpiarEstadoLocal,
} from './src/utils/formatters';

export default function App() {
  // ==========================================================================
  // 1. ESTADOS PRINCIPALES EN MEMORIA (useState) + PERSISTENCIA LOCAL (HU20)
  // ==========================================================================
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
  const [favoritos, setFavoritos] = useState(['PROD-001']);
  const [carrito, setCarrito] = useState([]);
  const [historialPedidos, setHistorialPedidos] = useState([]);
  const [hidratado, setHidratado] = useState(false);

  // Navegación entre vistas: 'catalogo' | 'detalle' | 'favoritos' | 'carrito' | 'historial' | 'vendedor' | 'marca'
  const [vistaActual, setVistaActual] = useState('catalogo');
  const [vistaAnterior, setVistaAnterior] = useState('catalogo');
  const [productoDetalleId, setProductoDetalleId] = useState(null);
  const [pedidoDetalleCodigo, setPedidoDetalleCodigo] = useState(null);

  // Estados de filtros y búsqueda en Catálogo (HU04, HU05, HU06)
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [ordenPrecio, setOrdenPrecio] = useState('ninguno'); // 'ninguno' | 'asc' | 'desc'

  // Estados del Carrito, Cupón (HU17) y Formulario del Comprador (HU12, HU13)
  const [codigoCuponInput, setCodigoCuponInput] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [compradorNombre, setCompradorNombre] = useState('');
  const [compradorTelefono, setCompradorTelefono] = useState('');
  const [compradorMunicipio, setCompradorMunicipio] = useState('');
  const [compradorDireccion, setCompradorDireccion] = useState('');
  const [resumenRevisado, setResumenRevisado] = useState(false);
  const [ultimoPedidoConfirmado, setUltimoPedidoConfirmado] = useState(null);

  // Estados del Panel de Vendedor (HU18)
  const [editandoId, setEditandoId] = useState(null);
  const [vendNombre, setVendNombre] = useState('');
  const [vendCategoria, setVendCategoria] = useState(MARCA_INFO.categorias[0]);
  const [vendPrecio, setVendPrecio] = useState('');
  const [vendStock, setVendStock] = useState('');
  const [vendDescripcion, setVendDescripcion] = useState('');
  const [vendInsignia, setVendInsignia] = useState('');
  const [vendImagenUrl, setVendImagenUrl] = useState('');

  // Estados de Reseñas Ficticias en Detalle del Producto (HU19)
  const [resenaEstrellasInput, setResenaEstrellasInput] = useState('5');
  const [resenaAutorInput, setResenaAutorInput] = useState('');
  const [resenaComentarioInput, setResenaComentarioInput] = useState('');

  // Estado de Retroalimentación / Alertas Tácticas (HU16)
  const [retroalimentacion, setRetroalimentacion] = useState({
    visible: true,
    tipo: 'info', // 'exito' | 'error' | 'alerta' | 'info'
    titulo: 'SISTEMA TÁCTICO UNSC EN LÍNEA',
    mensaje:
      'Bienvenido a Market Mjolnir. Explora armaduras Mjolnir, naves, armas y vehículos terrestres con renders oficiales de Halo.',
  });

  // Función auxiliar para mostrar mensajes claros al usuario (HU16)
  const notificar = (tipo, titulo, mensaje) => {
    setRetroalimentacion({
      visible: true,
      tipo,
      titulo,
      mensaje,
    });
  };

  // ==========================================================================
  // 2. PERSISTENCIA LOCAL SEGURA (HU20: CA01, CA02, CA03)
  // ==========================================================================
  useEffect(() => {
    let activo = true;
    async function inicializarEstado() {
      const recuperado = await cargarEstadoLocal(PRODUCTOS_INICIALES);
      if (activo && recuperado) {
        setProductos(recuperado.productos);
        setCarrito(recuperado.carrito);
        setFavoritos(recuperado.favoritos);
        setHistorialPedidos(recuperado.historialPedidos);
        setCuponAplicado(recuperado.cuponAplicado);
        notificar(
          'info',
          'SESIÓN TÁCTICA RESTAURADA (HU20)',
          'Se recuperaron tu carrito, favoritos, inventario e historial local de forma segura.'
        );
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
    });
  }, [productos, carrito, favoritos, historialPedidos, cuponAplicado, hidratado]);

  // ==========================================================================
  // 3. FUNCIONES DE NAVEGACIÓN (HU02, HU07)
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
    setProductoDetalleId(productoId);
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
  // 4. FAVORITOS (HU08: CA01, CA02, CA03)
  // ==========================================================================
  const alternarFavorito = (producto) => {
    const yaEsFavorito = favoritos.includes(producto.id);
    if (yaEsFavorito) {
      setFavoritos((prev) => prev.filter((id) => id !== producto.id));
      notificar(
        'info',
        'FAVORITO REMOVIDO',
        `Se quitó "${producto.nombre}" de tu lista de favoritos.`
      );
    } else {
      setFavoritos((prev) => [...prev, producto.id]);
      notificar(
        'exito',
        'GUARDADO EN FAVORITOS ★',
        `"${producto.nombre}" quedó registrado en tus suministros favoritos.`
      );
    }
  };

  // ==========================================================================
  // 5. CARRITO DE COMPRAS: AGREGAR, CANTIDADES Y ELIMINAR (HU09, HU10)
  // ==========================================================================
  const obtenerCantidadEnCarrito = (productoId) => {
    const encontrado = carrito.find((item) => item.id === productoId);
    return encontrado ? encontrado.cantidad : 0;
  };

  const agregarAlCarrito = (producto) => {
    const productoActual =
      productos.find((p) => p.id === producto.id) || producto;

    // HU09-CA03: Producto agotado no puede agregarse y el carrito no cambia
    if (productoActual.stock <= 0) {
      notificar(
        'error',
        'SUMINISTRO AGOTADO (STOCK 0)',
        `No es posible agregar "${productoActual.nombre}" porque no tiene existencias disponibles. El carrito no ha cambiado.`
      );
      return;
    }

    const cantidadActual = obtenerCantidadEnCarrito(productoActual.id);

    // HU09-CA02: Impedir superar el stock disponible con advertencia
    if (cantidadActual >= productoActual.stock) {
      notificar(
        'alerta',
        'LÍMITE DE STOCK ALCANZADO',
        `Ya tienes ${cantidadActual} unidad(es) de "${productoActual.nombre}" en el carrito (máximo stock disponible: ${productoActual.stock}).`
      );
      return;
    }

    // HU09-CA01: Crear línea con cantidad 1 o aumentar cantidad existente de forma inmutable
    setCarrito((prevCarrito) => {
      const existe = prevCarrito.find((item) => item.id === productoActual.id);
      if (existe) {
        return prevCarrito.map((item) =>
          item.id === productoActual.id
            ? { ...item, cantidad: item.cantidad + 1, precio: productoActual.precio }
            : item
        );
      }
      return [
        ...prevCarrito,
        {
          id: productoActual.id,
          nombre: productoActual.nombre,
          categoria: productoActual.categoria,
          precio: productoActual.precio,
          icono: productoActual.icono || '📦',
          insignia: productoActual.insignia || productoActual.id,
          imagenPersonalizada: productoActual.imagenPersonalizada || null,
          cantidad: 1,
        },
      ];
    });

    setUltimoPedidoConfirmado(null);
    notificar(
      'exito',
      'SUMINISTRO AGREGADO AL CARRITO',
      `"${productoActual.nombre}" en carrito (${cantidadActual + 1} de ${productoActual.stock} disponibles).`
    );
  };

  const aumentarCantidadCarrito = (productoId) => {
    const productoCatalogo = productos.find((p) => p.id === productoId);
    const itemCarrito = carrito.find((i) => i.id === productoId);
    if (!productoCatalogo || !itemCarrito) return;

    // HU10-CA01: Pasa a +1 solo si existe stock suficiente
    if (itemCarrito.cantidad >= productoCatalogo.stock) {
      notificar(
        'alerta',
        'STOCK MÁXIMO EN CARRITO',
        `No puedes agregar más unidades de "${itemCarrito.nombre}". Stock máximo disponible: ${productoCatalogo.stock}.`
      );
      return;
    }

    setCarrito((prev) =>
      prev.map((item) =>
        item.id === productoId
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
    notificar(
      'info',
      'CANTIDAD ACTUALIZADA',
      `"${itemCarrito.nombre}" aumentó a ${itemCarrito.cantidad + 1} unidades.`
    );
  };

  const disminuirCantidadCarrito = (productoId) => {
    const itemCarrito = carrito.find((i) => i.id === productoId);
    if (!itemCarrito) return;

    // HU10-CA04: Si tiene cantidad 1 e intenta disminuir a 0, exige usar Eliminar sin números negativos
    if (itemCarrito.cantidad <= 1) {
      notificar(
        'alerta',
        'CANTIDAD MÍNIMA (1 UNIDAD)',
        `La cantidad mínima es 1. Para retirar "${itemCarrito.nombre}" del carrito, presiona el botón "Eliminar".`
      );
      return;
    }

    // HU10-CA02: Si cantidad > 1, baja una unidad y actualiza subtotal
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === productoId
          ? { ...item, cantidad: item.cantidad - 1 }
          : item
      )
    );
    notificar(
      'info',
      'CANTIDAD ACTUALIZADA',
      `"${itemCarrito.nombre}" disminuyó a ${itemCarrito.cantidad - 1} unidad(es).`
    );
  };

  const eliminarDelCarrito = (productoId) => {
    const itemCarrito = carrito.find((i) => i.id === productoId);
    // HU10-CA03: Desaparece del carrito y se recalculan sus valores
    setCarrito((prev) => {
      const nuevo = prev.filter((item) => item.id !== productoId);
      if (nuevo.length === 0) {
        setCuponAplicado(null);
        setResumenRevisado(false);
      }
      return nuevo;
    });
    if (itemCarrito) {
      notificar(
        'info',
        'REFERENCIA ELIMINADA',
        `Se eliminó "${itemCarrito.nombre}" del carrito y se recalcularon los totales.`
      );
    }
  };

  const vaciarCarritoCompleto = () => {
    setCarrito([]);
    setCuponAplicado(null);
    setResumenRevisado(false);
    notificar('info', 'CARRITO VACIADO', 'Se retiraron todas las referencias del carrito.');
  };

  // ==========================================================================
  // 6. CUPÓN PROMOCIONAL (HU17: CA01, CA02, CA03)
  // ==========================================================================
  const aplicarCupon = () => {
    if (carrito.length === 0) {
      notificar(
        'alerta',
        'CARRITO VACÍO',
        'Agrega al menos un suministro al carrito antes de aplicar un cupón promocional.'
      );
      return;
    }

    const limpio = codigoCuponInput.trim().toUpperCase();
    if (!limpio) {
      notificar(
        'error',
        'CÓDIGO VACÍO',
        'Escribe un código promocional (ejemplo: BIENVENIDO10) para validarlo.'
      );
      return;
    }

    // HU17-CA01: BIENVENIDO10 descuenta el 10% del subtotal
    if (limpio === MARCA_INFO.cuponValido.codigo) {
      setCuponAplicado(MARCA_INFO.cuponValido.codigo);
      notificar(
        'exito',
        'CUPÓN BIENVENIDO10 APLICADO (-10%)',
        'Se aplicó un descuento táctico del 10% sobre el subtotal de tu carrito.'
      );
    } else {
      // HU17-CA02: Código desconocido se rechaza sin modificar el total
      notificar(
        'error',
        'CUPÓN RECHAZADO',
        `El código "${limpio}" no es válido en el sistema UNSC. El total no fue modificado. Prueba con BIENVENIDO10.`
      );
    }
  };

  const quitarCupon = () => {
    setCuponAplicado(null);
    setCodigoCuponInput('');
    notificar('info', 'CUPÓN REMOVIDO', 'Se quitó el cupón promocional y se recalculó el total.');
  };

  // ==========================================================================
  // 7. VALIDAR DATOS DEL COMPRADOR Y CONFIRMAR COMPRA SIMULADA (HU12, HU13, HU14)
  // ==========================================================================
  const revisarDatosYResumen = () => {
    if (carrito.length === 0) {
      notificar(
        'error',
        'CARRITO VACÍO',
        'No puedes finalizar la compra porque el carrito está vacío.'
      );
      return false;
    }

    // HU12-CA02: Validar que ningún campo obligatorio esté vacío o solo con espacios
    const validacion = validarFormularioComprador({
      nombre: compradorNombre,
      telefono: compradorTelefono,
      municipio: compradorMunicipio,
      direccion: compradorDireccion,
    });

    if (!validacion.valido) {
      setResumenRevisado(false);
      notificar('error', 'DATOS DE ENTREGA INCOMPLETOS (HU12)', validacion.mensaje);
      return false;
    }

    // HU12-CA03: Permite revisar el resumen antes de confirmar
    setResumenRevisado(true);
    notificar(
      'exito',
      'RESUMEN LISTO PARA CONFIRMAR (HU12-CA03)',
      'Datos de entrega verificados. Revisa el resumen táctico y presiona "Confirmar compra simulada".'
    );
    return true;
  };

  const confirmarCompraSimulada = () => {
    if (carrito.length === 0) {
      notificar(
        'error',
        'SIN ARTÍCULOS EN EL CARRITO',
        'Agrega productos válidos al carrito antes de confirmar un pedido.'
      );
      return;
    }

    // 1. Verificar datos obligatorios del comprador (HU12-CA01, CA02)
    const validacionComprador = validarFormularioComprador({
      nombre: compradorNombre,
      telefono: compradorTelefono,
      municipio: compradorMunicipio,
      direccion: compradorDireccion,
    });

    if (!validacionComprador.valido) {
      notificar('error', 'VALIDACIÓN DE COMPRADOR FALLIDA', validacionComprador.mensaje);
      return;
    }

    // 2. HU13-CA02: Verificar atómicamente que TODOS los artículos tengan stock suficiente
    for (let i = 0; i < carrito.length; i += 1) {
      const item = carrito[i];
      const prodEnCatalogo = productos.find((p) => p.id === item.id);
      if (!prodEnCatalogo || prodEnCatalogo.stock < item.cantidad) {
        const stockActual = prodEnCatalogo ? prodEnCatalogo.stock : 0;
        notificar(
          'error',
          'OPERACIÓN CANCELADA POR STOCK INSUFICIENTE (HU13-CA02)',
          `El artículo "${item.nombre}" solicita ${item.cantidad} uds., pero solo hay ${stockActual} en inventario. No se descontó ningún producto.`
        );
        return;
      }
    }

    // 3. Calcular valores finales inmutables (HU11, HU17)
    const resumenFinal = calcularResumenCarrito(carrito, cuponAplicado);

    // 4. Generar código único de pedido (HU13-CA01)
    const consecutivo = String(historialPedidos.length + 1).padStart(3, '0');
    const sufijo = Math.floor(1000 + Math.random() * 9000);
    const codigoUnico = `UNSC-2552-${consecutivo}-${sufijo}`;
    const ahora = new Date();
    const fechaHora = `${ahora.toLocaleDateString('es-CO')} · ${ahora.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    // 5. Crear copia profunda e inmutable del pedido para el historial (HU15-CA03)
    const nuevoPedido = {
      codigo: codigoUnico,
      fechaHora,
      comprador: {
        nombre: compradorNombre.trim(),
        telefono: compradorTelefono.trim(),
        municipio: compradorMunicipio.trim(),
        direccion: compradorDireccion.trim(),
      },
      articulos: carrito.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        categoria: item.categoria,
        icono: item.icono,
        imagenPersonalizada: item.imagenPersonalizada || null,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        subtotalLinea: item.cantidad * item.precio,
      })),
      subtotal: resumenFinal.subtotal,
      cuponAplicado,
      descuento: resumenFinal.descuento,
      envio: resumenFinal.envio,
      total: resumenFinal.total,
      notaSimulacion:
        'SIMULACIÓN ACADÉMICA LOCAL: Este pedido no genera cobro real ni conexión con pasarelas bancarias.',
    };

    // 6. HU14-CA01 y CA03: Descontar existencias en el catálogo sin dejar stock negativo
    setProductos((prevProductos) =>
      prevProductos.map((prod) => {
        const itemComprado = carrito.find((c) => c.id === prod.id);
        if (!itemComprado) return prod;
        return {
          ...prod,
          stock: Math.max(0, prod.stock - itemComprado.cantidad),
        };
      })
    );

    // 7. Guardar en historial y vaciar carrito (HU13-CA03, HU15-CA01)
    setHistorialPedidos((prev) => [nuevoPedido, ...prev]);
    setUltimoPedidoConfirmado(nuevoPedido);
    setPedidoDetalleCodigo(nuevoPedido.codigo);
    setCarrito([]);
    setCuponAplicado(null);
    setCodigoCuponInput('');
    setResumenRevisado(false);

    notificar(
      'exito',
      `¡PEDIDO ${codigoUnico} CONFIRMADO! (SIMULACIÓN)`,
      `Compra simulada registrada por ${formatearCOP(resumenFinal.total)} COP. El inventario fue descontado y el carrito quedó vacío.`
    );
  };

  // ==========================================================================
  // 8. PANEL DE VENDEDOR: CREAR Y EDITAR PRODUCTOS (HU18: CA01, CA02, CA03)
  // ==========================================================================
  const limpiarFormularioVendedor = () => {
    setEditandoId(null);
    setVendNombre('');
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
    setVendCategoria(producto.categoria);
    setVendPrecio(String(producto.precio));
    setVendStock(String(producto.stock));
    setVendDescripcion(producto.descripcion);
    setVendInsignia(producto.insignia || producto.id);
    setVendImagenUrl(producto.imagenPersonalizada || '');
    notificar(
      'info',
      `EDITANDO ${producto.id}`,
      `Modifica los campos de "${producto.nombre}" y presiona "Actualizar producto".`
    );
  };

  const guardarProductoVendedor = () => {
    const validacion = validarProductoVendedor({
      nombre: vendNombre,
      categoria: vendCategoria,
      precioTexto: vendPrecio.trim(),
      stockTexto: vendStock.trim(),
      descripcion: vendDescripcion,
    });

    // HU18-CA03: Rechazar precio <= 0 o stock < 0 y explicar el error
    if (!validacion.valido) {
      notificar('error', 'ERROR DE VALIDACIÓN EN PANEL VENDEDOR (HU18)', validacion.mensaje);
      return;
    }

    const configCat =
      CATEGORIAS_CONFIG[vendCategoria] || CATEGORIAS_CONFIG['Armaduras Mjolnir'];

    if (editandoId) {
      // HU18-CA02: Actualizar producto existente sin duplicar la referencia
      setProductos((prev) =>
        prev.map((prod) =>
          prod.id === editandoId
            ? {
                ...prod,
                nombre: vendNombre.trim(),
                categoria: vendCategoria,
                precio: validacion.precio,
                stock: validacion.stock,
                descripcion: vendDescripcion.trim(),
                icono: configCat.icono,
                insignia:
                  vendInsignia.trim().length > 0
                    ? vendInsignia.trim().toUpperCase()
                    : prod.insignia,
                imagenPersonalizada:
                  vendImagenUrl.trim().length > 0 ? vendImagenUrl.trim() : null,
              }
            : prod
        )
      );

      setCarrito((prevCarrito) =>
        prevCarrito
          .map((item) =>
            item.id === editandoId
              ? {
                  ...item,
                  nombre: vendNombre.trim(),
                  categoria: vendCategoria,
                  precio: validacion.precio,
                  cantidad: Math.min(item.cantidad, validacion.stock),
                }
              : item
          )
          .filter((item) => item.cantidad > 0)
      );

      notificar(
        'exito',
        `SUMINISTRO ${editandoId} ACTUALIZADO (HU18-CA02)`,
        `Se actualizó "${vendNombre.trim()}" en el catálogo sin duplicar su referencia.`
      );
      limpiarFormularioVendedor();
    } else {
      // HU18-CA01: Crear producto con id único, categoría, precio y stock
      const nuevoNumero = productos.length + 1;
      let nuevoId = `PROD-${String(nuevoNumero).padStart(3, '0')}`;
      while (productos.some((p) => p.id === nuevoId)) {
        nuevoId = `PROD-${nuevoNumero}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const nuevoProducto = {
        id: nuevoId,
        nombre: vendNombre.trim(),
        categoria: vendCategoria,
        precio: validacion.precio,
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
      };

      setProductos((prev) => [nuevoProducto, ...prev]);
      notificar(
        'exito',
        `NUEVO PRODUCTO ${nuevoId} REGISTRADO (HU18-CA01)`,
        `"${nuevoProducto.nombre}" ya está disponible en el catálogo en la categoría ${nuevoProducto.categoria}.`
      );
      limpiarFormularioVendedor();
    }
  };

  // ==========================================================================
  // 9. RESEÑAS FICTICIAS EN DETALLE DEL PRODUCTO (HU19: CA01, CA02, CA03)
  // ==========================================================================
  const registrarResenaProducto = (productoId) => {
    const validacion = validarValoracionResena(
      resenaEstrellasInput.trim(),
      resenaAutorInput,
      resenaComentarioInput
    );

    // HU19-CA02: Si la valoración está fuera del rango 1..5, mostrar error
    if (!validacion.valido) {
      notificar('error', 'VALORACIÓN FUERA DE RANGO (HU19-CA02)', validacion.mensaje);
      return;
    }

    const nuevaResena = {
      id: `REV-${Date.now()}`,
      autor: validacion.autor,
      estrellas: validacion.estrellas,
      comentario: validacion.comentario,
    };

    // HU19-CA01 y CA03: Agregar valoración y recalcular promedio
    setProductos((prev) =>
      prev.map((prod) =>
        prod.id === productoId
          ? { ...prod, resenas: [nuevaResena, ...(prod.resenas || [])] }
          : prod
      )
    );

    setResenaAutorInput('');
    setResenaComentarioInput('');
    notificar(
      'exito',
      `VALORACIÓN DE ${validacion.estrellas} ★ REGISTRADA (HU19)`,
      'Tu calificación fue agregada al detalle del producto y el promedio fue actualizado.'
    );
  };

  // ==========================================================================
  // 10. RESTAURAR ESTADO DE FÁBRICA PARA PRUEBAS Y SUSTENTACIÓN
  // ==========================================================================
  const restaurarSimulacionCompleta = async () => {
    await limpiarEstadoLocal();
    setProductos(PRODUCTOS_INICIALES);
    setFavoritos(['PROD-001']);
    setCarrito([]);
    setHistorialPedidos([]);
    setCuponAplicado(null);
    setCodigoCuponInput('');
    setBusqueda('');
    setCategoriaSeleccionada('Todas');
    setOrdenPrecio('ninguno');
    setUltimoPedidoConfirmado(null);
    limpiarFormularioVendedor();
    notificar(
      'exito',
      'DATOS INICIALES RESTAURADOS',
      'Se restablecieron los 14 productos originales del UNSC con sus imágenes oficiales, stock inicial y almacenamiento local.'
    );
  };

  // ==========================================================================
  // 11. CÁLCULOS DERIVADOS: FILTRADO, BÚSQUEDA, ORDENAMIENTO Y RESUMEN
  // ==========================================================================
  const productosFiltrados = productos.filter((prod) => {
    const coincideCategoria =
      categoriaSeleccionada === 'Todas' ||
      prod.categoria === categoriaSeleccionada;

    const termino = busqueda.trim().toLowerCase();
    const coincideBusqueda =
      termino.length === 0 || prod.nombre.toLowerCase().includes(termino);

    return coincideCategoria && coincideBusqueda;
  });

  const productosVisibles = [...productosFiltrados].sort((a, b) => {
    if (ordenPrecio === 'asc') return a.precio - b.precio;
    if (ordenPrecio === 'desc') return b.precio - a.precio;
    return 0;
  });

  const productosFavoritos = productos.filter((prod) =>
    favoritos.includes(prod.id)
  );

  const productoDetalle =
    productos.find((prod) => prod.id === productoDetalleId) || productos[0];

  const resumenCarrito = calcularResumenCarrito(carrito, cuponAplicado);

  // ==========================================================================
  // 12. COMPONENTES DE INTERFAZ Y TARJETAS TÁCTICAS CON IMAGEN OFICIAL HALO
  // ==========================================================================

  const renderTarjetaProducto = ({ item }) => {
    const esFavorito = favoritos.includes(item.id);
    const enCarrito = obtenerCantidadEnCarrito(item.id);
    const agotado = item.stock <= 0;
    const infoEstrellas = calcularPromedioEstrellas(item.resenas);
    const configCat =
      CATEGORIAS_CONFIG[item.categoria] || CATEGORIAS_CONFIG['Armaduras Mjolnir'];

    return (
      <View
        style={[
          styles.cardProducto,
          agotado && styles.cardProductoAgotado,
        ]}
      >
        {/* Cabecera visual táctica con IMAGEN OFICIAL DEL JUEGO HALO */}
        <Pressable
          onPress={() => abrirDetalleProducto(item.id)}
          style={[
            styles.cardVisualHeader,
            { backgroundColor: item.colorTarjeta || configCat.colorFondo },
          ]}
        >
          <View style={styles.cardTopRow}>
            <View
              style={[
                styles.badgeCodigo,
                { borderColor: configCat.colorAcento },
              ]}
            >
              <Text
                style={[
                  styles.badgeCodigoTexto,
                  { color: configCat.colorAcento },
                ]}
              >
                {item.id} · {item.insignia || configCat.codigo}
              </Text>
            </View>

            <Pressable
              onPress={() => alternarFavorito(item)}
              style={[
                styles.btnFavoritoIcono,
                esFavorito && styles.btnFavoritoIconoActivo,
              ]}
            >
              <Text style={styles.btnFavoritoTexto}>
                {esFavorito ? '★ FAV' : '☆ FAV'}
              </Text>
            </Pressable>
          </View>

          {/* Render Oficial del Videojuego Halo */}
          <View style={styles.cardImagenWrapper}>
            <Image
              source={obtenerFuenteImagen(item)}
              style={styles.cardImagenOficial}
              resizeMode="contain"
            />
          </View>

          <View style={styles.cardFooterHudRow}>
            <Text
              style={[
                styles.cardCategoriaTag,
                { color: configCat.colorAcento },
              ]}
            >
              {configCat.icono} {item.categoria.toUpperCase()}
            </Text>
            <Text style={styles.cardEstrellasTexto}>
              {infoEstrellas.texto}
            </Text>
          </View>
        </Pressable>

        {/* Cuerpo de datos obligatorios HU03-CA02: nombre, precio en COP, categoría y disponibilidad */}
        <View style={styles.cardBody}>
          <Pressable onPress={() => abrirDetalleProducto(item.id)}>
            <Text style={styles.cardNombre}>{item.nombre}</Text>
          </Pressable>

          <Text style={styles.cardDescripcionBreve} numberOfLines={2}>
            {item.descripcion}
          </Text>

          <View style={styles.cardPrecioStockRow}>
            <View>
              <Text style={styles.cardPrecioLabel}>PRECIO UNITARIO (COP)</Text>
              <Text style={styles.cardPrecioValor}>
                {formatearCOP(item.precio)} COP
              </Text>
            </View>

            <View
              style={[
                styles.badgeStock,
                agotado ? styles.badgeStockAgotado : styles.badgeStockDisponible,
              ]}
            >
              <Text
                style={[
                  styles.badgeStockTexto,
                  agotado
                    ? styles.badgeStockTextoAgotado
                    : styles.badgeStockTextoDisponible,
                ]}
              >
                {agotado
                  ? 'AGOTADO (Stock: 0)'
                  : `Stock: ${item.stock} uds.`}
              </Text>
            </View>
          </View>

          {enCarrito > 0 && (
            <View style={styles.indicadorEnCarrito}>
              <Text style={styles.indicadorEnCarritoTexto}>
                🛒 En tu carrito: {enCarrito} unidad(es)
              </Text>
            </View>
          )}

          {/* Botones de acción de la tarjeta */}
          <View style={styles.cardActionsRow}>
            <Pressable
              onPress={() => abrirDetalleProducto(item.id)}
              style={styles.btnSecundarioCard}
            >
              <Text style={styles.btnSecundarioCardTexto}>🔍 Ver detalle</Text>
            </Pressable>

            <Pressable
              onPress={() => agregarAlCarrito(item)}
              style={[
                styles.btnPrimarioCard,
                agotado && styles.btnPrimarioCardAgotado,
              ]}
            >
              <Text
                style={[
                  styles.btnPrimarioCardTexto,
                  agotado && styles.btnPrimarioCardTextoAgotado,
                ]}
              >
                {agotado ? '🚫 Agotado' : '➕ Agregar'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  // ==========================================================================
  // 13. RENDERIZADO DE VISTAS
  // ==========================================================================

  // VISTA 1: CATÁLOGO PRINCIPAL (HU03, HU04, HU05, HU06)
  const renderVistaCatalogo = () => {
    const categoriasFiltro = ['Todas', ...MARCA_INFO.categorias];

    return (
      <FlatList
        data={productosVisibles}
        keyExtractor={(item) => item.id}
        renderItem={renderTarjetaProducto}
        contentContainerStyle={styles.listaContenedor}
        ListHeaderComponent={
          <View style={styles.panelFiltrosContainer}>
            {/* Buscador por palabra clave (HU04) */}
            <Text style={styles.seccionSubtitulo}>
              BUSCADOR TÁCTICO DE SUMINISTROS (HU04)
            </Text>
            <View style={styles.buscadorRow}>
              <TextInput
                style={styles.inputBuscador}
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Buscar por nombre (ej. Mjolnir, Pelican, Rifle, Warthog)..."
                placeholderTextColor="#64748B"
              />
              {busqueda.length > 0 && (
                <Pressable
                  onPress={() => setBusqueda('')}
                  style={styles.btnLimpiarBusqueda}
                >
                  <Text style={styles.btnLimpiarBusquedaTexto}>✕ Limpiar</Text>
                </Pressable>
              )}
            </View>

            {/* Filtro por las 4 Categorías (HU05) */}
            <Text style={styles.seccionSubtitulo}>
              FILTRAR POR CATEGORÍA UNSC (HU05)
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
            >
              {categoriasFiltro.map((cat) => {
                const activa = categoriaSeleccionada === cat;
                const iconoCat =
                  cat === 'Todas'
                    ? '🌐'
                    : CATEGORIAS_CONFIG[cat]?.icono || '📦';
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategoriaSeleccionada(cat)}
                    style={[
                      styles.chipCategoria,
                      activa && styles.chipCategoriaActiva,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipCategoriaTexto,
                        activa && styles.chipCategoriaTextoActivo,
                      ]}
                    >
                      {iconoCat} {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Ordenar por precio (HU06) */}
            <Text style={styles.seccionSubtitulo}>
              ORDENAR POR PRECIO EN COP (HU06)
            </Text>
            <View style={styles.ordenRow}>
              <Pressable
                onPress={() => setOrdenPrecio('ninguno')}
                style={[
                  styles.btnOrden,
                  ordenPrecio === 'ninguno' && styles.btnOrdenActivo,
                ]}
              >
                <Text
                  style={[
                    styles.btnOrdenTexto,
                    ordenPrecio === 'ninguno' && styles.btnOrdenTextoActivo,
                  ]}
                >
                  Por defecto
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setOrdenPrecio('asc')}
                style={[
                  styles.btnOrden,
                  ordenPrecio === 'asc' && styles.btnOrdenActivo,
                ]}
              >
                <Text
                  style={[
                    styles.btnOrdenTexto,
                    ordenPrecio === 'asc' && styles.btnOrdenTextoActivo,
                  ]}
                >
                  ↑ Menor a mayor
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setOrdenPrecio('desc')}
                style={[
                  styles.btnOrden,
                  ordenPrecio === 'desc' && styles.btnOrdenActivo,
                ]}
              >
                <Text
                  style={[
                    styles.btnOrdenTexto,
                    ordenPrecio === 'desc' && styles.btnOrdenTextoActivo,
                  ]}
                >
                  ↓ Mayor a menor
                </Text>
              </Pressable>
            </View>

            {/* Resumen de resultados visibles */}
            <View style={styles.barraEstadoCatalogo}>
              <Text style={styles.barraEstadoCatalogoTexto}>
                Mostrando {productosVisibles.length} de {productos.length} suministros oficiales
                {categoriaSeleccionada !== 'Todas'
                  ? ` · Categoría: ${categoriaSeleccionada}`
                  : ''}
                {busqueda.trim() ? ` · Búsqueda: "${busqueda.trim()}"` : ''}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          // HU03-CA03 y HU04-CA03: Mensaje exacto "No encontramos productos"
          <View style={styles.estadoVacioBox}>
            <Text style={styles.estadoVacioIcono}>🛰️</Text>
            <Text style={styles.estadoVacioTitulo}>
              No encontramos productos
            </Text>
            <Text style={styles.estadoVacioSubtitulo}>
              Ningún suministro del arsenal coincide con la búsqueda{' '}
              {busqueda ? `"${busqueda}"` : ''} en la categoría seleccionada (
              {categoriaSeleccionada}).
            </Text>
            <Pressable
              onPress={() => {
                setBusqueda('');
                setCategoriaSeleccionada('Todas');
                setOrdenPrecio('ninguno');
              }}
              style={styles.btnAccionVacio}
            >
              <Text style={styles.btnAccionVacioTexto}>
                🔄 Restablecer filtros y ver todo el catálogo
              </Text>
            </Pressable>
          </View>
        }
      />
    );
  };

  // VISTA 2: DETALLE DEL PRODUCTO + RESEÑAS FICTICIAS (HU07, HU19)
  const renderVistaDetalle = () => {
    if (!productoDetalle) return null;

    const esFavorito = favoritos.includes(productoDetalle.id);
    const enCarrito = obtenerCantidadEnCarrito(productoDetalle.id);
    const agotado = productoDetalle.stock <= 0;
    const infoEstrellas = calcularPromedioEstrellas(productoDetalle.resenas);
    const configCat =
      CATEGORIAS_CONFIG[productoDetalle.categoria] ||
      CATEGORIAS_CONFIG['Armaduras Mjolnir'];

    return (
      <ScrollView contentContainerStyle={styles.scrollVistaContenedor}>
        {/* Botón Volver (HU02-CA03 y HU07-CA03) */}
        <View style={styles.detalleTopBar}>
          <Pressable onPress={volverDeDetalle} style={styles.btnVolver}>
            <Text style={styles.btnVolverTexto}>
              ← Volver a {vistaAnterior === 'favoritos' ? 'Favoritos' : 'Catálogo'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => alternarFavorito(productoDetalle)}
            style={[
              styles.btnFavoritoDetalle,
              esFavorito && styles.btnFavoritoIconoActivo,
            ]}
          >
            <Text style={styles.btnFavoritoTexto}>
              {esFavorito ? '★ En Favoritos' : '☆ Guardar Favorito'}
            </Text>
          </Pressable>
        </View>

        {/* Ficha Principal del Producto con IMAGEN OFICIAL GRANDE (HU07-CA01) */}
        <View style={styles.detalleCard}>
          <View
            style={[
              styles.detalleHeroBanner,
              {
                backgroundColor:
                  productoDetalle.colorTarjeta || configCat.colorFondo,
              },
            ]}
          >
            <View style={styles.detalleImagenWrapper}>
              <Image
                source={obtenerFuenteImagen(productoDetalle)}
                style={styles.detalleImagenOficial}
                resizeMode="contain"
              />
            </View>
            <Text
              style={[
                styles.detalleInsigniaCodigo,
                { color: configCat.colorAcento },
              ]}
            >
              CÓDIGO UNSC: {productoDetalle.id} · {productoDetalle.insignia}
            </Text>
            <Text style={styles.detalleCategoriaTexto}>
              Categoría: {productoDetalle.categoria}
            </Text>
          </View>

          <View style={styles.detalleContenido}>
            <Text style={styles.detalleTitulo}>{productoDetalle.nombre}</Text>

            <View style={styles.detalleMetricasRow}>
              <View style={styles.detalleMetricaCaja}>
                <Text style={styles.detalleMetricaLabel}>PRECIO UNITARIO</Text>
                <Text style={styles.detallePrecioValor}>
                  {formatearCOP(productoDetalle.precio)} COP
                </Text>
              </View>

              <View style={styles.detalleMetricaCaja}>
                <Text style={styles.detalleMetricaLabel}>DISPONIBILIDAD</Text>
                <Text
                  style={[
                    styles.detalleStockValor,
                    agotado ? styles.textoRojo : styles.textoVerde,
                  ]}
                >
                  {agotado
                    ? 'AGOTADO (0 uds.)'
                    : `${productoDetalle.stock} unidades`}
                </Text>
              </View>

              <View style={styles.detalleMetricaCaja}>
                <Text style={styles.detalleMetricaLabel}>VALORACIÓN PROMEDIO</Text>
                <Text style={styles.detalleEstrellasValor}>
                  {infoEstrellas.texto}
                </Text>
              </View>
            </View>

            <Text style={styles.detalleSeccionLabel}>
              DESCRIPCIÓN TÁCTICA DEL SUMINISTRO
            </Text>
            <Text style={styles.detalleDescripcionTexto}>
              {productoDetalle.descripcion}
            </Text>

            {productoDetalle.especificaciones && (
              <View style={styles.detalleSpecsBox}>
                <Text style={styles.detalleSpecsTitulo}>
                  TELEMETRÍA Y ESPECIFICACIONES UNSC:
                </Text>
                <Text style={styles.detalleSpecsTexto}>
                  {productoDetalle.especificaciones}
                </Text>
              </View>
            )}

            {enCarrito > 0 && (
              <View style={styles.indicadorEnCarrito}>
                <Text style={styles.indicadorEnCarritoTexto}>
                  🛒 Actualmente tienes {enCarrito} unidad(es) de este artículo en tu carrito.
                </Text>
              </View>
            )}

            {/* HU07-CA02: Si tiene stock 0 aparece agotado y no permite agregar unidades */}
            <Pressable
              onPress={() => agregarAlCarrito(productoDetalle)}
              style={[
                styles.btnAgregarGrande,
                agotado && styles.btnPrimarioCardAgotado,
              ]}
            >
              <Text
                style={[
                  styles.btnAgregarGrandeTexto,
                  agotado && styles.btnPrimarioCardTextoAgotado,
                ]}
              >
                {agotado
                  ? '🚫 PRODUCTO AGOTADO · NO DISPONIBLE PARA AGREGAR'
                  : '➕ AGREGAR 1 UNIDAD AL CARRITO DE SUMINISTROS'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* SECCIÓN HU19: RESEÑAS FICTICIAS Y CALIFICACIÓN CON ESTRELLAS */}
        <View style={styles.resenasPanel}>
          <Text style={styles.resenasTitulo}>
            ★ BITÁCORA DE RESEÑAS Y VALORACIONES (HU19)
          </Text>
          <Text style={styles.resenasPromedioSub}>
            Promedio calculado: {infoEstrellas.texto}
          </Text>

          <Text style={styles.inputLabel}>
            Selecciona o escribe una calificación entera entre 1 y 5 estrellas:
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
                    seleccionada && styles.btnEstrellaOpcionActiva,
                  ]}
                >
                  <Text
                    style={[
                      styles.btnEstrellaOpcionTexto,
                      seleccionada && styles.btnEstrellaOpcionTextoActivo,
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
              <Text style={styles.inputLabel}>Valor numérico (1 a 5):</Text>
              <TextInput
                style={styles.inputCampo}
                value={resenaEstrellasInput}
                onChangeText={setResenaEstrellasInput}
                keyboardType="numeric"
                placeholder="1 - 5"
                placeholderTextColor="#64748B"
              />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={styles.inputLabel}>Indicativo / Autor (opcional):</Text>
              <TextInput
                style={styles.inputCampo}
                value={resenaAutorInput}
                onChangeText={setResenaAutorInput}
                placeholder="Ej. Spartan-117"
                placeholderTextColor="#64748B"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Comentario táctico (opcional):</Text>
          <TextInput
            style={styles.inputCampo}
            value={resenaComentarioInput}
            onChangeText={setResenaComentarioInput}
            placeholder="Escribe tu evaluación del equipamiento..."
            placeholderTextColor="#64748B"
          />

          <Pressable
            onPress={() => registrarResenaProducto(productoDetalle.id)}
            style={styles.btnGuardarResena}
          >
            <Text style={styles.btnGuardarResenaTexto}>
              💾 Registrar valoración en el producto
            </Text>
          </Pressable>

          {/* Lista de reseñas registradas */}
          <View style={styles.listaResenasBox}>
            {(productoDetalle.resenas || []).map((rev) => (
              <View key={rev.id} style={styles.resenaItemCard}>
                <View style={styles.resenaItemHeader}>
                  <Text style={styles.resenaItemAutor}>🪖 {rev.autor}</Text>
                  <Text style={styles.resenaItemEstrellas}>
                    {'★'.repeat(rev.estrellas)}
                    {'☆'.repeat(Math.max(0, 5 - rev.estrellas))} ({rev.estrellas}/5)
                  </Text>
                </View>
                <Text style={styles.resenaItemComentario}>{rev.comentario}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  // VISTA 3: LISTA DE FAVORITOS (HU08)
  const renderVistaFavoritos = () => {
    return (
      <FlatList
        data={productosFavoritos}
        keyExtractor={(item) => item.id}
        renderItem={renderTarjetaProducto}
        contentContainerStyle={styles.listaContenedor}
        ListHeaderComponent={
          <View style={styles.encabezadoSeccionBox}>
            <Text style={styles.encabezadoSeccionTitulo}>
              ★ ARSENAL DE FAVORITOS GUARDADOS (HU08)
            </Text>
            <Text style={styles.encabezadoSeccionSub}>
              Tienes {productosFavoritos.length} suministro(s) marcados como prioritarios.
            </Text>
          </View>
        }
        ListEmptyComponent={
          // HU08-CA03: Mensaje de estado vacío y botón para volver al catálogo
          <View style={styles.estadoVacioBox}>
            <Text style={styles.estadoVacioIcono}>☆</Text>
            <Text style={styles.estadoVacioTitulo}>
              Tu lista de favoritos está vacía
            </Text>
            <Text style={styles.estadoVacioSubtitulo}>
              Aún no has guardado armaduras Mjolnir, naves, armas ni vehículos en tu lista de favoritos.
            </Text>
            <Pressable
              onPress={() => irAVista('catalogo')}
              style={styles.btnAccionVacio}
            >
              <Text style={styles.btnAccionVacioTexto}>
                🛡️ Volver al Catálogo de Suministros
              </Text>
            </Pressable>
          </View>
        }
      />
    );
  };

  // VISTA 4: CARRITO DE COMPRAS, RESUMEN, CUPÓN Y CHECKOUT (HU09 a HU17)
  const renderVistaCarrito = () => {
    const municipiosSugeridos = ['Mosquera', 'Madrid', 'Funza', 'Nueva Mombasa'];

    return (
      <ScrollView contentContainerStyle={styles.scrollVistaContenedor}>
        <View style={styles.encabezadoSeccionBox}>
          <Text style={styles.encabezadoSeccionTitulo}>
            🛒 BAHÍA DE CARGA · CARRITO DE COMPRAS
          </Text>
          <Text style={styles.encabezadoSeccionSub}>
            Ajusta cantidades, verifica costos de envío en COP y confirma tu pedido simulado.
          </Text>
        </View>

        {/* Confirmación destacada si acaba de realizar una compra (HU13-CA01 y CA04) */}
        {ultimoPedidoConfirmado && (
          <View style={styles.confirmacionPedidoBox}>
            <Text style={styles.confirmacionPedidoTag}>
              ✅ CONFIRMACIÓN DE COMPRA SIMULADA (HU13)
            </Text>
            <Text style={styles.confirmacionPedidoCodigo}>
              Código Único: {ultimoPedidoConfirmado.codigo}
            </Text>
            <Text style={styles.confirmacionPedidoDetalle}>
              Comprador: {ultimoPedidoConfirmado.comprador.nombre} · Municipio:{' '}
              {ultimoPedidoConfirmado.comprador.municipio}
            </Text>
            <Text style={styles.confirmacionPedidoTotal}>
              Total Registrado: {formatearCOP(ultimoPedidoConfirmado.total)} COP
            </Text>
            <Text style={styles.confirmacionPedidoAviso}>
              {ultimoPedidoConfirmado.notaSimulacion}
            </Text>
            <Pressable
              onPress={() => {
                setPedidoDetalleCodigo(ultimoPedidoConfirmado.codigo);
                irAVista('historial');
              }}
              style={styles.btnIrHistorialConfirm}
            >
              <Text style={styles.btnIrHistorialConfirmTexto}>
                📜 Ver detalle del pedido en Historial →
              </Text>
            </Pressable>
          </View>
        )}

        {/* Lista de ítems en el carrito o estado vacío */}
        {carrito.length === 0 ? (
          <View style={styles.estadoVacioBox}>
            <Text style={styles.estadoVacioIcono}>🛒</Text>
            <Text style={styles.estadoVacioTitulo}>
              El carrito de suministros está vacío
            </Text>
            <Text style={styles.estadoVacioSubtitulo}>
              Agrega armaduras Mjolnir, naves de la humanidad, armas o vehículos terrestres desde el catálogo para preparar tu pedido.
            </Text>
            <Pressable
              onPress={() => irAVista('catalogo')}
              style={styles.btnAccionVacio}
            >
              <Text style={styles.btnAccionVacioTexto}>
                🚀 Explorar Catálogo de Suministros
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.listaCarritoBox}>
            <View style={styles.listaCarritoHeaderRow}>
              <Text style={styles.seccionSubtitulo}>
                REFERENCIAS EN EL CARRITO ({carrito.length})
              </Text>
              <Pressable onPress={vaciarCarritoCompleto}>
                <Text style={styles.linkVaciarCarrito}>Vaciar todo</Text>
              </Pressable>
            </View>

            {carrito.map((item) => {
              const prodCatalogo = productos.find((p) => p.id === item.id);
              const stockMax = prodCatalogo ? prodCatalogo.stock : item.cantidad;
              const subtotalLinea = item.precio * item.cantidad;

              return (
                <View key={item.id} style={styles.carritoItemCard}>
                  <View style={styles.carritoItemTop}>
                    <View style={styles.miniaturaWrapper}>
                      <Image
                        source={obtenerFuenteImagen(prodCatalogo || item)}
                        style={styles.miniaturaImagen}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.carritoItemNombre}>{item.nombre}</Text>
                      <Text style={styles.carritoItemMeta}>
                        {item.categoria} · Unitario: {formatearCOP(item.precio)} COP · Stock disponible: {stockMax}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.carritoItemControlesRow}>
                    <View style={styles.cantidadControlesGroup}>
                      <Pressable
                        onPress={() => disminuirCantidadCarrito(item.id)}
                        style={styles.btnCantidad}
                      >
                        <Text style={styles.btnCantidadTexto}>−</Text>
                      </Pressable>

                      <View style={styles.cantidadValorBox}>
                        <Text style={styles.cantidadValorTexto}>
                          {item.cantidad}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => aumentarCantidadCarrito(item.id)}
                        style={styles.btnCantidad}
                      >
                        <Text style={styles.btnCantidadTexto}>+</Text>
                      </Pressable>
                    </View>

                    <View style={styles.subtotalLineaBox}>
                      <Text style={styles.subtotalLineaLabel}>Subtotal línea</Text>
                      <Text style={styles.subtotalLineaValor}>
                        {formatearCOP(subtotalLinea)} COP
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => eliminarDelCarrito(item.id)}
                      style={styles.btnEliminarItem}
                    >
                      <Text style={styles.btnEliminarItemTexto}>🗑 Eliminar</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* SECCIÓN HU17: CUPÓN PROMOCIONAL */}
        <View style={styles.panelSeccionCard}>
          <Text style={styles.panelSeccionTitulo}>
            🎟️ CUPÓN PROMOCIONAL UNSC (HU17)
          </Text>
          <Text style={styles.panelSeccionAyuda}>
            Código oficial de prueba: <Text style={styles.textoVerdeBold}>BIENVENIDO10</Text> (10% de descuento sobre el subtotal).
          </Text>

          <View style={styles.cuponRow}>
            <TextInput
              style={[styles.inputCampo, { flex: 1, marginBottom: 0, marginRight: 8 }]}
              value={codigoCuponInput}
              onChangeText={setCodigoCuponInput}
              placeholder="Ingresa código (ej. BIENVENIDO10)"
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
            />
            <Pressable onPress={aplicarCupon} style={styles.btnAplicarCupon}>
              <Text style={styles.btnAplicarCuponTexto}>Aplicar</Text>
            </Pressable>
          </View>

          {cuponAplicado && (
            <View style={styles.cuponActivoBanner}>
              <Text style={styles.cuponActivoTexto}>
                ✅ Cupón {cuponAplicado} activo (-10%: -{formatearCOP(resumenCarrito.descuento)} COP)
              </Text>
              <Pressable onPress={quitarCupon}>
                <Text style={styles.linkQuitarCupon}>Quitar</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* SECCIÓN HU11: RESUMEN DE COMPRA Y ENVÍO */}
        <View style={styles.panelSeccionCard}>
          <Text style={styles.panelSeccionTitulo}>
            📊 RESUMEN DE COMPRA Y ENVÍO (HU11)
          </Text>
          <Text style={styles.panelSeccionAyuda}>
            Regla de negocio: Envío $8.000 si el subtotal es menor a $150.000 COP. Envío GRATIS si el subtotal es igual o superior a $150.000 COP. $0 si el carrito está vacío.
          </Text>

          <View style={styles.resumenLinea}>
            <Text style={styles.resumenLabel}>
              Subtotal ({resumenCarrito.totalUnidades} uds.):
            </Text>
            <Text style={styles.resumenValor}>
              {formatearCOP(resumenCarrito.subtotal)} COP
            </Text>
          </View>

          {cuponAplicado && (
            <View style={styles.resumenLinea}>
              <Text style={[styles.resumenLabel, styles.textoVerde]}>
                Descuento cupón ({cuponAplicado} · 10%):
              </Text>
              <Text style={[styles.resumenValor, styles.textoVerde]}>
                -{formatearCOP(resumenCarrito.descuento)} COP
              </Text>
            </View>
          )}

          <View style={styles.resumenLinea}>
            <Text style={styles.resumenLabel}>Costo de envío simulado:</Text>
            <Text
              style={[
                styles.resumenValor,
                resumenCarrito.envioGratis && styles.textoVerde,
              ]}
            >
              {carrito.length === 0
                ? '$0 COP (Carrito vacío)'
                : resumenCarrito.envioGratis
                ? 'GRATIS ($0 COP)'
                : `${formatearCOP(resumenCarrito.envio)} COP`}
            </Text>
          </View>

          <View style={styles.resumenSeparador} />

          <View style={styles.resumenLineaTotal}>
            <Text style={styles.resumenTotalLabel}>TOTAL ESTIMADO:</Text>
            <Text style={styles.resumenTotalValor}>
              {formatearCOP(resumenCarrito.total)} COP
            </Text>
          </View>
        </View>

        {/* SECCIÓN HU12 Y HU13: DATOS BÁSICOS DEL COMPRADOR Y CONFIRMACIÓN */}
        <View style={styles.panelSeccionCard}>
          <Text style={styles.panelSeccionTitulo}>
            🧑‍✈️ DATOS BÁSICOS DEL COMPRADOR (HU12)
          </Text>

          <View style={styles.avisoSimulacionBox}>
            <Text style={styles.avisoSimulacionTexto}>
              🛡️ SIMULACIÓN ACADÉMICA: No se exigen números de tarjeta, contraseñas, documentos reales ni datos bancarios sensibles. No se realiza ningún cobro real.
            </Text>
          </View>

          <Text style={styles.inputLabel}>Nombre completo del comprador *:</Text>
          <TextInput
            style={styles.inputCampo}
            value={compradorNombre}
            onChangeText={(t) => {
              setCompradorNombre(t);
              setResumenRevisado(false);
            }}
            placeholder="Ej. John-117 / Comandante Keyes"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.inputLabel}>Teléfono de contacto *:</Text>
          <TextInput
            style={styles.inputCampo}
            value={compradorTelefono}
            onChangeText={(t) => {
              setCompradorTelefono(t);
              setResumenRevisado(false);
            }}
            keyboardType="phone-pad"
            placeholder="Ej. 3001172552"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.inputLabel}>
            Municipio de entrega * (selección rápida o escribe):
          </Text>
          <View style={styles.municipiosChipsRow}>
            {municipiosSugeridos.map((mun) => (
              <Pressable
                key={mun}
                onPress={() => {
                  setCompradorMunicipio(mun);
                  setResumenRevisado(false);
                }}
                style={[
                  styles.chipMunicipio,
                  compradorMunicipio === mun && styles.chipMunicipioActivo,
                ]}
              >
                <Text
                  style={[
                    styles.chipMunicipioTexto,
                    compradorMunicipio === mun && styles.chipMunicipioTextoActivo,
                  ]}
                >
                  📍 {mun}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.inputCampo}
            value={compradorMunicipio}
            onChangeText={(t) => {
              setCompradorMunicipio(t);
              setResumenRevisado(false);
            }}
            placeholder="Ej. Mosquera, Madrid, Funza..."
            placeholderTextColor="#64748B"
          />

          <Text style={styles.inputLabel}>Dirección de entrega *:</Text>
          <TextInput
            style={styles.inputCampo}
            value={compradorDireccion}
            onChangeText={(t) => {
              setCompradorDireccion(t);
              setResumenRevisado(false);
            }}
            placeholder="Ej. Base UNSC Sector 7 Calle 117 # 25-52"
            placeholderTextColor="#64748B"
          />

          {/* HU12-CA03: Revisar el resumen antes de confirmar */}
          <Pressable
            onPress={revisarDatosYResumen}
            style={styles.btnValidarPrevia}
          >
            <Text style={styles.btnValidarPreviaTexto}>
              📋 1. Validar datos y revisar resumen previo (HU12-CA03)
            </Text>
          </Pressable>

          {resumenRevisado && carrito.length > 0 && (
            <View style={styles.preConfirmacionResumenBox}>
              <Text style={styles.preConfirmacionTitulo}>
                ✓ RESUMEN VERIFICADO LISTO PARA DESPACHO:
              </Text>
              <Text style={styles.preConfirmacionTexto}>
                • Destinatario: {compradorNombre.trim()} ({compradorTelefono.trim()})
              </Text>
              <Text style={styles.preConfirmacionTexto}>
                • Destino: {compradorDireccion.trim()}, {compradorMunicipio.trim()}
              </Text>
              <Text style={styles.preConfirmacionTexto}>
                • Artículos: {resumenCarrito.totalUnidades} unidad(es) · Total final:{' '}
                {formatearCOP(resumenCarrito.total)} COP
              </Text>
            </View>
          )}

          {/* HU13: Botón Confirmar compra simulada */}
          <Pressable
            onPress={confirmarCompraSimulada}
            style={[
              styles.btnConfirmarCompra,
              carrito.length === 0 && styles.btnPrimarioCardAgotado,
            ]}
          >
            <Text style={styles.btnConfirmarCompraTexto}>
              ✅ 2. Confirmar compra simulada ({formatearCOP(resumenCarrito.total)} COP)
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  // VISTA 5: HISTORIAL Y DETALLE DE PEDIDOS (HU15)
  const renderVistaHistorial = () => {
    const pedidoSeleccionado =
      historialPedidos.find((p) => p.codigo === pedidoDetalleCodigo) ||
      historialPedidos[0];

    return (
      <ScrollView contentContainerStyle={styles.scrollVistaContenedor}>
        <View style={styles.encabezadoSeccionBox}>
          <Text style={styles.encabezadoSeccionTitulo}>
            📜 BITÁCORA DE PEDIDOS CONFIRMADOS (HU15)
          </Text>
          <Text style={styles.encabezadoSeccionSub}>
            Cada pedido guarda una copia inmutable de sus artículos, precios, envío y total.
          </Text>
        </View>

        {historialPedidos.length === 0 ? (
          <View style={styles.estadoVacioBox}>
            <Text style={styles.estadoVacioIcono}>📜</Text>
            <Text style={styles.estadoVacioTitulo}>
              No hay pedidos registrados todavía
            </Text>
            <Text style={styles.estadoVacioSubtitulo}>
              Cuando confirmes una compra simulada en el carrito, aquí aparecerá su código único, fecha/hora y desglose completo.
            </Text>
            <Pressable
              onPress={() => irAVista('catalogo')}
              style={styles.btnAccionVacio}
            >
              <Text style={styles.btnAccionVacioTexto}>
                🛒 Ir al Catálogo para simular una compra
              </Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <Text style={styles.seccionSubtitulo}>
              LISTA DE PEDIDOS CONFIRMADOS ({historialPedidos.length}) · SELECCIONA UNO PARA VER SU DETALLE:
            </Text>

            {historialPedidos.map((pedido) => {
              const seleccionado =
                pedidoSeleccionado &&
                pedidoSeleccionado.codigo === pedido.codigo;
              return (
                <Pressable
                  key={pedido.codigo}
                  onPress={() => setPedidoDetalleCodigo(pedido.codigo)}
                  style={[
                    styles.pedidoListaCard,
                    seleccionado && styles.pedidoListaCardActivo,
                  ]}
                >
                  <View style={styles.pedidoListaTop}>
                    <Text style={styles.pedidoCodigoTexto}>
                      📦 {pedido.codigo}
                    </Text>
                    <Text style={styles.pedidoTotalBadge}>
                      {formatearCOP(pedido.total)} COP
                    </Text>
                  </View>
                  <Text style={styles.pedidoFechaTexto}>
                    🕒 Fecha/Hora: {pedido.fechaHora}
                  </Text>
                  <Text style={styles.pedidoCompradorTexto}>
                    👤 {pedido.comprador.nombre} · 📍 {pedido.comprador.municipio}
                  </Text>
                </Pressable>
              );
            })}

            {/* HU15-CA02: Detalle del pedido seleccionado */}
            {pedidoSeleccionado && (
              <View style={styles.pedidoDetallePanel}>
                <Text style={styles.pedidoDetalleTitulo}>
                  🔍 DETALLE DEL PEDIDO {pedidoSeleccionado.codigo}
                </Text>
                <Text style={styles.pedidoDetalleMeta}>
                  Fecha de registro: {pedidoSeleccionado.fechaHora}
                </Text>
                <Text style={styles.pedidoDetalleMeta}>
                  Destinatario: {pedidoSeleccionado.comprador.nombre} · Tel:{' '}
                  {pedidoSeleccionado.comprador.telefono}
                </Text>
                <Text style={styles.pedidoDetalleMeta}>
                  Dirección: {pedidoSeleccionado.comprador.direccion} (
                  {pedidoSeleccionado.comprador.municipio})
                </Text>

                <View style={styles.resumenSeparador} />

                <Text style={styles.seccionSubtitulo}>
                  ARTÍCULOS REGISTRADOS EN ESTE PEDIDO:
                </Text>

                {pedidoSeleccionado.articulos.map((art) => (
                  <View key={art.id} style={styles.pedidoArticuloRow}>
                    <View style={styles.miniaturaWrapper}>
                      <Image
                        source={obtenerFuenteImagen(art)}
                        style={styles.miniaturaImagen}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pedidoArticuloNombre}>
                        {art.nombre}
                      </Text>
                      <Text style={styles.pedidoArticuloDetalle}>
                        Cantidad: {art.cantidad} × Precio unitario:{' '}
                        {formatearCOP(art.precioUnitario)} COP
                      </Text>
                    </View>
                    <Text style={styles.pedidoArticuloSubtotal}>
                      {formatearCOP(art.subtotalLinea)} COP
                    </Text>
                  </View>
                ))}

                <View style={styles.resumenSeparador} />

                <View style={styles.resumenLinea}>
                  <Text style={styles.resumenLabel}>Subtotal registrado:</Text>
                  <Text style={styles.resumenValor}>
                    {formatearCOP(pedidoSeleccionado.subtotal)} COP
                  </Text>
                </View>

                {pedidoSeleccionado.descuento > 0 && (
                  <View style={styles.resumenLinea}>
                    <Text style={[styles.resumenLabel, styles.textoVerde]}>
                      Descuento cupón ({pedidoSeleccionado.cuponAplicado}):
                    </Text>
                    <Text style={[styles.resumenValor, styles.textoVerde]}>
                      -{formatearCOP(pedidoSeleccionado.descuento)} COP
                    </Text>
                  </View>
                )}

                <View style={styles.resumenLinea}>
                  <Text style={styles.resumenLabel}>Envío registrado:</Text>
                  <Text style={styles.resumenValor}>
                    {pedidoSeleccionado.envio === 0
                      ? 'GRATIS ($0 COP)'
                      : `${formatearCOP(pedidoSeleccionado.envio)} COP`}
                  </Text>
                </View>

                <View style={styles.resumenLineaTotal}>
                  <Text style={styles.resumenTotalLabel}>TOTAL REGISTRADO:</Text>
                  <Text style={styles.resumenTotalValor}>
                    {formatearCOP(pedidoSeleccionado.total)} COP
                  </Text>
                </View>

                <Text style={styles.confirmacionPedidoAviso}>
                  {pedidoSeleccionado.notaSimulacion}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  // VISTA 6: PANEL DE VENDEDOR / INTENDENCIA UNSC (HU18, HU20)
  const renderVistaVendedor = () => {
    return (
      <ScrollView contentContainerStyle={styles.scrollVistaContenedor}>
        <View style={styles.encabezadoSeccionBox}>
          <Text style={styles.encabezadoSeccionTitulo}>
            ⚙️ PANEL DE VENDEDOR · INTENDENCIA UNSC (HU18)
          </Text>
          <Text style={styles.encabezadoSeccionSub}>
            Crea nuevos suministros o selecciona un producto existente abajo para actualizar su información y stock.
          </Text>
        </View>

        {/* Formulario de Creación / Edición (HU18-CA01, CA02, CA03) */}
        <View style={styles.panelSeccionCard}>
          <Text style={styles.panelSeccionTitulo}>
            {editandoId
              ? `✏️ EDITANDO REFERENCIA: ${editandoId}`
              : '➕ REGISTRAR NUEVO PRODUCTO EN EL CATÁLOGO'}
          </Text>

          <Text style={styles.inputLabel}>Nombre del producto *:</Text>
          <TextInput
            style={styles.inputCampo}
            value={vendNombre}
            onChangeText={setVendNombre}
            placeholder="Ej. Armadura Mjolnir Mark V [B] Noble"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.inputLabel}>Categoría oficial *:</Text>
          <View style={styles.categoriasVendedorGrid}>
            {MARCA_INFO.categorias.map((cat) => {
              const activa = vendCategoria === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setVendCategoria(cat)}
                  style={[
                    styles.chipCategoria,
                    activa && styles.chipCategoriaActiva,
                    { marginBottom: 8 },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipCategoriaTexto,
                      activa && styles.chipCategoriaTextoActivo,
                    ]}
                  >
                    {CATEGORIAS_CONFIG[cat]?.icono} {cat}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.resenaInputsRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.inputLabel}>Precio en COP (entero &gt; 0) *:</Text>
              <TextInput
                style={styles.inputCampo}
                value={vendPrecio}
                onChangeText={setVendPrecio}
                keyboardType="numeric"
                placeholder="Ej. 160000"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Stock (entero &gt;= 0) *:</Text>
              <TextInput
                style={styles.inputCampo}
                value={vendStock}
                onChangeText={setVendStock}
                keyboardType="numeric"
                placeholder="Ej. 5"
                placeholderTextColor="#64748B"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>
            Descripción breve (mínimo 15 caracteres) *:
          </Text>
          <TextInput
            style={styles.inputCampo}
            value={vendDescripcion}
            onChangeText={setVendDescripcion}
            placeholder="Descripción táctica detallada del producto..."
            placeholderTextColor="#64748B"
          />

          <Text style={styles.inputLabel}>Insignia / Código táctico (opcional):</Text>
          <TextInput
            style={styles.inputCampo}
            value={vendInsignia}
            onChangeText={setVendInsignia}
            placeholder="Ej. MK-V · NOBLE"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.inputLabel}>
            URL de imagen (opcional · si se deja vacío usa el render oficial de la categoría):
          </Text>
          <TextInput
            style={styles.inputCampo}
            value={vendImagenUrl}
            onChangeText={setVendImagenUrl}
            placeholder="https://halo.wiki.gallery/images/..."
            placeholderTextColor="#64748B"
          />

          <View style={styles.vendedorBotonesRow}>
            <Pressable
              onPress={guardarProductoVendedor}
              style={[styles.btnConfirmarCompra, { flex: 1 }]}
            >
              <Text style={styles.btnConfirmarCompraTexto}>
                {editandoId
                  ? '💾 Actualizar producto existente'
                  : '➕ Registrar nuevo producto'}
              </Text>
            </Pressable>

            {editandoId && (
              <Pressable
                onPress={limpiarFormularioVendedor}
                style={styles.btnCancelarEdicion}
              >
                <Text style={styles.btnCancelarEdicionTexto}>Cancelar</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Lista rápida de inventario para seleccionar y editar sin duplicar (HU18-CA02) */}
        <View style={styles.panelSeccionCard}>
          <Text style={styles.panelSeccionTitulo}>
            📦 INVENTARIO ACTUAL ({productos.length} PRODUCTOS) · PULSA &quot;EDITAR&quot; PARA MODIFICAR
          </Text>

          {productos.map((prod) => (
            <View key={prod.id} style={styles.inventarioItemRow}>
              <View style={styles.miniaturaWrapper}>
                <Image
                  source={obtenerFuenteImagen(prod)}
                  style={styles.miniaturaImagen}
                  resizeMode="contain"
                />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.inventarioItemNombre}>
                  [{prod.id}] {prod.nombre}
                </Text>
                <Text style={styles.inventarioItemMeta}>
                  {prod.categoria} · {formatearCOP(prod.precio)} COP · Stock:{' '}
                  {prod.stock}
                </Text>
              </View>
              <Pressable
                onPress={() => cargarProductoParaEditar(prod)}
                style={styles.btnEditarInventario}
              >
                <Text style={styles.btnEditarInventarioTexto}>✏️ Editar</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Control para reiniciar datos de fábrica durante pruebas / sustentación */}
        <View style={styles.panelSeccionCard}>
          <Text style={styles.panelSeccionTitulo}>
            🔄 CONTROL DE PRUEBAS Y PERSISTENCIA LOCAL (HU20)
          </Text>
          <Text style={styles.panelSeccionAyuda}>
            Los cambios de inventario, favoritos, carrito e historial se guardan automáticamente en el dispositivo. Si deseas reiniciar todas las pruebas a su estado original de fábrica, usa el siguiente botón:
          </Text>
          <Pressable
            onPress={restaurarSimulacionCompleta}
            style={styles.btnRestaurarFabrica}
          >
            <Text style={styles.btnRestaurarFabricaTexto}>
              ⚠️ Restaurar catálogo y estado inicial de fábrica
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  // VISTA 7: FICHA DE MARCA INTEGRADA (HU01: CA01, CA02, CA03)
  const renderVistaMarca = () => {
    return (
      <ScrollView contentContainerStyle={styles.scrollVistaContenedor}>
        <View style={styles.encabezadoSeccionBox}>
          <Text style={styles.encabezadoSeccionTitulo}>
            ⬡ FICHA DE IDENTIDAD DE MARCA (HU01)
          </Text>
          <Text style={styles.encabezadoSeccionSub}>
            Consistencia de identidad comercial, público objetivo, propuesta de valor y categorías.
          </Text>
        </View>

        <View style={styles.panelSeccionCard}>
          <Text style={styles.marcaFichaLabel}>1. NOMBRE COMERCIAL ORIGINAL</Text>
          <Text style={styles.marcaFichaValorGrande}>
            {MARCA_INFO.icono} {MARCA_INFO.nombre} [{MARCA_INFO.codigoMarca}]
          </Text>

          <Text style={styles.marcaFichaLabel}>2. ESLOGAN DE MARCA</Text>
          <Text style={styles.marcaFichaValor}>{MARCA_INFO.eslogan}</Text>

          <Text style={styles.marcaFichaLabel}>3. PÚBLICO OBJETIVO</Text>
          <Text style={styles.marcaFichaValor}>{MARCA_INFO.publicoObjetivo}</Text>

          <Text style={styles.marcaFichaLabel}>
            4. PROPUESTA DE VALOR (MÁXIMO 50 PALABRAS)
          </Text>
          <View style={styles.propuestaValorCaja}>
            <Text style={styles.propuestaValorTexto}>
              &ldquo;{MARCA_INFO.propuestaValor}&rdquo;
            </Text>
          </View>

          <Text style={styles.marcaFichaLabel}>
            5. CUATRO CATEGORÍAS OFICIALES DEL MARKETPLACE
          </Text>
          {MARCA_INFO.categorias.map((cat) => {
            const conf = CATEGORIAS_CONFIG[cat];
            return (
              <View key={cat} style={styles.marcaCategoriaItem}>
                <Text style={styles.marcaCategoriaIcono}>{conf.icono}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.marcaCategoriaTitulo,
                      { color: conf.colorAcento },
                    ]}
                  >
                    {cat} ({conf.codigo})
                  </Text>
                  <Text style={styles.marcaCategoriaDesc}>
                    {conf.descripcion}
                  </Text>
                </View>
              </View>
            );
          })}

          <Text style={styles.marcaFichaLabel}>
            6. PALETA DE COLORES PRINCIPALES
          </Text>
          {MARCA_INFO.coloresPrincipales.map((col) => (
            <View key={col.hex} style={styles.colorMuestraRow}>
              <View
                style={[styles.colorCirculo, { backgroundColor: col.hex }]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.colorNombreTexto}>
                  {col.nombre} ({col.hex})
                </Text>
                <Text style={styles.colorDescTexto}>{col.descripcion}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // ==========================================================================
  // 14. ESTRUCTURA PRINCIPAL DE LA APLICACIÓN
  // ==========================================================================
  const pestanasNavegacion = [
    { id: 'catalogo', label: `Catálogo (${productos.length})`, icono: '🛡️' },
    { id: 'favoritos', label: `Favoritos (${favoritos.length})`, icono: '★' },
    {
      id: 'carrito',
      label: `Carrito (${resumenCarrito.totalUnidades})`,
      icono: '🛒',
    },
    {
      id: 'historial',
      label: `Historial (${historialPedidos.length})`,
      icono: '📜',
    },
    { id: 'vendedor', label: 'Vendedor', icono: '⚙️' },
    { id: 'marca', label: 'Marca', icono: '⬡' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* CABECERA DE IDENTIDAD DE MARCA (HU01-CA01, CA02) */}
      <View style={styles.headerMarca}>
        <View style={styles.headerTopRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIconoTexto}>{MARCA_INFO.icono}</Text>
            <Text style={styles.logoCodigoTexto}>{MARCA_INFO.codigoMarca}</Text>
          </View>
          <View style={styles.headerTextosBox}>
            <Text style={styles.headerNombreMarca}>{MARCA_INFO.nombre}</Text>
            <Text style={styles.headerEslogan} numberOfLines={2}>
              {MARCA_INFO.eslogan}
            </Text>
          </View>
        </View>

        {/* BARRA DE NAVEGACIÓN PRINCIPAL (HU02-CA01, CA02) */}
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

      {/* BANNER DE RETROALIMENTACIÓN TÁCTICA Y VALIDACIONES (HU16-CA01, CA02) */}
      {retroalimentacion.visible && (
        <View
          style={[
            styles.toastBanner,
            retroalimentacion.tipo === 'exito' && styles.toastExito,
            retroalimentacion.tipo === 'error' && styles.toastError,
            retroalimentacion.tipo === 'alerta' && styles.toastAlerta,
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.toastTitulo}>{retroalimentacion.titulo}</Text>
            <Text style={styles.toastMensaje}>{retroalimentacion.mensaje}</Text>
          </View>
          <Pressable
            onPress={() =>
              setRetroalimentacion((prev) => ({ ...prev, visible: false }))
            }
            style={styles.toastCerrarBtn}
          >
            <Text style={styles.toastCerrarTexto}>✕</Text>
          </Pressable>
        </View>
      )}

      {/* CONTENIDO DINÁMICO SEGÚN LA SECCIÓN ACTIVA */}
      <View style={styles.contenidoPrincipal}>
        {vistaActual === 'catalogo' && renderVistaCatalogo()}
        {vistaActual === 'detalle' && renderVistaDetalle()}
        {vistaActual === 'favoritos' && renderVistaFavoritos()}
        {vistaActual === 'carrito' && renderVistaCarrito()}
        {vistaActual === 'historial' && renderVistaHistorial()}
        {vistaActual === 'vendedor' && renderVistaVendedor()}
        {vistaActual === 'marca' && renderVistaMarca()}
      </View>
    </SafeAreaView>
  );
}

// ============================================================================
// ESTILOS TÁCTICOS HALO / UNSC MJOLNIR HUD (StyleSheet)
// ============================================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0F14',
    paddingTop: Platform.OS === 'android' ? 28 : 0,
  },
  headerMarca: {
    backgroundColor: '#0E1722',
    borderBottomWidth: 2,
    borderBottomColor: '#4ADE80',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: '#132A1F',
    borderWidth: 2,
    borderColor: '#4ADE80',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoIconoTexto: {
    color: '#F59E0B',
    fontSize: 20,
    fontWeight: '900',
  },
  logoCodigoTexto: {
    color: '#4ADE80',
    fontSize: 10,
    fontWeight: '800',
  },
  headerTextosBox: {
    flex: 1,
  },
  headerNombreMarca: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  headerEslogan: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
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
    backgroundColor: '#162231',
    borderWidth: 1,
    borderColor: '#26384E',
    marginRight: 8,
  },
  navTabActiva: {
    backgroundColor: '#163A28',
    borderColor: '#4ADE80',
  },
  navTabTexto: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  navTabTextoActivo: {
    color: '#4ADE80',
  },

  // Banner de Retroalimentación (HU16)
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#112233',
    borderLeftWidth: 5,
    borderLeftColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
  },
  toastExito: {
    backgroundColor: '#0F291E',
    borderLeftColor: '#4ADE80',
  },
  toastError: {
    backgroundColor: '#2D1418',
    borderLeftColor: '#F87171',
  },
  toastAlerta: {
    backgroundColor: '#2B2110',
    borderLeftColor: '#F59E0B',
  },
  toastTitulo: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  toastMensaje: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 2,
  },
  toastCerrarBtn: {
    padding: 6,
    marginLeft: 8,
  },
  toastCerrarTexto: {
    color: '#94A3B8',
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

  // Panel de filtros y búsqueda en Catálogo
  panelFiltrosContainer: {
    backgroundColor: '#111A24',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E2D3D',
    marginBottom: 14,
  },
  seccionSubtitulo: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
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
    backgroundColor: '#0A1017',
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#2A3F54',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  btnLimpiarBusqueda: {
    marginLeft: 8,
    backgroundColor: '#263545',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 8,
  },
  btnLimpiarBusquedaTexto: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  chipsScroll: {
    marginBottom: 8,
  },
  chipCategoria: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#172331',
    borderWidth: 1,
    borderColor: '#2A3C52',
    marginRight: 8,
  },
  chipCategoriaActiva: {
    backgroundColor: '#153826',
    borderColor: '#4ADE80',
  },
  chipCategoriaTexto: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  chipCategoriaTextoActivo: {
    color: '#4ADE80',
  },
  ordenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  btnOrden: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#172331',
    borderWidth: 1,
    borderColor: '#2A3C52',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  btnOrdenActivo: {
    backgroundColor: '#2A2110',
    borderColor: '#F59E0B',
  },
  btnOrdenTexto: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  btnOrdenTextoActivo: {
    color: '#F59E0B',
  },
  barraEstadoCatalogo: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#1E2D3D',
  },
  barraEstadoCatalogoTexto: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },

  // Tarjeta de Producto con Imagen Oficial Halo (HU03)
  cardProducto: {
    backgroundColor: '#111A24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#223447',
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardProductoAgotado: {
    borderColor: '#522227',
    opacity: 0.92,
  },
  cardVisualHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2E3E',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeCodigo: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(10, 15, 20, 0.75)',
  },
  badgeCodigoTexto: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnFavoritoIcono: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(15, 23, 34, 0.85)',
    borderWidth: 1,
    borderColor: '#475569',
  },
  btnFavoritoIconoActivo: {
    backgroundColor: '#3B2A0E',
    borderColor: '#F59E0B',
  },
  btnFavoritoTexto: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  cardImagenWrapper: {
    width: '100%',
    height: 175,
    backgroundColor: 'rgba(7, 11, 16, 0.55)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardEstrellasTexto: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '800',
  },
  cardBody: {
    padding: 12,
  },
  cardNombre: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardDescripcionBreve: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  cardPrecioStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardPrecioLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  cardPrecioValor: {
    color: '#4ADE80',
    fontSize: 18,
    fontWeight: '900',
  },
  badgeStock: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeStockDisponible: {
    backgroundColor: '#0F291E',
    borderColor: '#22C55E',
  },
  badgeStockAgotado: {
    backgroundColor: '#2D1418',
    borderColor: '#EF4444',
  },
  badgeStockTexto: {
    fontSize: 11,
    fontWeight: '800',
  },
  badgeStockTextoDisponible: {
    color: '#4ADE80',
  },
  badgeStockTextoAgotado: {
    color: '#F87171',
  },
  indicadorEnCarrito: {
    backgroundColor: '#12263A',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  indicadorEnCarritoTexto: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnSecundarioCard: {
    flex: 1,
    backgroundColor: '#1A2736',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  btnSecundarioCardTexto: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  btnPrimarioCard: {
    flex: 1,
    backgroundColor: '#166534',
    borderWidth: 1,
    borderColor: '#4ADE80',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPrimarioCardAgotado: {
    backgroundColor: '#2B191C',
    borderColor: '#7F1D1D',
  },
  btnPrimarioCardTexto: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  btnPrimarioCardTextoAgotado: {
    color: '#F87171',
  },

  // Miniaturas para Carrito, Historial y Vendedor
  miniaturaWrapper: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: '#0A0F14',
    borderWidth: 1,
    borderColor: '#26384E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    padding: 4,
  },
  miniaturaImagen: {
    width: '100%',
    height: '100%',
  },

  // Estados vacíos
  estadoVacioBox: {
    backgroundColor: '#111A24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#243547',
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  estadoVacioIcono: {
    fontSize: 42,
    marginBottom: 8,
  },
  estadoVacioTitulo: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  estadoVacioSubtitulo: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  btnAccionVacio: {
    backgroundColor: '#166534',
    borderWidth: 1,
    borderColor: '#4ADE80',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
  },
  btnAccionVacioTexto: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },

  // Detalle del Producto (HU07)
  detalleTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnVolver: {
    backgroundColor: '#1A2736',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnVolverTexto: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
  },
  btnFavoritoDetalle: {
    backgroundColor: '#1A2736',
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detalleCard: {
    backgroundColor: '#111A24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#26394D',
    overflow: 'hidden',
    marginBottom: 16,
  },
  detalleHeroBanner: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#223447',
  },
  detalleImagenWrapper: {
    width: '100%',
    height: 230,
    backgroundColor: 'rgba(7, 11, 16, 0.65)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  detalleCategoriaTexto: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  detalleContenido: {
    padding: 16,
  },
  detalleTitulo: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  detalleMetricasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  detalleMetricaCaja: {
    flex: 1,
    backgroundColor: '#0B1118',
    borderWidth: 1,
    borderColor: '#1F2F40',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 3,
  },
  detalleMetricaLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 2,
  },
  detallePrecioValor: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: '900',
  },
  detalleStockValor: {
    fontSize: 13,
    fontWeight: '800',
  },
  detalleEstrellasValor: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '800',
  },
  detalleSeccionLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  detalleDescripcionTexto: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  detalleSpecsBox: {
    backgroundColor: '#0A1017',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
  },
  detalleSpecsTitulo: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 3,
  },
  detalleSpecsTexto: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  btnAgregarGrande: {
    backgroundColor: '#166534',
    borderWidth: 1,
    borderColor: '#4ADE80',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnAgregarGrandeTexto: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '900',
  },

  // Panel de Reseñas (HU19)
  resenasPanel: {
    backgroundColor: '#111A24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#243547',
    padding: 14,
  },
  resenasTitulo: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '900',
  },
  resenasPromedioSub: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 10,
  },
  estrellasBotonesRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  btnEstrellaOpcion: {
    flex: 1,
    backgroundColor: '#172331',
    borderWidth: 1,
    borderColor: '#2E4057',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },
  btnEstrellaOpcionActiva: {
    backgroundColor: '#3B2A0E',
    borderColor: '#F59E0B',
  },
  btnEstrellaOpcionTexto: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  btnEstrellaOpcionTextoActivo: {
    color: '#F59E0B',
  },
  resenaInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnGuardarResena: {
    backgroundColor: '#1E3A5F',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  btnGuardarResenaTexto: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  listaResenasBox: {
    marginTop: 4,
  },
  resenaItemCard: {
    backgroundColor: '#0B1118',
    borderWidth: 1,
    borderColor: '#1E2D3D',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  resenaItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resenaItemAutor: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '800',
  },
  resenaItemEstrellas: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '800',
  },
  resenaItemComentario: {
    color: '#CBD5E1',
    fontSize: 12,
  },

  // Encabezados de sección y paneles
  encabezadoSeccionBox: {
    backgroundColor: '#111A24',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4ADE80',
    padding: 12,
    marginBottom: 12,
  },
  encabezadoSeccionTitulo: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '900',
  },
  encabezadoSeccionSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  panelSeccionCard: {
    backgroundColor: '#111A24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#223447',
    padding: 14,
    marginBottom: 14,
  },
  panelSeccionTitulo: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 4,
  },
  panelSeccionAyuda: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },

  // Carrito de compras (HU09, HU10, HU11)
  listaCarritoBox: {
    marginBottom: 14,
  },
  listaCarritoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  linkVaciarCarrito: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
  },
  carritoItemCard: {
    backgroundColor: '#111A24',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#243649',
    padding: 12,
    marginBottom: 10,
  },
  carritoItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  carritoItemNombre: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  carritoItemMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  carritoItemControlesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1E2D3D',
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
    backgroundColor: '#1B2A3B',
    borderWidth: 1,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCantidadTexto: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '900',
  },
  cantidadValorBox: {
    paddingHorizontal: 12,
  },
  cantidadValorTexto: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '900',
  },
  subtotalLineaBox: {
    alignItems: 'flex-end',
  },
  subtotalLineaLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  subtotalLineaValor: {
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '800',
  },
  btnEliminarItem: {
    backgroundColor: '#2D1418',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnEliminarItemTexto: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '800',
  },

  // Cupón y Resumen
  cuponRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnAplicarCupon: {
    backgroundColor: '#1E3A5F',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnAplicarCuponTexto: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  cuponActivoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F291E',
    borderWidth: 1,
    borderColor: '#4ADE80',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  cuponActivoTexto: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '700',
  },
  linkQuitarCupon: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '800',
  },
  resumenLinea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  resumenLabel: {
    color: '#CBD5E1',
    fontSize: 13,
  },
  resumenValor: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  resumenSeparador: {
    height: 1,
    backgroundColor: '#223447',
    marginVertical: 8,
  },
  resumenLineaTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  resumenTotalLabel: {
    color: '#F59E0B',
    fontSize: 15,
    fontWeight: '900',
  },
  resumenTotalValor: {
    color: '#4ADE80',
    fontSize: 19,
    fontWeight: '900',
  },

  // Formulario Comprador y Checkout (HU12, HU13)
  avisoSimulacionBox: {
    backgroundColor: '#102231',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  avisoSimulacionTexto: {
    color: '#BAE6FD',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  inputCampo: {
    backgroundColor: '#0A1017',
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#2A3F54',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    marginBottom: 10,
  },
  municipiosChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  chipMunicipio: {
    backgroundColor: '#172331',
    borderWidth: 1,
    borderColor: '#2E4057',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
    marginBottom: 6,
  },
  chipMunicipioActivo: {
    backgroundColor: '#153826',
    borderColor: '#4ADE80',
  },
  chipMunicipioTexto: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  chipMunicipioTextoActivo: {
    color: '#4ADE80',
  },
  btnValidarPrevia: {
    backgroundColor: '#1B2D42',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnValidarPreviaTexto: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  preConfirmacionResumenBox: {
    backgroundColor: '#0F291E',
    borderWidth: 1,
    borderColor: '#4ADE80',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  preConfirmacionTitulo: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  preConfirmacionTexto: {
    color: '#E2E8F0',
    fontSize: 12,
    marginBottom: 2,
  },
  btnConfirmarCompra: {
    backgroundColor: '#166534',
    borderWidth: 1,
    borderColor: '#4ADE80',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnConfirmarCompraTexto: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '900',
  },
  confirmacionPedidoBox: {
    backgroundColor: '#0F291E',
    borderWidth: 2,
    borderColor: '#4ADE80',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  confirmacionPedidoTag: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '900',
  },
  confirmacionPedidoCodigo: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    marginVertical: 4,
  },
  confirmacionPedidoDetalle: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  confirmacionPedidoTotal: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '900',
    marginVertical: 4,
  },
  confirmacionPedidoAviso: {
    color: '#94A3B8',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 6,
  },
  btnIrHistorialConfirm: {
    marginTop: 10,
    backgroundColor: '#163A28',
    borderWidth: 1,
    borderColor: '#4ADE80',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnIrHistorialConfirmTexto: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '800',
  },

  // Historial de pedidos (HU15)
  pedidoListaCard: {
    backgroundColor: '#111A24',
    borderWidth: 1,
    borderColor: '#243547',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  pedidoListaCardActivo: {
    borderColor: '#4ADE80',
    backgroundColor: '#122620',
  },
  pedidoListaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pedidoCodigoTexto: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
  },
  pedidoTotalBadge: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: '900',
  },
  pedidoFechaTexto: {
    color: '#94A3B8',
    fontSize: 12,
  },
  pedidoCompradorTexto: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 2,
  },
  pedidoDetallePanel: {
    backgroundColor: '#111A24',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  pedidoDetalleTitulo: {
    color: '#38BDF8',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 6,
  },
  pedidoDetalleMeta: {
    color: '#CBD5E1',
    fontSize: 12,
    marginBottom: 2,
  },
  pedidoArticuloRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1B2A3A',
  },
  pedidoArticuloNombre: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  pedidoArticuloDetalle: {
    color: '#94A3B8',
    fontSize: 11,
  },
  pedidoArticuloSubtotal: {
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '800',
  },

  // Panel de Vendedor (HU18)
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
    backgroundColor: '#2D1418',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 8,
  },
  btnCancelarEdicionTexto: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '800',
  },
  inventarioItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2D3D',
  },
  inventarioItemNombre: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  inventarioItemMeta: {
    color: '#94A3B8',
    fontSize: 11,
  },
  btnEditarInventario: {
    backgroundColor: '#1B2D42',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnEditarInventarioTexto: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  btnRestaurarFabrica: {
    backgroundColor: '#2B2110',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnRestaurarFabricaTexto: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
  },

  // Ficha de Marca (HU01)
  marcaFichaLabel: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 4,
  },
  marcaFichaValorGrande: {
    color: '#4ADE80',
    fontSize: 20,
    fontWeight: '900',
  },
  marcaFichaValor: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 19,
  },
  propuestaValorCaja: {
    backgroundColor: '#0F291E',
    borderLeftWidth: 4,
    borderLeftColor: '#4ADE80',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  propuestaValorTexto: {
    color: '#F8FAFC',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  marcaCategoriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1118',
    borderWidth: 1,
    borderColor: '#1E2D3D',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  marcaCategoriaIcono: {
    fontSize: 24,
    marginRight: 10,
  },
  marcaCategoriaTitulo: {
    fontSize: 13,
    fontWeight: '800',
  },
  marcaCategoriaDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  colorMuestraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  colorCirculo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  colorNombreTexto: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  colorDescTexto: {
    color: '#94A3B8',
    fontSize: 11,
  },

  // Utilidades de texto
  textoVerde: {
    color: '#4ADE80',
  },
  textoVerdeBold: {
    color: '#4ADE80',
    fontWeight: '800',
  },
  textoRojo: {
    color: '#F87171',
  },
});
