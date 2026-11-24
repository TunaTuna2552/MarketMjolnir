# ⚡ MarketMjolnir (`MM⚡`)
> *"Forjando las mejores compras locales en la Sabana"*

Aplicación móvil interactiva desarrollada en **React Native con Expo (plantilla `blank`)** para el **Reto Integrador · Desarrollo Móvil**. Conecta a los compradores de **Mosquera, Madrid y Funza** con emprendimientos locales en cuatro categorías (**Tecnología, Deporte, Hogar y Mascotas**).

---

## 📁 Estructura del Proyecto y Entregables

```text
Taller_Marketplace/
├── 01_FICHA_DE_MARCA.md                 # Entregable 01: Ficha de marca, propuesta de valor y 12 productos
├── 02_BOCETOS_VISTAS.md                 # Entregable 02: Bocetos (Inicio/Catálogo, Detalle, Carrito y extras)
├── 05_BANCO_DE_PRUEBAS_FUNCIONALES.md   # Entregable 05: Matriz de 63 casos de prueba (HU01 a HU20)
└── MarketMjolnir/                       # Entregable 04: Proyecto funcional en React Native + Expo
    ├── App.js                           # Interfaz principal, estados (useState), reglas de negocio y vistas
    ├── src/
    │   ├── data/
    │   │   └── productosIniciales.js    # Identidad de marca, categorías y catálogo inicial de 12 productos
    │   └── utils/
    │       └── persistencia.js          # Formateador COP, promedio de reseñas y persistencia local segura (HU20)
    └── entregables/                     # Copia de los documentos de entregables dentro del repositorio Git
```

---

## 🚀 Cómo Ejecutar la Aplicación

1. Abre una terminal en la carpeta del proyecto:
   ```bash
   cd MarketMjolnir
   ```
2. Inicia el servidor de desarrollo de Expo:
   ```bash
   npx expo start
   ```
3. Para abrir en **Web** presiona `w`, o escanea el código QR desde la aplicación **Expo Go** en tu dispositivo móvil.

---

## ✅ Historias de Usuario Implementadas (`HU01` a `HU20`)

- **HU01 · Identidad y nombre del marketplace:** Sello `MM⚡`, nombre **MarketMjolnir**, eslogan visible, paleta Azul Trueno (`#1E3A8A`) + Ámbar Eléctrico (`#F59E0B`) y botón `ℹ️ Marca` con la ficha integrada.
- **HU02 · Pantalla de inicio y navegación:** Barra superior con accesos directos a `Catálogo`, `Favoritos`, `Carrito`, `Historial` y `Vendedor`, más botón `← Volver` en el detalle que conserva el carrito.
- **HU03 · Catálogo inicial de productos:** 12 productos distribuidos en 4 categorías (`Tecnología`, `Deporte`, `Hogar`, `Mascotas`) renderizados con `FlatList`.
- **HU04 · Buscar por palabra clave:** Búsqueda insensible a mayúsculas/minúsculas con aviso `"No encontramos productos"` cuando no hay coincidencias.
- **HU05 · Filtrar por categorías:** Chips interactivos (`Todas`, `Tecnología`, `Deporte`, `Hogar`, `Mascotas`) combinables en tiempo real con el buscador.
- **HU06 · Ordenar por precio:** Ordenamiento ascendente (`Menor a mayor ↑`) y descendente (`Mayor a menor ↓`) sobre una copia inmutable del conjunto filtrado.
- **HU07 · Detalle del producto:** Vista completa con descripción, precio en COP, categoría, stock disponible o bloqueo por estado `AGOTADO (Stock: 0)`.
- **HU08 · Lista de favoritos:** Marcado/desmarcado con corazón (`❤️` / `🤍`) y vista dedicada con estado vacío.
- **HU09 · Agregar al carrito:** Creación e incremento de líneas validando existencias y bloqueando productos agotados o que alcancen el tope de stock.
- **HU10 · Cambiar cantidades y eliminar:** Botones `+`, `−` y `🗑️ Eliminar` con recálculo inmediato y protección contra cantidades menores a 1.
- **HU11 · Resumen de compra y envío:** Subtotal calculado con `.reduce()`, envío simulado de `$8.000 COP` cuando el subtotal es `< $150.000 COP`, envío **GRATIS (`$0 COP`)** cuando es `>= $150.000 COP`, y `$0 COP` cuando el carrito está vacío.
- **HU12 · Datos básicos del comprador:** Formulario con `Nombre`, `Teléfono`, `Municipio` (`Mosquera`, `Madrid`, `Funza`) y `Dirección`, validación de campos vacíos/espacios, vista previa del resumen y aviso de no solicitar datos sensibles.
- **HU13 · Confirmar la compra simulada:** Generación de código único (`PED-MM-...`), validación atómica de inventario, vaciado del carrito y aviso de simulación académica sin cobro real.
- **HU14 · Descontar existencias:** Descuento inmutable del stock en el catálogo únicamente al confirmar el pedido (p. ej. comprar 3 unidades de `PROD-001` con stock 10 deja el stock en 7).
- **HU15 · Historial y detalle de pedidos:** Registro inmutable de cada pedido confirmado con fecha/hora, comprador, desglose de artículos y totales.
- **HU16 · Retroalimentación y estados de la interfaz:** Banner dinámico de confirmaciones/errores y pantallas de estado vacío con botones útiles.
- **HU17 · Cupón promocional:** Código `BIENVENIDO10` que aplica un 10 % de descuento sobre el subtotal y se recalcula automáticamente al modificar el carrito.
- **HU18 · Panel de vendedor:** Creación de productos con ID único automático (`PROD-013`...) y edición sin duplicar referencias, validando precios enteros positivos y stock no negativo.
- **HU19 · Reseñas ficticias:** Calificación entera de 1 a 5 estrellas por producto y cálculo de promedio con `.reduce()`.
- **HU20 · Persistencia local:** Guardado y restauración automática con sanitización contra datos corruptos o inventarios negativos (incluye panel interactivo `💾 HU20` en el encabezado para demostración en sustentación).
