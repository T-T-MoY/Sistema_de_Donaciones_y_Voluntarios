# Puntos reservados para Campañas y Solicitudes de Ayuda

Este documento delimita el contrato futuro. Gestión de Donaciones no crea ni administra esos módulos.

## Flujo ya preparado

1. Una donación de alimentos/materiales se registra en `donacion`.
2. El personal registra su recepción en `donacion_recepciones`.
3. El trigger `trg_recepcion_a_inventario` inserta una partida en `inventario` por la cantidad aceptada. El dinero no crea existencias físicas.
4. Cuando el módulo propietario esté disponible, su salida se registrará en `inventario_destino` con:
   - `id_inventario`: partida exacta de existencias.
   - `id_donacion`: donación que originó esa partida; una FK compuesta valida que ambos identificadores correspondan.
   - `campana_id` **o** `solicitud_ayuda_id`: exactamente uno de los dos destinos.
   - `cantidad`, administrador que registra, fecha y observaciones.
5. El trigger `trg_controlar_salida_inventario` bloquea la partida, comprueba el saldo, descuenta la cantidad y permite anular una salida restaurando el saldo. No permite borrar salidas ni cambiar su origen/destino/cantidad.

## Dónde completar la integración

- **Contrato/API de Campañas:** `backend/src/services/donacionIntegraciones.ts`, métodos `listarActivas` y `estaActiva`.
- **Contrato/API de Solicitudes de Ayuda:** el mismo archivo, método `solicitudesIntegracion.estaAprobada`.
- **Claves foráneas reales:** agregar `FOREIGN KEY` desde `inventario_destino.campana_id` y `inventario_destino.solicitud_ayuda_id` cuando el equipo propietario entregue los nombres exactos de las tablas y PK. No inventar esos nombres.
- **Pantalla de salida:** se implementará cuando el alcance y contrato de los módulos propietarios estén disponibles. No se incluyó una pantalla para crear campañas, solicitudes ni ayudas en este módulo.

## Restricciones

- No insertar ni actualizar directamente tablas de Campañas o Solicitudes.
- No crear aquí las tablas de esos módulos.
- No asignar ambos destinos a una misma salida.
- No registrar cantidades superiores al saldo disponible.
- Las salidas anuladas se conservan para trazabilidad.
