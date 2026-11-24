import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MUNICIPIOS_ENVIO } from '../data/constantesV2';

/**
 * HU25 · Libreta de direcciones ficticias.
 * Crear, editar sin duplicar, marcar única principal y seleccionar para compra.
 */
export default function VistaDirecciones({
  direcciones = [],
  direccionSeleccionadaId,
  tema,
  escala = 1,
  onGuardarDireccion,
  onMarcarPrincipal,
  onSeleccionarParaCompra,
  onEliminarDireccion,
  onIrCarrito,
}) {
  const [editandoId, setEditandoId] = useState(null);
  const [alias, setAlias] = useState('');
  const [municipio, setMunicipio] = useState('Mosquera');
  const [municipioPersonalizado, setMunicipioPersonalizado] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [marcarPrincipal, setMarcarPrincipal] = useState(false);

  const fs = (n) => Math.round(n * escala);

  const limpiarFormulario = () => {
    setEditandoId(null);
    setAlias('');
    setMunicipio('Mosquera');
    setMunicipioPersonalizado('');
    setDescripcion('');
    setMarcarPrincipal(false);
  };

  const iniciarEdicion = (dir) => {
    setEditandoId(dir.id);
    setAlias(dir.alias);
    if (['Mosquera', 'Funza', 'Madrid'].includes(dir.municipio)) {
      setMunicipio(dir.municipio);
      setMunicipioPersonalizado('');
    } else {
      setMunicipio('Otro municipio');
      setMunicipioPersonalizado(dir.municipio);
    }
    setDescripcion(dir.descripcion);
    setMarcarPrincipal(Boolean(dir.principal));
  };

  const manejarGuardar = () => {
    const municipioFinal =
      municipio === 'Otro municipio'
        ? municipioPersonalizado.trim() || 'Otro municipio'
        : municipio;

    const exito = onGuardarDireccion(
      {
        alias,
        municipio: municipioFinal,
        descripcion,
        principal: marcarPrincipal,
      },
      editandoId
    );
    if (exito) {
      limpiarFormulario();
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
          📍 MIS DIRECCIONES DE ENTREGA (HU25)
        </Text>
        <Text style={[styles.subtitulo, { color: tema.textoSuave, fontSize: fs(12) }]}>
          Administra direcciones ficticias de prueba, elige una única dirección principal y selecciónala para tus envíos.
        </Text>
      </View>

      <View
        style={[
          styles.avisoPrivacidad,
          { backgroundColor: tema.infoFondo, borderColor: tema.info },
        ]}
      >
        <Text style={[styles.avisoPrivacidadTxt, { color: tema.textoSecundario, fontSize: fs(11) }]}>
          🛡️ USO ACADÉMICO: Registra solo ubicaciones ficticias de demostración. No ingreses direcciones reales ni datos personales auténticos.
        </Text>
      </View>

      {/* Formulario Crear / Editar */}
      <View
        style={[
          styles.panel,
          { backgroundColor: tema.tarjeta, borderColor: tema.borde },
        ]}
      >
        <Text style={[styles.panelTitulo, { color: tema.secundario, fontSize: fs(13) }]}>
          {editandoId
            ? `✏️ EDITAR DIRECCIÓN (${editandoId})`
            : '➕ REGISTRAR NUEVA DIRECCIÓN FICTICIA'}
        </Text>

        <Text style={[styles.label, { color: tema.textoSecundario, fontSize: fs(12) }]}>
          Alias de la dirección *:
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: tema.inputFondo,
              color: tema.textoPrincipal,
              borderColor: tema.borde,
              fontSize: fs(13),
            },
          ]}
          value={alias}
          onChangeText={setAlias}
          placeholder="Ej. Base Norte (Demo)"
          placeholderTextColor={tema.placeholder}
        />

        <Text style={[styles.label, { color: tema.textoSecundario, fontSize: fs(12) }]}>
          Municipio de entrega *:
        </Text>
        <View style={styles.chipsWrap}>
          {MUNICIPIOS_ENVIO.map((mun) => {
            const activo = municipio === mun;
            return (
              <Pressable
                key={mun}
                onPress={() => setMunicipio(mun)}
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
                    { color: activo ? tema.primario : tema.textoSecundario, fontSize: fs(12) },
                  ]}
                >
                  {mun}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {municipio === 'Otro municipio' && (
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: tema.inputFondo,
                color: tema.textoPrincipal,
                borderColor: tema.borde,
                fontSize: fs(13),
              },
            ]}
            value={municipioPersonalizado}
            onChangeText={setMunicipioPersonalizado}
            placeholder="Nombre del municipio ficticio (ej. Facatativá)"
            placeholderTextColor={tema.placeholder}
          />
        )}

        <Text style={[styles.label, { color: tema.textoSecundario, fontSize: fs(12) }]}>
          Referencia general de entrega (ficticia) *:
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: tema.inputFondo,
              color: tema.textoPrincipal,
              borderColor: tema.borde,
              fontSize: fs(13),
            },
          ]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Ej. Sector Parque Simulado, Torre 4 Portería"
          placeholderTextColor={tema.placeholder}
        />

        <Pressable
          onPress={() => setMarcarPrincipal((v) => !v)}
          style={[
            styles.checkRow,
            {
              backgroundColor: marcarPrincipal ? tema.primarioFondo : tema.tarjetaSecundaria,
              borderColor: marcarPrincipal ? tema.primario : tema.borde,
            },
          ]}
        >
          <Text
            style={[
              styles.checkTxt,
              {
                color: marcarPrincipal ? tema.primario : tema.textoSecundario,
                fontSize: fs(12),
              },
            ]}
          >
            {marcarPrincipal ? '☑' : '☐'} Marcar como dirección principal única
          </Text>
        </Pressable>

        <View style={styles.botonesForm}>
          <Pressable
            onPress={manejarGuardar}
            style={[
              styles.btnGuardar,
              { backgroundColor: tema.primarioBoton, borderColor: tema.primario },
            ]}
          >
            <Text style={[styles.btnGuardarTxt, { fontSize: fs(13) }]}>
              {editandoId ? '💾 Guardar cambios' : '➕ Agregar dirección'}
            </Text>
          </Pressable>

          {editandoId && (
            <Pressable
              onPress={limpiarFormulario}
              style={[
                styles.btnCancelar,
                { backgroundColor: tema.errorFondo, borderColor: tema.error },
              ]}
            >
              <Text style={[styles.btnCancelarTxt, { color: tema.error, fontSize: fs(12) }]}>
                Cancelar
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Lista de Direcciones */}
      <View
        style={[
          styles.panel,
          { backgroundColor: tema.tarjeta, borderColor: tema.borde },
        ]}
      >
        <View style={styles.listaHeader}>
          <Text style={[styles.panelTitulo, { color: tema.secundario, fontSize: fs(13) }]}>
            📋 DIRECCIONES REGISTRADAS ({direcciones.length})
          </Text>
          <Pressable onPress={onIrCarrito}>
            <Text style={[styles.linkCarrito, { color: tema.info, fontSize: fs(12) }]}>
              Ir al carrito →
            </Text>
          </Pressable>
        </View>

        {direcciones.length === 0 ? (
          <Text style={[styles.vacioTexto, { color: tema.textoSuave, fontSize: fs(12) }]}>
            Aún no hay direcciones registradas. Agrega una arriba.
          </Text>
        ) : (
          direcciones.map((dir) => {
            const seleccionada = dir.id === direccionSeleccionadaId;
            return (
              <View
                key={dir.id}
                style={[
                  styles.dirCard,
                  {
                    backgroundColor: tema.tarjetaSecundaria,
                    borderColor: seleccionada ? tema.primario : tema.borde,
                  },
                ]}
              >
                <View style={styles.dirTopRow}>
                  <Text
                    style={[
                      styles.dirAlias,
                      { color: tema.textoPrincipal, fontSize: fs(14) },
                    ]}
                  >
                    🏠 {dir.alias}
                  </Text>
                  <View style={styles.badgesWrap}>
                    {dir.principal && (
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: tema.secundarioFondo,
                            borderColor: tema.secundario,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeTxt,
                            { color: tema.secundario, fontSize: fs(10) },
                          ]}
                        >
                          ★ PRINCIPAL
                        </Text>
                      </View>
                    )}
                    {seleccionada && (
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: tema.primarioFondo,
                            borderColor: tema.primario,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeTxt,
                            { color: tema.primario, fontSize: fs(10) },
                          ]}
                        >
                          ✓ ACTIVA EN COMPRA
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <Text style={[styles.dirMeta, { color: tema.info, fontSize: fs(12) }]}>
                  📍 Municipio: {dir.municipio}
                </Text>
                <Text
                  style={[
                    styles.dirDesc,
                    { color: tema.textoSecundario, fontSize: fs(12) },
                  ]}
                >
                  {dir.descripcion}
                </Text>

                <View style={styles.dirAccionesRow}>
                  <Pressable
                    onPress={() => onSeleccionarParaCompra(dir.id)}
                    style={[
                      styles.btnAccionDir,
                      {
                        backgroundColor: seleccionada ? tema.primarioFondo : tema.superficie,
                        borderColor: seleccionada ? tema.primario : tema.borde,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.btnAccionDirTxt,
                        {
                          color: seleccionada ? tema.primario : tema.textoPrincipal,
                          fontSize: fs(11),
                        },
                      ]}
                    >
                      {seleccionada ? '✓ Seleccionada' : 'Usar para envío'}
                    </Text>
                  </Pressable>

                  {!dir.principal && (
                    <Pressable
                      onPress={() => onMarcarPrincipal(dir.id)}
                      style={[
                        styles.btnAccionDir,
                        {
                          backgroundColor: tema.secundarioFondo,
                          borderColor: tema.secundario,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.btnAccionDirTxt,
                          { color: tema.secundario, fontSize: fs(11) },
                        ]}
                      >
                        ★ Hacer principal
                      </Text>
                    </Pressable>
                  )}

                  <Pressable
                    onPress={() => iniciarEdicion(dir)}
                    style={[
                      styles.btnAccionDir,
                      { backgroundColor: tema.infoFondo, borderColor: tema.info },
                    ]}
                  >
                    <Text
                      style={[styles.btnAccionDirTxt, { color: tema.info, fontSize: fs(11) }]}
                    >
                      ✏️ Editar
                    </Text>
                  </Pressable>

                  {direcciones.length > 1 && (
                    <Pressable
                      onPress={() => onEliminarDireccion(dir.id)}
                      style={[
                        styles.btnAccionDir,
                        { backgroundColor: tema.errorFondo, borderColor: tema.error },
                      ]}
                    >
                      <Text
                        style={[styles.btnAccionDirTxt, { color: tema.error, fontSize: fs(11) }]}
                      >
                        🗑 Eliminar
                      </Text>
                    </Pressable>
                  )}
                </View>
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
    marginBottom: 10,
  },
  titulo: {
    fontWeight: '900',
  },
  subtitulo: {
    marginTop: 3,
    lineHeight: 18,
  },
  avisoPrivacidad: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  avisoPrivacidadTxt: {
    fontWeight: '600',
    lineHeight: 16,
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
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipTxt: {
    fontWeight: '700',
  },
  checkRow: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  checkTxt: {
    fontWeight: '700',
  },
  botonesForm: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  btnGuardar: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  btnGuardarTxt: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  btnCancelar: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  btnCancelarTxt: {
    fontWeight: '800',
  },
  listaHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  linkCarrito: {
    fontWeight: '800',
  },
  vacioTexto: {
    fontStyle: 'italic',
  },
  dirCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  dirTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dirAlias: {
    fontWeight: '900',
  },
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeTxt: {
    fontWeight: '900',
  },
  dirMeta: {
    fontWeight: '700',
    marginBottom: 2,
  },
  dirDesc: {
    lineHeight: 18,
    marginBottom: 10,
  },
  dirAccionesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  btnAccionDir: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  btnAccionDirTxt: {
    fontWeight: '800',
  },
});
