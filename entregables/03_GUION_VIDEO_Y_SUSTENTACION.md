# Guion de Video (máx. 5 minutos) y Preguntas de Sustentación Individual

---

## Parte 1 · Guion del Video de Demostración (4:30 min aprox.)

> **Consejo:** Abre la app en navegador (`npx expo start` → tecla `w`) o en Expo Go con la consola visible, y ten a mano este orden exacto para cubrir **compra, seguimiento, cancelación, avisos y soporte** más los extras en menos de 5 minutos.

### 0:00 – 0:45 · Presentación, marca y catálogo 2.0 (HU21, HU22, HU23, HU33)
1. Muestra el encabezado con la marca propia **Market Mjolnir 2.0** y cambia brevemente el tema (`☀️ Claro` / `🌙 Oscuro`) y tamaño de letra (`A+`) para mostrar accesibilidad (**HU33**).
2. En **Catálogo**, muestra la búsqueda combinada con **Marca**, **Rango de precio** (prueba rápidamente un mínimo mayor al máximo para ver el bloqueo sin aplicar **HU23-CA02**) y presiona **Restablecer**.
3. Marca 2 productos con **⚖️ Comp.** y abre la pestaña **Comparar** (**HU22**) mostrando nombre, marca, precio y stock lado a lado; retira uno y vuelve al catálogo.

### 0:45 – 2:00 · Detalle con variantes, preguntas, recomendaciones, compartir y compra (HU21, HU24, HU25, HU26, HU31, HU35)
1. Abre la **Armadura Mjolnir Mark VI Gen-3** (`PROD-001`).
2. Intenta agregar sin elegir variante → muestra la alerta que pide elegir variante sin tocar el carrito (**HU21-CA02**).
3. Selecciona **Talla M · Verde Spartan**, luego **Talla L · Dorado Visor** (se ve cómo cambian precio y stock), agrega 1 unidad (**HU21-CA01/CA03**).
4. En el mismo detalle, muestra brevemente:
   - **Preguntas** (**HU24**): envía una pregunta de ≥10 caracteres y presiona **🧪 Simular respuesta**.
   - **Compartir** (**HU35**): pulsa **📤 Compartir** y muestra el texto con nombre y precio sin URL pública falsa.
   - **Productos relacionados** (**HU31**): muestra que sugiere artículos de la misma categoría con stock (sin el agotado `PROD-004`).
5. Ve a **Direcciones** (**HU25**): muestra las direcciones ficticias, cambia la principal y vuelve al **Carrito**.
6. En **Carrito**, alterna entre **Mosquera Estándar (\$6.000)** y **Funza Exprés (\$12.000)** para demostrar el recálculo del envío sin duplicar cargos (**HU26**), valida datos y pulsa **Confirmar compra simulada**.

### 2:00 – 3:15 · Seguimiento de pedidos, cancelación con reintegro y devolución (HU27, HU28, HU34)
1. Entra a **Pedidos**. Selecciona el pedido recién confirmado (o `UNSC-2552-DEMO-01`).
2. Pulsa **Simular avance de entrega** una vez: pasa de `Confirmado` a `Preparando` y registra el evento en la línea de tiempo (**HU27**).
3. Pulsa **Cancelar pedido** y confirma: el pedido pasa a `Cancelado` (no se borra), y al volver al producto verás que se restituyó exactamente la unidad de esa variante (**HU28**).
4. Selecciona `UNSC-2552-DEMO-02` (`En camino`) e intenta cancelarlo → muestra que el sistema lo impide e informa la razón.
5. Selecciona `UNSC-2552-DEMO-03` (`Entregado`) → muestra que el avance de entrega está bloqueado y solicita una devolución simulada (**HU34**).

### 3:15 – 4:30 · Centro de notificaciones, avisos de reposición y soporte (HU29, HU30, HU32)
1. Entra a **Avisos** (**HU29**): muestra las notificaciones generadas por la compra, el avance y la cancelación; toca una para marcarla como leída.
2. Ve al catálogo, abre `PROD-004` (`Prototipo Mark IV`, stock 0), pulsa **🔔 Avisarme cuando haya stock** (**HU30**) y luego **🧪 Simular reposición (+5 uds.)**. Vuelve a **Avisos** para mostrar la nueva alerta de reposición.
3. Entra a **Ayuda** (**HU32**): elige un pedido, motivo `Entrega`, escribe ≥15 caracteres, envía el caso (`Abierto`) y pulsa **🧪 Simular respuesta de soporte** para pasarlo a `Respondido`.

---

## Parte 2 · Respuestas preparadas para las 12 preguntas de sustentación

1. **¿Por qué el inventario por variante debe tener una sola fuente de verdad?**  
   Porque si el producto guardara un `stock` manual aparte del de sus variantes, cualquier compra, cancelación o edición podría desincronizar ambos números (ej. mostrar stock global positivo cuando todas las variantes están en 0). Derivando `producto.stock` como la suma de `variantes`, ambas cifras siempre coinciden.

2. **¿Qué cambia en el carrito si dos productos tienen el mismo id pero distintas tallas?**  
   No basta identificar la línea por `producto.id`. En Market Mjolnir 2.0 cada ítem usa una clave compuesta `claveCarrito = "${productoId}::${varianteId}"`, por lo que dos tallas del mismo producto viven como líneas separadas con su propio precio, cantidad y límite de stock de variante.

3. **¿Cómo aseguras que búsqueda, marca y rango de precios actúen a la vez?**  
   Pasando todos los filtros juntos por una única función pura `aplicarFiltrosCatalogo` que evalúa condiciones `AND` (`coincideBusqueda && coincideCategoria && coincideMarca && coincideMin && coincideMax && coincideDisp`), en lugar de reemplazar una lista filtrada con otra. Además, `validarRangoPrecio` impide aplicar `mínimo > máximo`.

4. **¿Qué diferencia existe entre una dirección seleccionada y una dirección principal?**  
   La **dirección principal** es la predeterminada de la libreta del usuario (solo puede haber una marcada con `principal: true`). La **dirección seleccionada** (`direccionSeleccionadaId`) es la elegida puntualmente para el pedido actual en el checkout, que puede ser otra distinta de la principal o incluso estar sin seleccionar para validar **HU25-CA04**.

5. **¿Cómo evitas sumar dos veces el costo de envío?**  
   El envío nunca se acumula sobre el estado previo del total. En cada cálculo, `calcularEnvioV2(direccionActiva, modalidadEnvio)` determina una tarifa única según municipio y modalidad, y `calcularResumenCarritoV2` calcula desde cero `total = subtotal - descuento + envio`.

6. **¿Qué impide pasar de Confirmado a Entregado directamente?**  
   La función `obtenerSiguienteEstadoPedido` consulta el arreglo ordenado `FLUJO_ESTADOS_PEDIDO = ['Confirmado', 'Preparando', 'En camino', 'Entregado']` y solo permite avanzar al índice `i + 1`. Si el estado es `Entregado` o `Cancelado`, retorna `null` y bloquea cualquier transición.

7. **¿Por qué una cancelación no debería borrar el pedido?**  
   Porque en comercio electrónico se requiere trazabilidad contable, de inventario y de posventa (auditoría, notificaciones y tickets de ayuda). La cancelación lógica cambia el estado a `Cancelado` y agrega un evento al historial cronológico conservando el registro intacto.

8. **¿Cómo evitas que cancelar dos veces aumente artificialmente el inventario?**  
   Cada pedido tiene la bandera `stockRestituido` (inicia en `false`) y `evaluarCancelacionPedido` rechaza cancelar cualquier pedido cuyo estado ya sea `Cancelado`. Al confirmar la primera cancelación, `cancelarPedidoControlado` restituye el stock y fija `stockRestituido: true`, haciendo imposible un segundo reintegro.

9. **¿Qué diferencia hay entre una notificación interna y una notificación push?**  
   Una **notificación interna** (como la de **HU29**) vive en el estado local de la app (`useState` / `AsyncStorage`) y solo se consulta dentro de una pantalla de la aplicación; una **notificación push** requiere servicios externos (FCM/APNs), permisos del sistema operativo y servidor remoto para llegar al dispositivo incluso con la app cerrada.

10. **¿Cómo pruebas que una recomendación no incluya productos agotados?**  
    Mediante la función pura `obtenerRecomendacionesRelacionadas`, que filtra `obtenerStockProducto(p) > 0` y expone únicamente `variantesDisponibles` con `stock > 0`. En las pruebas automatizadas (`scripts/verificarReglasV2.mjs`) se verifica con `assert.ok(recs.every(r => obtenerStockProducto(r) > 0))`, comprobando además con `PROD-004` (stock 0) que nunca aparece recomendado.

11. **¿Cómo demuestras que una nueva funcionalidad no dañó el carrito anterior?**  
    Ejecutando pruebas de regresión sobre agregar, aumentar/disminuir cantidad, eliminar, aplicar cupón `BIENVENIDO10`, validar comprador y descontar inventario, además de validar con `node scripts/verificarReglasV2.mjs` y probar el flujo completo de compra en `npx expo start`.

12. **¿Qué límites tendría tu prototipo antes de conectarlo a una API real?**  
    Los datos residen en memoria/almacenamiento local del dispositivo (sin concurrencia multiusuario ni persistencia compartida), no hay autenticación JWT/OAuth ni control de sesión seguro, las transacciones de inventario no son atómicas en servidor y las respuestas de preguntas, soporte y envíos son simulaciones determinísticas locales.
