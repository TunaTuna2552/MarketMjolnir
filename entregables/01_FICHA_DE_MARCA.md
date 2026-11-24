# ENTREGABLE 01 · FICHA DE MARCA Y CATÁLOGO INICIAL
**Reto Integrador · Desarrollo Móvil (React Native + Expo)**

---

## 1. Identidad de Marca

| Elemento de Marca | Definición Oficial |
| :--- | :--- |
| **Nombre de la aplicación** | **MarketMjolnir** |
| **Iniciales / Ícono de marca** | **`[MM⚡]`** (Sello tipográfico en recuadro Azul Trueno con borde Ámbar Eléctrico) |
| **Eslogan comercial** | *"Forjando las mejores compras locales en la Sabana"* |
| **Justificación del nombre** | Inspirado en *Mjölnir* —símbolo nórdico de fuerza, trabajo artesanal en la forja y confiabilidad—, **MarketMjolnir** representa una tienda móvil sólida y veloz que "forja" un puente digital entre los pequeños comercios de **Mosquera, Madrid y Funza** y los compradores de la región. Es un nombre original, memorable y 100 % diferenciado de plataformas comerciales existentes. |
| **Público objetivo** | Estudiantes, deportistas, familias, dueños de mascotas y aficionados a la tecnología residentes en **Mosquera, Madrid y Funza** (Sabana de Occidente, Cundinamarca) que buscan adquirir productos de emprendimientos locales desde su teléfono móvil de forma rápida, transparente y segura. |

---

## 2. Propuesta de Valor (Máximo 50 palabras)

> *"MarketMjolnir conecta a los compradores de Mosquera, Madrid y Funza con emprendimientos locales de tecnología, deporte, hogar y mascotas en una sola app ágil, permitiendo comparar precios en pesos colombianos, aprovechar envíos claros y simular pedidos confiables en segundos."*
>
> *(Total: **39 palabras** — Cumple el límite máximo de 50 palabras).*

---

## 3. Categorías Oficiales del Marketplace (4 Categorías)

1. **⚡ Tecnología:** Audífonos, teclados, soportes y accesorios para estudio y trabajo remoto.
2. **🏋️ Deporte:** Mancuernas, termos térmicos y bandas de resistencia para entrenamiento funcional en casa o gimnasio.
3. **🏠 Hogar:** Lámparas artesanales, organizadores de escritorio hechos en la Sabana y cafeteras de especialidad.
4. **🐾 Mascotas:** Camas ortopédicas antifluido, dispensadores automáticos y juguetes resistentes para perros y gatos.

---

## 4. Sistema Visual y Paleta de Colores

| Rol Visual | Color | Código Hex | Uso en la Interfaz (`StyleSheet`) |
| :--- | :--- | :---: | :--- |
| **Color Principal 1 (Primario)** | **Azul Trueno** | `#1E3A8A` | Encabezado de marca, pestañas activas, precios destacados y botones principales de compra. Transmite confianza, solidez y respaldo tecnológico. |
| **Color Principal 2 (Acento)** | **Ámbar Eléctrico** | `#F59E0B` | Insignia `MM⚡`, borde del encabezado, botones de confirmación de compra, estrellas de calificación y aplicación de cupones. Transmite energía y acción. |
| **Fondo General** | **Blanco Nube** | `#F8FAFC` | Fondo limpio de lectura en todas las pantallas para resaltar las tarjetas de producto. |
| **Superficie de Tarjetas** | **Blanco Puro** | `#FFFFFF` | Contenedores de productos, detalle, carrito, formulario e historial con bordes suaves `#E2E8F0`. |
| **Estados Semánticos** | **Verde / Rojo / Ámbar** | `#16A34A` / `#DC2626` / `#D97706` | Indicadores de stock disponible, producto agotado (`stock: 0`), advertencias de tope de inventario y confirmaciones. |

---

## 5. Catálogo Inicial de Productos (12 Referencias en 4 Categorías)

Todos los productos cumplen el modelo de datos exigido:
- **`id`**: Identificador único (`PROD-001` a `PROD-012`).
- **`nombre`**: Texto legible no vacío.
- **`categoria`**: Distribución equitativa en las 4 categorías (3 productos por categoría).
- **`precio`**: Número entero positivo en pesos colombianos (`COP`), sin decimales.
- **`stock`**: Número entero no negativo (incluye `PROD-001` y `PROD-004` con `stock: 10` para la prueba de descuento de inventario de 10 a 7 unidades, `PROD-006` con `stock: 2` para probar límite máximo en carrito, y `PROD-012` con `stock: 0` para probar el estado Agotado).
- **`descripcion`**: Descripción breve superior a 15 caracteres (todas superan los 95 caracteres).
- **`icono`**: Marcador gráfico de iniciales con color por categoría.

| ID | Nombre del Producto | Categoría | Precio (COP) | Stock Inicial | Ícono | Descripción (`>= 15` caracteres) |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| `PROD-001` | Audífonos Bluetooth Valhala Pro | Tecnología | `$85.000` | `10` | `AV` | Audífonos inalámbricos con cancelación de ruido ambiental, micrófono HD y batería de 24 horas ideales para estudio y trabajo remoto. |
| `PROD-002` | Teclado Mecánico Runas RGB | Tecnología | `$145.000` | `6` | `TR` | Teclado mecánico compacto con switches táctiles de alta respuesta y retroiluminación LED para programar y jugar cómodamente. |
| `PROD-003` | Soporte Magnético Bifrost Celular | Tecnología | `$32.000` | `15` | `SB` | Soporte metálico plegable y ajustable para escritorio, compatible con cualquier teléfono móvil o tableta liviana. |
| `PROD-004` | Mancuernas Hexagonales Thor 5kg | Deporte | `$95.000` | `10` | `MT` | Par de mancuernas recubiertas en neopreno antideslizante para entrenamiento funcional y de fuerza en casa. |
| `PROD-005` | Termo Deportivo Berserker 1L | Deporte | `$42.000` | `8` | `TB` | Botella térmica de acero inoxidable de doble pared que conserva tus bebidas frías por 18 horas durante el ejercicio. |
| `PROD-006` | Bandas de Resistencia Valkiria Set | Deporte | `$55.000` | `2` | `BV` | Kit de 5 bandas elásticas de látex natural con diferentes niveles de tensión para calistenia, estiramiento y pilates. |
| `PROD-007` | Lámpara Nórdica Midgard LED | Hogar | `$78.000` | `5` | `LM` | Lámpara de mesa con base de madera artesanal de la Sabana y luz LED cálida regulable en tres niveles de intensidad. |
| `PROD-008` | Organizador de Escritorio Asgard | Hogar | `$48.000` | `9` | `OA` | Organizador multifuncional en madera ecológica elaborado por emprendedores de Funza para mantener tu estudio impecable. |
| `PROD-009` | Cafetera Prensa Francesa Odin 600ml | Hogar | `$64.000` | `4` | `CO` | Prensa francesa en vidrio borosilicato resistente al calor con émbolo de acero inoxidable para preparar café de origen. |
| `PROD-010` | Cama Acolchada Fenrir Talla M | Mascotas | `$110.000` | `3` | `CF` | Cama ortopédica con tela antifluido de fácil limpieza y cojín reversible ultra suave para perros y gatos medianos. |
| `PROD-011` | Dispensador Automático Freya Dual | Mascotas | `$160.000` | `7` | `DF` | Comedero y bebedero dosificador de gran capacidad ideal para garantizar la alimentación diaria de tu mascota. |
| `PROD-012` | Juguete Mordedor Mjolnir Canino | Mascotas | `$28.000` | `0` *(Agotado)* | `JM` | Mordedor de caucho natural ultra resistente con forma de martillo diseñado para fortalecer la mandíbula de tu perro. |

---

## 6. Reglas de Negocio Configuradas

- **Moneda:** Pesos colombianos (`COP`) expresados como números enteros positivos sin decimales.
- **Cálculo de Subtotal:** $\text{Subtotal} = \sum (\text{cantidad} \times \text{precio unitario})$.
- **Cupón Promocional (`HU17`):** El código `BIENVENIDO10` descuenta el **10 %** sobre el subtotal.
- **Regla de Envío Simulado (`HU11`):**
  - Si el carrito está vacío: **$\$0\text{ COP}$** (no se calcula envío).
  - Si el subtotal es menor a $\$150.000\text{ COP}$: **$\$8.000\text{ COP}$**.
  - Si el subtotal es igual o superior a $\$150.000\text{ COP}$: **Envío GRATIS ($\$0\text{ COP}$)**.
- **Total del Pedido:** $\text{Total} = \max(0, \text{Subtotal} - \text{Descuento}) + \text{Envío}$.
