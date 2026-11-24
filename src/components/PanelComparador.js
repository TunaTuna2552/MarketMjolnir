import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { obtenerFuenteImagen } from '../data/catalogoHalo';
import { calcularPromedioEstrellas, formatearCOP } from '../utils/formatters';
import { obtenerStockProducto } from '../utils/reglasV2';

/**
 * HU22 · Comparador de productos (2 a 3 productos en columnas lado a lado).
 * No altera inventario ni carrito.
 */
export default function PanelComparador({
  productosComparados = [],
  tema,
  escala = 1,
  onRetirar,
  onLimpiar,
  onAbrirDetalle,
  onIrCatalogo,
}) {
  const fs = (n) => Math.round(n * escala);

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <View
        style={[
          styles.encabezado,
          { backgroundColor: tema.tarjeta, borderLeftColor: tema.primario },
        ]}
      >
        <Text style={[styles.titulo, { color: tema.textoPrincipal, fontSize: fs(15) }]}>
          ⚖️ COMPARADOR DE PRODUCTOS (HU22)
        </Text>
        <Text style={[styles.subtitulo, { color: tema.textoSuave, fontSize: fs(12) }]}>
          Compara entre 2 y 3 productos por nombre, marca, precio y disponibilidad sin afectar tu carrito ni favoritos.
        </Text>
      </View>

      {productosComparados.length === 0 ? (
        <View
          style={[
            styles.vacioBox,
            { backgroundColor: tema.tarjeta, borderColor: tema.borde },
          ]}
        >
          <Text style={{ fontSize: 40, marginBottom: 8 }}>⚖️</Text>
          <Text style={[styles.vacioTitulo, { color: tema.textoPrincipal, fontSize: fs(17) }]}>
            No hay productos en comparación
          </Text>
          <Text style={[styles.vacioTexto, { color: tema.textoSuave, fontSize: fs(13) }]}>
            Marca entre 2 y 3 productos en el catálogo con el botón &quot;⚖️ Comparar&quot; para verlos lado a lado.
          </Text>
          <Pressable
            onPress={onIrCatalogo}
            style={[
              styles.btnPrimario,
              { backgroundColor: tema.primarioBoton, borderColor: tema.primario },
            ]}
          >
            <Text style={[styles.btnTextoClaro, { fontSize: fs(13) }]}>
              🛡️ Ir al Catálogo para elegir productos
            </Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <View style={styles.barraAcciones}>
            <Text style={[styles.contadorTxt, { color: tema.textoSecundario, fontSize: fs(12) }]}>
              Seleccionados: {productosComparados.length} / 3 productos
            </Text>
            <Pressable
              onPress={onLimpiar}
              style={[
                styles.btnLimpiar,
                { backgroundColor: tema.errorFondo, borderColor: tema.error },
              ]}
            >
              <Text style={[styles.btnLimpiarTxt, { color: tema.error, fontSize: fs(11) }]}>
                Vaciar comparador
              </Text>
            </Pressable>
          </View>

          {productosComparados.length < 2 && (
            <View
              style={[
                styles.avisoMinimo,
                { backgroundColor: tema.secundarioFondo, borderColor: tema.secundario },
              ]}
            >
              <Text style={[styles.avisoMinimoTxt, { color: tema.secundario, fontSize: fs(12) }]}>
                ℹ️ Tienes 1 producto seleccionado. Agrega al menos 1 más desde el catálogo (mínimo 2, máximo 3) para comparar alternativas.
              </Text>
            </View>
          )}

          {/* Columnas comparativas con scroll horizontal para garantizar lectura sin recortes */}
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View style={styles.columnasRow}>
              {productosComparados.map((prod) => {
                const stockTotal = obtenerStockProducto(prod);
                const agotado = stockTotal <= 0;
                const estrellas = calcularPromedioEstrellas(prod.resenas);
                const numVariantes = Array.isArray(prod.variantes) ? prod.variantes.length : 1;

                return (
                  <View
                    key={prod.id}
                    style={[
                      styles.columnaCard,
                      { backgroundColor: tema.tarjeta, borderColor: tema.borde },
                    ]}
                  >
                    <View
                      style={[
                        styles.imagenBox,
                        { backgroundColor: tema.tarjetaSecundaria, borderColor: tema.borde },
                      ]}
                    >
                      <Image
                        source={obtenerFuenteImagen(prod)}
                        style={styles.imagen}
                        resizeMode="contain"
                      />
                    </View>

                    <View style={[styles.filaDato, { borderBottomColor: tema.borde }]}>
                      <Text style={[styles.labelDato, { color: tema.textoSuave, fontSize: fs(10) }]}>
                        NOMBRE
                      </Text>
                      <Text
                        style={[
                          styles.valorNombre,
                          { color: tema.textoPrincipal, fontSize: fs(14) },
                        ]}
                      >
                        {prod.nombre}
                      </Text>
                    </View>

                    <View style={[styles.filaDato, { borderBottomColor: tema.borde }]}>
                      <Text style={[styles.labelDato, { color: tema.textoSuave, fontSize: fs(10) }]}>
                        MARCA
                      </Text>
                      <Text style={[styles.valorTexto, { color: tema.info, fontSize: fs(12) }]}>
                        {prod.marca || 'Materials Group UNSC'}
                      </Text>
                    </View>

                    <View style={[styles.filaDato, { borderBottomColor: tema.borde }]}>
                      <Text style={[styles.labelDato, { color: tema.textoSuave, fontSize: fs(10) }]}>
                        PRECIO BASE
                      </Text>
                      <Text
                        style={[styles.valorPrecio, { color: tema.primario, fontSize: fs(16) }]}
                      >
                        {formatearCOP(prod.precio)} COP
                      </Text>
                    </View>

                    <View style={[styles.filaDato, { borderBottomColor: tema.borde }]}>
                      <Text style={[styles.labelDato, { color: tema.textoSuave, fontSize: fs(10) }]}>
                        DISPONIBILIDAD
                      </Text>
                      <Text
                        style={[
                          styles.valorTexto,
                          {
                            color: agotado ? tema.error : tema.primario,
                            fontSize: fs(12),
                            fontWeight: '800',
                          },
                        ]}
                      >
                        {agotado ? 'Agotado (0 uds.)' : `Disponible (${stockTotal} uds.)`}
                      </Text>
                    </View>

                    <View style={[styles.filaDato, { borderBottomColor: tema.borde }]}>
                      <Text style={[styles.labelDato, { color: tema.textoSuave, fontSize: fs(10) }]}>
                        CATEGORÍA · VARIANTES
                      </Text>
                      <Text
                        style={[
                          styles.valorTexto,
                          { color: tema.textoSecundario, fontSize: fs(12) },
                        ]}
                      >
                        {prod.categoria} · {numVariantes} opción(es)
                      </Text>
                    </View>

                    <View style={[styles.filaDato, { borderBottomColor: tema.borde }]}>
                      <Text style={[styles.labelDato, { color: tema.textoSuave, fontSize: fs(10) }]}>
                        VALORACIÓN
                      </Text>
                      <Text
                        style={[styles.valorTexto, { color: tema.secundario, fontSize: fs(12) }]}
                      >
                        {estrellas.texto}
                      </Text>
                    </View>

                    <View style={styles.accionesColumna}>
                      <Pressable
                        onPress={() => onAbrirDetalle(prod.id)}
                        style={[
                          styles.btnVerDetalle,
                          { backgroundColor: tema.infoFondo, borderColor: tema.info },
                        ]}
                      >
                        <Text
                          style={[styles.btnVerDetalleTxt, { color: tema.info, fontSize: fs(12) }]}
                        >
                          🔍 Ver detalle
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => onRetirar(prod.id)}
                        style={[
                          styles.btnRetirar,
                          { backgroundColor: tema.errorFondo, borderColor: tema.error },
                        ]}
                      >
                        <Text
                          style={[styles.btnRetirarTxt, { color: tema.error, fontSize: fs(12) }]}
                        >
                          ✕ Retirar
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    padding: 12,
    paddingBottom: 36,
  },
  encabezado: {
    borderRadius: 10,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 12,
  },
  titulo: {
    fontWeight: '900',
  },
  subtitulo: {
    marginTop: 3,
    lineHeight: 18,
  },
  vacioBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  vacioTitulo: {
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  vacioTexto: {
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  btnPrimario: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 8,
  },
  btnTextoClaro: {
    color: '#F8FAFC',
    fontWeight: '800',
    textAlign: 'center',
  },
  barraAcciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  contadorTxt: {
    fontWeight: '800',
  },
  btnLimpiar: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  btnLimpiarTxt: {
    fontWeight: '800',
  },
  avisoMinimo: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  avisoMinimoTxt: {
    fontWeight: '700',
    lineHeight: 18,
  },
  columnasRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingBottom: 8,
  },
  columnaCard: {
    width: 240,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginRight: 12,
  },
  imagenBox: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    padding: 6,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
  filaDato: {
    paddingVertical: 7,
    borderBottomWidth: 1,
  },
  labelDato: {
    fontWeight: '800',
    marginBottom: 2,
  },
  valorNombre: {
    fontWeight: '800',
  },
  valorTexto: {
    fontWeight: '700',
  },
  valorPrecio: {
    fontWeight: '900',
  },
  accionesColumna: {
    marginTop: 10,
    gap: 8,
  },
  btnVerDetalle: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  btnVerDetalleTxt: {
    fontWeight: '800',
  },
  btnRetirar: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  btnRetirarTxt: {
    fontWeight: '800',
  },
});
