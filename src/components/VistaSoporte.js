import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MOTIVOS_SOPORTE, REGLAS_V2 } from '../data/constantesV2';

/**
 * HU32 · Centro de ayuda y solicitudes de soporte asociadas a pedidos.
 * Permite crear casos (>= 15 caracteres) y simular respuesta ficticia.
 */
export default function VistaSoporte({
  pedidos = [],
  tickets = [],
  pedidoPreseleccionado = '',
  tema,
  escala = 1,
  onCrearTicket,
  onSimularRespuesta,
}) {
  const [pedidoCodigo, setPedidoCodigo] = useState(
    pedidoPreseleccionado || pedidos[0]?.codigo || ''
  );
  const [motivo, setMotivo] = useState(MOTIVOS_SOPORTE[0]);
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (pedidoPreseleccionado) {
      setPedidoCodigo(pedidoPreseleccionado);
    } else if (!pedidoCodigo && pedidos.length > 0) {
      setPedidoCodigo(pedidos[0].codigo);
    }
  }, [pedidoPreseleccionado, pedidos]);

  const fs = (n) => Math.round(n * escala);

  const manejarEnviar = () => {
    const exito = onCrearTicket({ pedidoCodigo, motivo, descripcion });
    if (exito) {
      setDescripcion('');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <View
        style={[
          styles.encabezado,
          { backgroundColor: tema.tarjeta, borderLeftColor: tema.primario },
        ]}
      >
        <Text style={[styles.titulo, { color: tema.textoPrincipal, fontSize: fs(15) }]}>
          🛟 CENTRO DE AYUDA Y SOLICITUDES (HU32)
        </Text>
        <Text style={[styles.subtitulo, { color: tema.textoSuave, fontSize: fs(12) }]}>
          Registra solicitudes de soporte asociadas a tus pedidos y prueba la respuesta ficticia en modo demostración.
        </Text>
      </View>

      {/* Formulario de solicitud */}
      <View
        style={[
          styles.panel,
          { backgroundColor: tema.tarjeta, borderColor: tema.borde },
        ]}
      >
        <Text style={[styles.panelTitulo, { color: tema.secundario, fontSize: fs(13) }]}>
          ➕ NUEVA SOLICITUD DE SOPORTE
        </Text>

        <Text style={[styles.label, { color: tema.textoSecundario, fontSize: fs(12) }]}>
          1. Selecciona el pedido asociado *:
        </Text>

        {pedidos.length === 0 ? (
          <View
            style={[
              styles.sinPedidosBox,
              { backgroundColor: tema.errorFondo, borderColor: tema.error },
            ]}
          >
            <Text style={[styles.sinPedidosTxt, { color: tema.error, fontSize: fs(12) }]}>
              No hay pedidos en el historial. Confirma primero un pedido en el carrito para asociar una solicitud.
            </Text>
          </View>
        ) : (
          <View style={styles.chipsWrap}>
            {pedidos.map((ped) => {
              const activo = pedidoCodigo === ped.codigo;
              return (
                <Pressable
                  key={ped.codigo}
                  onPress={() => setPedidoCodigo(ped.codigo)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: activo ? tema.primarioFondo : tema.superficie,
                      borderColor: activo ? tema.primario : tema.borde,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipTxt,
                      {
                        color: activo ? tema.primario : tema.textoSecundario,
                        fontSize: fs(11),
                      },
                    ]}
                  >
                    📦 {ped.codigo} ({ped.estado})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={[styles.label, { color: tema.textoSecundario, fontSize: fs(12) }]}>
          2. Motivo de la solicitud *:
        </Text>
        <View style={styles.chipsWrap}>
          {MOTIVOS_SOPORTE.map((m) => {
            const activo = motivo === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMotivo(m)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: activo ? tema.secundarioFondo : tema.superficie,
                    borderColor: activo ? tema.secundario : tema.borde,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipTxt,
                    {
                      color: activo ? tema.secundario : tema.textoSecundario,
                      fontSize: fs(12),
                    },
                  ]}
                >
                  {m}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: tema.textoSecundario, fontSize: fs(12) }]}>
          3. Describe tu inconveniente (mín. {REGLAS_V2.MIN_CHARS_SOPORTE} caracteres · actual:{' '}
          {descripcion.trim().length}) *:
        </Text>
        <TextInput
          style={[
            styles.inputArea,
            {
              backgroundColor: tema.inputFondo,
              color: tema.textoPrincipal,
              borderColor: tema.borde,
              fontSize: fs(13),
            },
          ]}
          multiline
          numberOfLines={3}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Ej. El empaque llegó con una esquina abollada, solicito revisión simulada..."
          placeholderTextColor={tema.placeholder}
        />

        <Pressable
          onPress={manejarEnviar}
          style={[
            styles.btnEnviar,
            { backgroundColor: tema.primarioBoton, borderColor: tema.primario },
          ]}
        >
          <Text style={[styles.btnEnviarTxt, { fontSize: fs(13) }]}>
            📩 Enviar solicitud de ayuda
          </Text>
        </Pressable>
      </View>

      {/* Historial de casos */}
      <View
        style={[
          styles.panel,
          { backgroundColor: tema.tarjeta, borderColor: tema.borde },
        ]}
      >
        <Text style={[styles.panelTitulo, { color: tema.secundario, fontSize: fs(13) }]}>
          📋 CASOS REGISTRADOS ({tickets.length})
        </Text>

        {tickets.length === 0 ? (
          <Text style={[styles.vacioTxt, { color: tema.textoSuave, fontSize: fs(12) }]}>
            Aún no has creado solicitudes de ayuda. Cuando envíes una, aparecerá aquí con su número único de caso.
          </Text>
        ) : (
          tickets.map((t) => {
            const abierto = t.estado === 'Abierto';
            return (
              <View
                key={t.id}
                style={[
                  styles.casoCard,
                  { backgroundColor: tema.tarjetaSecundaria, borderColor: tema.borde },
                ]}
              >
                <View style={styles.casoTopRow}>
                  <Text style={[styles.casoId, { color: tema.textoPrincipal, fontSize: fs(13) }]}>
                    🎫 {t.id}
                  </Text>
                  <View
                    style={[
                      styles.estadoBadge,
                      {
                        backgroundColor: abierto ? tema.secundarioFondo : tema.primarioFondo,
                        borderColor: abierto ? tema.secundario : tema.primario,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.estadoTxt,
                        { color: abierto ? tema.secundario : tema.primario, fontSize: fs(10) },
                      ]}
                    >
                      {t.estado.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.casoMeta, { color: tema.info, fontSize: fs(11) }]}>
                  Pedido: {t.pedidoCodigo} · Motivo: {t.motivo} · 🕒 {t.fecha}
                </Text>

                <Text
                  style={[
                    styles.casoDesc,
                    { color: tema.textoSecundario, fontSize: fs(12) },
                  ]}
                >
                  {t.descripcion}
                </Text>

                {t.respuestaSimulada ? (
                  <View
                    style={[
                      styles.respuestaBox,
                      { backgroundColor: tema.primarioFondo, borderColor: tema.primario },
                    ]}
                  >
                    <Text
                      style={[
                        styles.respuestaTxt,
                        { color: tema.textoPrincipal, fontSize: fs(12) },
                      ]}
                    >
                      {t.respuestaSimulada}
                    </Text>
                  </View>
                ) : null}

                {abierto && (
                  <Pressable
                    onPress={() => onSimularRespuesta(t.id)}
                    style={[
                      styles.btnSimular,
                      { backgroundColor: tema.infoFondo, borderColor: tema.info },
                    ]}
                  >
                    <Text style={[styles.btnSimularTxt, { color: tema.info, fontSize: fs(12) }]}>
                      🧪 Simular respuesta de soporte
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}
      </View>
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
  panel: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  panelTitulo: {
    fontWeight: '900',
    marginBottom: 8,
  },
  label: {
    fontWeight: '700',
    marginBottom: 6,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipTxt: {
    fontWeight: '700',
  },
  sinPedidosBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  sinPedidosTxt: {
    fontWeight: '700',
  },
  inputArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    minHeight: 74,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  btnEnviar: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  btnEnviarTxt: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  vacioTxt: {
    fontStyle: 'italic',
  },
  casoCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  casoTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  casoId: {
    fontWeight: '900',
  },
  estadoBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  estadoTxt: {
    fontWeight: '900',
  },
  casoMeta: {
    fontWeight: '700',
    marginBottom: 6,
  },
  casoDesc: {
    lineHeight: 18,
    marginBottom: 8,
  },
  respuestaBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  respuestaTxt: {
    lineHeight: 18,
    fontWeight: '600',
  },
  btnSimular: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  btnSimularTxt: {
    fontWeight: '800',
  },
});
