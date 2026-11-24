# Market Mjolnir 2.0 (`MM-117`)

**Una experiencia de compra inteligente · Taller 5 (Marketplace 2.0)**  
Prototipo móvil de comercio electrónico en **React Native + Expo**, evolución directa del proyecto del Taller 4 conservando la marca original **Market Mjolnir** (temática Halo / UNSC), su diseño e identidad visual y todas sus funcionalidades previas.

> **Aviso de simulación académica:** Toda la operación (pagos, envíos por municipio, avances de entrega, reposición de inventario, preguntas respondidas y tickets de soporte) se ejecuta localmente en memoria (`useState` + `AsyncStorage`). No realiza cobros reales, no envía notificaciones push reales ni solicita contraseñas o tarjetas reales.

---

## Requisitos e instalación

1. Tener instalado **Node.js** (v18 o superior) y **npm**.
2. Instalar dependencias dentro de `MarketMjolnir`:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo Expo:
   ```bash
   npx expo start
   ```
   - Presiona **`w`** para abrir en navegador web, o escanea el código QR con **Expo Go** compatible.
   - No ejecutar `create-expo-app` sobre este proyecto existente.

---

## Pruebas automatizadas de reglas de negocio

Para verificar las reglas de negocio de HU21 a HU35 (variantes, stock único, filtros, envío, transiciones de estado, cancelación lógica con reintegro único, notificaciones sin duplicados, reposición, recomendaciones y soporte):

```bash
node scripts/verificarReglasV2.mjs
```

---

## Funcionalidades implementadas

### Heredadas y conservadas del Taller 4
- **Identidad de marca (`HU01`)** y navegación completa (`HU02`).
- **Catálogo con imágenes locales oficiales (`HU03`)**, búsqueda (`HU04`), categorías (`HU05`) y ordenamiento por precio (`HU06`).
- **Detalle (`HU07`)**, **Favoritos (`HU08`)**, **Carrito y cantidades (`HU09`–`HU11`)**, **Checkout y confirmación (`HU12`–`HU13`)**.
- **Descuento de inventario (`HU14`)**, **Historial inmutable (`HU15`)**, **Retroalimentación (`HU16`)**.
- **Cupón `BIENVENIDO10` (`HU17`)**, **Panel de vendedor (`HU18`)**, **Reseñas (`HU19`)** y **Persistencia local (`HU20`)**.

### Nuevas en Taller 5 (Obligatorias HU21–HU32)
- **HU21 · Variantes de productos:** 5 productos con múltiples variantes (`talla/color/edición`), precio y stock específicos por variante, validación obligatoria de selección y fuente única de stock (`stock = suma(variantes)`).
- **HU22 · Comparador de productos:** selección de 2 a 3 artículos lado a lado en columnas (`PanelComparador.js`), bloqueo al 4.º y retiro sin alterar carrito ni favoritos.
- **HU23 · Filtros combinados:** marca, rango de precio (`mínimo ≤ máximo` validado) y disponibilidad en simultáneo con búsqueda y categoría, más botón **Restablecer**.
- **HU24 · Preguntas frecuentes:** envío de consultas (mín. 10 caracteres, estado `Pendiente`) y simulación de respuesta claramente etiquetada.
- **HU25 · Libreta de direcciones:** alta y edición sin duplicados de direcciones ficticias (`VistaDirecciones.js`), marca única de dirección principal y validación obligatoria en checkout.
- **HU26 · Estimador de envío por municipio:** cálculo sin duplicación para Mosquera (`$6.000` / `$10.000`), Funza (`$8.000` / `$12.000`) y Madrid (`$10.000` / `$14.000`), con plazos estimados y aviso de ajuste manual para otros municipios.
- **HU27 · Seguimiento de pedidos:** historial cronológico de estados y botón **"Simular avance de entrega"** (`Confirmado → Preparando → En camino → Entregado`) bloqueado en estados finales.
- **HU28 · Cancelación y reintegro único:** cancelación lógica confirmada en `Confirmado` / `Preparando`, bloqueada en `En camino` / `Entregado` / `Cancelado`, restituyendo exactamente las unidades de cada variante una sola vez.
- **HU29 · Centro de notificaciones interno:** avisos locales dentro de la app (`VistaNotificaciones.js`) con lectura, estado vacío y deduplicación por `claveEvento`.
- **HU30 · Avisos de reposición:** suscripción única *"Avisarme cuando haya stock"* en variantes agotadas, cancelación de suscripción y botón de demostración *"Simular reposición"*.
- **HU31 · Recomendaciones relacionadas:** hasta 4 sugerencias de la misma categoría con stock disponible y navegación directa a su detalle.
- **HU32 · Centro de ayuda y soporte:** creación de casos ligados a un pedido (`Entrega`, `Producto`, `Otro`, descripción ≥15 caracteres) y control **"Simular respuesta"** (`VistaSoporte.js`).

### Retos opcionales implementados (HU33–HU35)
- **HU33 · Tema oscuro/claro y accesibilidad:** selector en cabecera (`☀️ Claro` / `🌙 Oscuro`) y aumento de tamaño de fuente (`A / A+`) con ajuste flexible sin recorte de etiquetas.
- **HU34 · Solicitud de devolución simulada:** habilitada exclusivamente en pedidos con estado `Entregado`.
- **HU35 · Compartir producto:** comparte resumen con nombre, marca, variante y precio mediante `Share` nativo y vista previa en pantalla sin prometer enlaces públicos reales.

---

## Estructura principal

```text
MarketMjolnir/
├── App.js
├── src/
│   ├── components/
│   │   ├── PanelComparador.js
│   │   ├── VistaDirecciones.js
│   │   ├── VistaNotificaciones.js
│   │   └── VistaSoporte.js
│   ├── data/
│   │   ├── catalogoHalo.js
│   │   └── constantesV2.js
│   └── utils/
│       ├── formatters.js
│       └── reglasV2.js
├── scripts/
│   └── verificarReglasV2.mjs
└── entregables/
    ├── 01_MATRIZ_TRAZABILIDAD_V2.md
    ├── 02_REFLEXION_TECNICA_V2.md
    └── 03_GUION_VIDEO_Y_SUSTENTACION.md
```
