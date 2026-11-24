# Reflexión Técnica · Market Mjolnir 2.0 (Taller 5)

**Aprendiz:** *(Tu nombre completo)*  
**Aplicación:** Market Mjolnir (`MM-117`) · Rama `marketplace-v2`  
**Alcance:** Ampliación de Marketplace v1.0 (Taller 4) a v2.0 con HU21–HU35 en React Native + Expo.

---

## 1. Dos decisiones de diseño clave

### A. Fuente única de verdad para el inventario por variante y clave compuesta en carrito
En lugar de mantener un campo `stock` independiente del arreglo `variantes`, se diseñó la función pura `sincronizarStockDesdeVariantes` en `src/utils/reglasV2.js` para que cada mutación de inventario (compra confirmada, cancelación controlada, reposición simulada y edición en panel de vendedor) actualice únicamente el arreglo `variantes` y derive `producto.stock` sumando las existencias de sus variantes. En paralelo, el carrito dejó de usar solo `producto.id` como identificador de línea y adoptó una clave compuesta (`claveCarrito = "${productoId}::${varianteId}"`), permitiendo que un comprador agregue simultáneamente dos tallas o ediciones distintas del mismo producto con precios y límites de stock independientes.

### B. Separación de reglas puras de negocio y modularización por flujo
El proyecto del Taller 4 concentraba la lógica dentro de `App.js`. Para escalar hacia las 15 nuevas historias sin romper los flujos existentes ni dificultar las pruebas, se extrajo toda la lógica de dominio (validaciones de filtros, cálculo de envío por municipio/modalidad, máquina de estados, reintegro idempotente, deduplicación de notificaciones y recomendaciones) a `src/utils/reglasV2.js`, junto con constantes libres de importaciones binarias en `src/data/constantesV2.js` y cuatro componentes especializados en `src/components/` (`PanelComparador`, `VistaDirecciones`, `VistaNotificaciones` y `VistaSoporte`). Esto permitió ejecutar pruebas unitarias directas en Node.js (`scripts/verificarReglasV2.mjs`) sin depender del empaquetador Metro.

---

## 2. Dos dificultades resueltas durante el desarrollo

### A. Prevención de doble reintegro de inventario y saltos ilegales de estado
Una cancelación repetida o fuera de ventana podía sumar unidades ficticias al inventario o revertir pedidos ya despachados. Se resolvió combinando una máquina de estados estricta (`Confirmado → Preparando → En camino → Entregado`, con `Cancelado` como estado terminal independiente) y una bandera inmutable `stockRestituido` dentro de cada pedido. Así, `cancelarPedidoControlado` verifica primero que el estado sea `Confirmado` o `Preparando`, exige confirmación explícita en pantalla (compatible con Web y móvil sin depender de `Alert.alert`) y marca `stockRestituido: true` tras restituir el stock por variante una única vez.

### B. Evitar duplicación del costo de envío y pérdida de compatibilidad con la persistencia v1
Si el usuario cambia repetidamente de dirección (Mosquera, Funza, Madrid) o alterna entre envío estándar y exprés antes de confirmar, sumar el costo de envío sobre un acumulador mutaría el total erróneamente. Se resolvió calculando `calcularEnvioV2(direccionActiva, modalidadEnvio)` de forma declarativa en cada render dentro de `calcularResumenCarritoV2`. Adicionalmente, para no corromper datos previos almacenados en `AsyncStorage`, se actualizó la clave a `@market_mjolnir_unsc_state_v2` y se añadió `normalizarProductosV2` en `src/utils/formatters.js`, garantizando que todos los productos heredados tengan `marca` y `variantes` válidas al hidratar.

---

## 3. Mejora pendiente para una futura versión

Integrar un backend REST/GraphQL con autenticación por roles y base de datos transaccional que reemplace la simulación en memoria: las reservas de stock por variante deberán validarse atómicamente en servidor al confirmar la orden, el historial de estados y las notificaciones pasarán a generarse desde eventos reales del operador logístico (WebSockets o push notifications reales con Expo Notifications) y el cálculo de cobertura de municipios podrá consultar tarifas dinámicas sin depender de constantes locales.
