# Iteración 5 — Beneficiarios y ayudas

Acceso: **5. Gestión de Beneficiarios y Ayudas**, icono de caja del menú lateral, ruta `/beneficios`.

## Referencias y alcance

Se siguen los once casos de uso CU-BA-01 a CU-BA-11 del [MER y escenarios compartidos](https://app.diagrams.net/#G1TS6Q7cikjr9WjYskgo6lIEvUcZ2SoSr7) y los flujos de `it5.jpeg`, `it5.1.jpeg`, `it5.2.jpeg` e `it5.3.jpeg`. Las pantallas usan los colores, tarjetas, botones y navegación de la aplicación.

La inspección encontró previamente las cuentas y fichas `beneficiario`, las postulaciones/verificaciones en Usuarios e Inicio, las campañas y las asignaciones/entregas de donaciones. Esos módulos y sus rutas conservan su implementación. Esta iteración añade su propia API, páginas y tablas. Solo se incorporan el registro de rutas, la habilitación del menú y su título en los componentes existentes.

Los apoyos `apoya_a` documentan la relación campaña–beneficiario del MER. No descuentan existencias ni duplican movimientos de Donaciones. Las salidas físicas de inventario siguen registrándose en el módulo existente. La quinta iteración no modifica `donacionIntegraciones.ts` ni los servicios de Campañas, Usuarios o Donaciones.

## Uso

1. **Beneficiarios:** buscar por nombre, documento o correo; filtrar por tipo y estado; registrar una cuenta nueva o asociar una cuenta existente sin quitarle otros roles; consultar y actualizar la ficha.
2. **Solicitudes de ayuda:** seleccionar beneficiario, tipo de ayuda, prioridad, fecha y descripción; guardar para obtener el código `SOL-…`; adjuntar documentos opcionales; consultar las evaluaciones.
3. **Evaluación:** el administrador confirma la revisión y evaluación, escribe observaciones y aprueba, rechaza o mantiene pendiente. Solo se evalúan solicitudes pendientes. Aprobar requiere una ficha verificada y una cuenta activa. El resultado queda visible al beneficiario dentro del sistema; no se envían correos.
4. **Ayudas y entregas:** abrir una solicitud aprobada, asociar una campaña activa y vigente, describir el apoyo y elegir responsable. Registrar vínculo → preparar entrega → confirmar entrega real. Los cambios quedan en el historial.
5. **Evidencia fotográfica de entrega:** después de confirmar la entrega, el administrador puede elegir una fotografía, revisar su vista previa, añadir una descripción opcional y pulsar **Guardar evidencia**. Las imágenes quedan en una galería con fecha y autor, se pueden ampliar/descargar y son visibles también para el beneficiario titular.

Las cuentas beneficiarias ven únicamente su ficha, sus solicitudes y sus apoyos. Las cuentas aún sin ficha reciben un enlace al flujo existente de Inicio. La autorización de cada petición verifica la cuenta y su perfil actual en la base, además del JWT.

## Reglas

- El documento es único en la tabla de beneficiarios existente. Los contactos siguen perteneciendo a `usuario`. El correo es obligatorio porque la ficha tiene una cuenta del sistema.
- El beneficiario no puede verificarse. Si cambia su documento, tipo de documento o tipo de beneficiario, su ficha vuelve a pendiente de revisión. El administrador no puede verificar su propia ficha ni evaluar su propia solicitud.
- No se permiten fechas de solicitud o entrega futuras ni fechas de entrega anteriores a la asignación.
- `fecha_programada` es opcional. `fecha_entrega` permanece nula mientras el apoyo esté pendiente o preparado.
- Una entrega confirmada no puede modificarse ni confirmarse dos veces. Solicitudes y apoyos utilizan una versión para detectar ediciones concurrentes y bloqueos transaccionales para las transiciones.
- Se pueden añadir evidencias a una entrega confirmada sin cambiar sus datos. Máximo cinco JPG/PNG/WEBP de 5 MB cada uno, almacenados de forma privada. Cada carga añade un evento al historial. Una misma foto no puede adjuntarse dos veces a la misma entrega y las fotografías guardadas no se sustituyen ni eliminan desde la interfaz.
- Una solicitud puede recibir apoyo de distintas campañas, con un solo vínculo por combinación solicitud–campaña.
- Adjuntos: hasta cinco PDF/JPG/PNG de 10 MB por solicitud, con verificación de firma y MIME. Se guardan en PostgreSQL como documentos privados y se descargan con autenticación; nunca se publican en `/uploads`.
- Las listas incluyen búsqueda, filtros, paginación, estados vacíos y mensajes de error. Las pestañas admiten navegación con flechas, Inicio y Fin.

## Base de datos

La migración `database/04_beneficiarios_ayudas.sql` es aditiva y repetible. No altera las tablas anteriores ni reinicializa sus datos. Añade:

| Tabla | Contenido |
|---|---|
| `beneficiario_ayuda_ficha` | Tipo de documento complementario, vinculado a la ficha existente |
| `solicitud_ayuda` | Petición, beneficiario, prioridad, estado y versión |
| `evaluacion_ayuda` | Resoluciones, observaciones, administrador y fecha |
| `apoya_a` | Vínculo solicitud–campaña–beneficiario y datos de entrega |
| `apoyo_historial` | Eventos de creación, actualización, preparación y confirmación |
| `solicitud_ayuda_adjunto` | Documentos privados |
| `apoyo_evidencia` | Fotos privadas de entregas, descripción, autor, fecha y hash para evitar duplicados |

En una instalación nueva, Docker ejecuta el script después de los anteriores. En una base ya creada, ejecutar desde la raíz:

```powershell
docker compose exec -T db psql -U admin -d bd_donaciones_voluntariado -v ON_ERROR_STOP=1 -f /docker-entrypoint-initdb.d/04_beneficiarios_ayudas.sql
```

En este entorno la migración ya fue aplicada. El respaldo previo está en `backend/storage/backups/antes-iteracion5.dump`. No es necesario borrar el volumen ni repetir los scripts iniciales.

La fotografía de entrega se incorpora con la migración aditiva `05_evidencias_entrega.sql`, también aplicada en este entorno. En otras bases existentes, después de la migración 04:

```powershell
docker compose exec -T db psql -U admin -d bd_donaciones_voluntariado -v ON_ERROR_STOP=1 -f /docker-entrypoint-initdb.d/05_evidencias_entrega.sql
```

## API

Todas las rutas usan el prefijo `/api/ayudas` y requieren `Authorization: Bearer <token>`.

| Método y ruta | Permiso / resultado |
|---|---|
| `GET /acceso` | Cuenta activa; capacidades del usuario |
| `GET /catalogos` | Tipos de ayuda; campañas, responsables y cuentas disponibles solo para admin |
| `GET /beneficiarios` | Admin: fichas; beneficiario: solo la propia |
| `POST /beneficiarios` | Admin: nueva ficha y cuenta, o vínculo con `usuario_existente_id` |
| `PUT /beneficiarios/:id` | Admin o titular: actualización; el titular no puede modificar su verificación |
| `GET /solicitudes` | Listado limitado al titular, salvo admin |
| `POST /solicitudes` | Nueva petición en estado pendiente |
| `GET /solicitudes/:id` | Detalle, evaluaciones y metadatos de adjuntos |
| `PUT /solicitudes/:id` | Admin o titular: petición pendiente, con `version` |
| `POST /solicitudes/:id/evaluaciones` | Admin: `estado`, `observaciones`, `revisada`, `evaluada`, `version` |
| `POST /solicitudes/:id/adjuntos` | Admin o titular: multipart `archivos`, solo mientras esté pendiente |
| `GET /adjuntos/:id` | Descarga privada para admin o titular |
| `GET /apoyos` | Listado limitado al titular, salvo admin |
| `GET /apoyos/:id` | Detalle e historial limitado al titular, salvo admin |
| `POST /apoyos` | Admin: vínculo con `id_solicitud`, `id_campana`, tipo, descripción, responsable y fecha programada opcional |
| `PUT /apoyos/:id` | Admin: actualización, preparación o confirmación con `version` |
| `POST /apoyos/:id/evidencias` | Admin: multipart `foto` y `descripcion` opcional; solo para una entrega confirmada |
| `GET /evidencias/:id` | Imagen privada para admin o beneficiario titular, sin caché pública |

Los errores siguen `{ "error": "mensaje" }`. Las mutaciones devuelven el registro actualizado; las altas usan HTTP 201. Un acceso a un registro ajeno devuelve 404. Las versiones antiguas y transiciones no válidas devuelven 409.

## Verificación

```powershell
cd backend
npm run build
node --test -r ts-node/register tests/ayudas.integration.cjs
cd ../frontend
npm run build
```

La suite crea una base temporal `i5_test_<pid>_<timestamp>`, carga el esquema y datos iniciales, prueba el flujo mediante HTTP y elimina solo esa base al terminar. Requiere que el usuario de PostgreSQL pueda crear bases. No inserta ejemplos en la base de la aplicación.

Cubre autenticación, aislamiento entre beneficiarios, documento duplicado con rollback de la cuenta, alta y actualización de fichas, conservación de roles existentes, validación de solicitudes, adjuntos privados, evaluaciones, conflictos de versión, restricciones de campañas, preparación y entrega, doble confirmación concurrente y consultas a las rutas originales de Usuarios, Campañas y Donaciones.

La suite también comprueba el formato y tamaño de las evidencias, que solo las suban administradores después de confirmar la entrega, la privacidad de lectura, los duplicados concurrentes, el historial y el límite de cinco fotografías.

La revisión visual automatizada no pudo completarse: la herramienta de navegación no identificó con seguridad la URL del navegador local. Queda pendiente la comprobación visual interactiva de escritorio, móvil y tema oscuro.
