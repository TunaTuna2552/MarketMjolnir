import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * HU29 · Centro de notificaciones interno (sin push ni envíos reales).
 * Muestra avisos por cambio de estado de pedidos y reposición de stock.
 */
export default function VistaNotificaciones({
  notificaciones = [],
  tema,
  escala = 1,
  onMarcarLeida,
  onMarcarTodasLeidas,
  onIrPedidos,
}) {
  const fs = (n) => Math.round(n * escala);
  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const etiquetaTipo = (tipo) => {
    if (tipo === 'pedido') return '📦 PEDIDO';
    if (tipo === 'cancelacion') return '🛑 CANCELACIÓN';
    if (tipo === 'reposicion') return '🔔 REPOSICIÓN';
    return 'ℹ️ AVISO';
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
          🔔 CENTRO DE NOTIFICACIONES INTERNO (HU29)
        </Text>
        <Text style={[styles.subtitulo, { color: tema.textoSuave, fontSize: fs(12) }]}>
          Avisos locales dentro de la aplicación (no usa notificaciones push ni envíos externos).
        </Text>
      </View>

      <View style={styles.barraTop}>
        <Text style={[styles.resumenTxt, { color: tema.textoSecundario, fontSize: fs(12) }]}>
          Total: {notificaciones.length} · Sin leer: {noLeidas}
        </Text>
        {noLeidas > 0 && (
          <Pressable
            onPress={onMarcarTodasLeidas}
            style={[
              styles.btnMarcarTodas,
              { backgroundColor: tema.infoFondo, borderColor: tema.info },
            ]}
          >
            <Text style={[styles.btnMarcarTodasTxt, { color: tema.info, fontSize: fs(11) }]}>
              ✓ Marcar todas como leídas
            </Text>
          </Pressable>
        )}
      </View>

      {notificaciones.length === 0 ? (
        <View
          style={[
            styles.vacioBox,
            { backgroundColor: tema.tarjeta, borderColor: tema.borde },
          ]}
        >
          <Text style={{ fontSize: 40, marginBottom: 8 }}>🔕</Text>
          <Text style={[styles.vacioTitulo, { color: tema.textoPrincipal, fontSize: fs(16) }]}>
            No tienes notificaciones nuevas
          </Text>
          <Text style={[styles.vacioTexto, { color: tema.textoSuave, fontSize: fs(13) }]}>
            Cuando confirmes una compra, simules avances de entrega, canceles un pedido o repongas un producto agotado con aviso activo, aparecerá aquí sin duplicarse.
          </Text>
          <Pressable
            onPress={onIrPedidos}
            style={[
              styles.btnIrPedidos,
              { backgroundColor: tema.primarioBoton, borderColor: tema.primario },
            ]}
          >
            <Text style={[styles.btnIrPedidosTxt, { fontSize: fs(13) }]}>
              📜 Ir a Mis Pedidos para simular avances
            </Text>
          </Pressable>
        </View>
      ) : (
        notificaciones.map((notif) => (
          <Pressable
            key={notif.id}
            onPress={() => onMarcarLeida(notif.id)}
            style={[
              styles.notifCard,
              {
                backgroundColor: notif.leida ? tema.tarjeta : tema.infoFondo,
                borderColor: notif.leida ? tema.borde : tema.info,
              },
            ]}
          >
            <View style={styles.notifTopRow}>
              <Text style={[styles.notifTipo, { color: tema.secundario, fontSize: fs(11) }]}>
                {etiquetaTipo(notif.tipo)}
                {notif.referenciaId ? ` · ${notif.referenciaId}` : ''}
              </Text>
              <View
                style={[
                  styles.estadoBadge,
                  {
                    backgroundColor: notif.leida ? tema.superficie : tema.primarioFondo,
                    borderColor: notif.leida ? tema.borde : tema.primario,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.estadoTxt,
                    {
                      color: notif.leida ? tema.textoSuave : tema.primario,
                      fontSize: fs(10),
                    },
                  ]}
                >
                  {notif.leida ? 'LEÍDA' : 'NUEVA · TOCA PARA LEER'}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.notifMensaje,
                {
                  color: tema.textoPrincipal,
                  fontSize: fs(13),
                  fontWeight: notif.leida ? '500' : '800',
                },
              ]}
            >
              {notif.mensaje}
            </Text>

            <Text style={[styles.notifFecha, { color: tema.textoSuave, fontSize: fs(11) }]}>
              🕒 {notif.fecha}
            </Text>
          </Pressable>
        ))
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
    marginBottom: 10,
  },
  titulo: {
    fontWeight: '900',
  },
  subtitulo: {
    marginTop: 3,
    lineHeight: 18,
  },
  barraTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  resumenTxt: {
    fontWeight: '800',
  },
  btnMarcarTodas: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  btnMarcarTodasTxt: {
    fontWeight: '800',
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
  btnIrPedidos: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  btnIrPedidosTxt: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  notifCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  notifTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  notifTipo: {
    fontWeight: '900',
  },
  estadoBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  estadoTxt: {
    fontWeight: '900',
  },
  notifMensaje: {
    lineHeight: 19,
    marginBottom: 4,
  },
  notifFecha: {
    fontWeight: '600',
  },
});
