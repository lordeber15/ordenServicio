# Imprenta Alexander - Sistema de Gestión

Sistema de gestión integral para imprenta, que cubre órdenes de servicio, facturación electrónica, inventario, almanaques y control de ingresos/egresos.

---

## Stack Tecnológico

### Frontend (`ordenServicio/`)
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.2.3 | Framework UI |
| Vite | 6.2.0 | Build tool / dev server |
| React Router | 7.4.0 | Enrutamiento SPA |
| TanStack React Query | 5.74.3 | Caché y estado del servidor |
| Tailwind CSS | 4.0.17 | Estilos utilitarios |
| Axios | 1.8.4 | Cliente HTTP |
| React Hot Toast | 2.5.2 | Notificaciones |
| React Icons | 5.5.0 | Iconografía |
| Moment.js | 2.30.1 | Manipulación de fechas |

### Backend (`Backend_servicios_imprenta/`)
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js + Express | 4.18.2 | API REST |
| PostgreSQL | — | Base de datos |
| Sequelize | 6.32.1 | ORM |
| Axios | 1.10.0 | Llamadas a APIs externas (RENIEC) |
| Morgan | 1.10.0 | Logging de peticiones HTTP |
| CORS | 2.8.5 | Control de orígenes cruzados |
| Nodemon | 3.0.1 | Auto-reload en desarrollo |

---

## Estructura del Proyecto

```
Desarrollo/
├── ordenServicio/                    # Frontend React
│   ├── src/
│   │   ├── assets/                   # Imágenes y recursos estáticos
│   │   ├── components/               # Componentes reutilizables
│   │   │   ├── almanaque/            # Componentes de almanaques
│   │   │   ├── ingresos y egresos/   # Control financiero
│   │   │   ├── Reports/              # Tarjetas de reportes
│   │   │   ├── navbar.jsx            # Barra de navegación
│   │   │   ├── drawer.jsx            # Panel lateral
│   │   │   ├── pagination.jsx        # Paginación de tablas
│   │   │   ├── protectedRoutes.jsx   # Guard de rutas privadas
│   │   │   ├── search.jsx            # Buscador
│   │   │   ├── tablaProductos.jsx    # Tabla de productos
│   │   │   ├── modalAgregaritem.jsx  # Modal agregar ítem
│   │   │   └── modalEditaritem.jsx   # Modal editar ítem
│   │   ├── pages/                    # Páginas de la app
│   │   │   ├── facturacion/          # Boleta, Factura, Guía, Nota de Crédito, Ticket
│   │   │   ├── Almanaques/           # Creación y listado
│   │   │   ├── dashboard.jsx         # Lista de trabajos/órdenes
│   │   │   ├── inventario.jsx        # Gestión de productos
│   │   │   ├── login.jsx             # Autenticación
│   │   │   ├── perfil.jsx            # Gestión de usuarios
│   │   │   └── reportes.jsx          # Reportes y estadísticas
│   │   ├── request/                  # Módulos de peticiones HTTP
│   │   │   ├── axiosURL.js           # Instancia base de Axios
│   │   │   ├── serviciosrequest.js   # API de servicios/trabajos
│   │   │   ├── loginrequest.js       # API de autenticación
│   │   │   ├── productos.js          # API de inventario
│   │   │   ├── ingresosrequest.js    # API de ingresos
│   │   │   ├── egresosrequest.js     # API de egresos
│   │   │   ├── almanaques.js         # API de almanaques
│   │   │   ├── ticket.js             # API de tickets
│   │   │   ├── unidades.js           # API de unidades
│   │   │   └── reniec.js             # API externa RENIEC
│   │   ├── App.jsx                   # Router principal
│   │   └── main.jsx                  # Entry point
│   ├── .env                          # Variables de entorno (no commitear)
│   └── vite.config.js                # Configuración de Vite
│
└── Backend_servicios_imprenta/       # Backend Node.js
    ├── src/
    │   ├── controllers/              # Lógica de negocio por módulo
    │   │   ├── facturacion/          # 14 controladores de facturación
    │   │   ├── Tickets/              # Controlador de tickets
    │   │   ├── almanaque/            # Controlador de almanaques
    │   │   ├── ingresosyegresos/     # Ingresos y egresos
    │   │   ├── login.controller.js   # Autenticación
    │   │   ├── reniec.controller.js  # Consulta DNI RENIEC
    │   │   └── servicios.controller.js # Órdenes de servicio
    │   ├── models/                   # Modelos Sequelize
    │   │   └── facturacion/asociation.js # Relaciones entre modelos
    │   ├── routes/                   # Definición de rutas Express
    │   ├── database/
    │   │   └── database.js           # Configuración Sequelize + PostgreSQL
    │   ├── app.js                    # Express: middlewares y rutas
    │   └── server.js                 # Servidor HTTP
    └── index.js                      # Entry point + sync de BD
```

---

## Flujo de Trabajo

### 1. Autenticación
```
Usuario → Login (/) → Valida credenciales contra BD →
Guarda userData en localStorage → Redirige a /dashboard
```
> El componente `ProtectedRoutes` verifica si existe `userData` en localStorage antes de renderizar cualquier ruta protegida.

### 2. Órdenes de Servicio (Dashboard)
```
/dashboard
  ├── Listado de trabajos filtrados por estado
  │     Tabs: Todos | Pendiente | Diseño | Impresión | Terminado | Entregado
  ├── Búsqueda por nombre del cliente
  ├── Crear nuevo trabajo (modal)
  ├── Editar trabajo (modal)
  └── Eliminar trabajo (modal de confirmación)
```
Flujo CRUD:
```
GET  /servicios          → Lista todos los trabajos
POST /servicios          → Crea nuevo trabajo
PUT  /servicios/:id      → Actualiza trabajo
DEL  /servicios/:id      → Elimina trabajo
```

### 3. Facturación Electrónica
```
/boleta        → Emisión de Boleta de Venta
/factura       → Emisión de Factura
/guiarem       → Guía de Remisión
/notacredito   → Nota de Crédito
/ticket        → Comprobante tipo Ticket
```
Datos auxiliares consumidos: clientes, emisor, series, moneda, tipos de comprobante, unidades, tabla paramétrica, tipo de afectación IGV.

### 4. Consulta RENIEC
```
Ingreso de DNI en formulario de facturación →
GET /api/reniec/:dni → API externa → Auto-rellena datos del cliente
```

### 5. Inventario
```
/inventario
  ├── Listado de productos con paginación
  ├── Búsqueda en tiempo real
  ├── Crear / Editar / Eliminar productos
  └── Gestión de unidades de medida
```

### 6. Ingresos y Egresos
```
/ingresos
  ├── Registro de ingresos con fecha, monto y descripción
  ├── Registro de egresos
  └── Tabla consolidada con totales
```

### 7. Almanaques
```
/almanaque/new    → Crear nuevo almanaque
/almanaque        → Listado de almanaques
/almanaque/:id    → Detalle y edición de almanaque
```

### 8. Reportes
```
/reportes → Resumen visual de servicios, ingresos y egresos
```

---

---

## 📘 Manual de Usuario Detallado

A continuación se detalla el flujo de uso paso a paso para cada uno de los módulos operativos del sistema.

### 1. Acceso y Seguridad (Login)
El sistema requiere autenticación obligatoria para acceder a las herramientas.

*   **Paso 1**: Ingresar al dominio principal. Verá la pantalla de login con un degradado azul/índigo.
*   **Paso 2**: Ingrese el **RUC** de la imprenta, su **Usuario** y **Contraseña**.
*   **Paso 3**: Haga clic en "Ingresar". Si los datos son correctos, será redirigido al Dashboard.

> **Ejemplo de Uso**: 
> - **RUC**: `20123456789`
> - **Usuario**: `admin`
> - **Cargo**: Al ser Administrador, tendrá acceso a la pestaña "Registro de Usuarios" en el perfil para crear nuevas cuentas.

---

### 2. Gestión de Órdenes de Servicio (Dashboard)
Este es el motor del taller, donde se registran todos los pedidos de los clientes.

#### **Pasos para crear un nuevo trabajo**:
1.  Haga clic en el botón flotante **"+"** o "Agregar Servicio" en el Dashboard.
2.  **Rellenar el formulario**:
    - **Nombre**: Nombre completo del cliente.
    - **Cantidad**: Cantidad de unidades a producir.
    - **Trabajo**: Descripción (ej: "1000 Tarjetas en couche 300g").
    - **Total**: Monto total pactado.
    - **A cuenta**: Monto que el cliente está dejando como adelanto.
3.  Haga clic en **"Confirmar"**. El sistema restará el adelanto del total y mostrará el saldo pendiente.

#### **Seguimiento por Estados**:
-   **Pendiente**: El trabajo acaba de ingresar.
-   **Diseño**: El diseñador está trabajando en el arte.
-   **Impresión**: El trabajo está en máquinas.
-   **Terminado**: Listo para entrega.
-   **Entregado**: El cliente ya retiró el producto y el trabajo sale del flujo activo.

---

### 3. Emisión de Comprobantes (Boletas y Facturas)
Módulo integrado con SUNAT para legalizar las ventas.

#### **Paso a paso: Emitir una Factura**:
1.  Vaya a la pestaña **Factura** en el menú lateral.
2.  **Identificar al Cliente**: 
    - Ingrese el **RUC** del cliente.
    - Presione el ícono de búsqueda (Lupa). El sistema consultará a RENIEC/SUNAT y auto-rellenará la razón social y dirección.
3.  **Agregar Productos/Servicios**:
    - Haga clic en un campo de ítem. Se abrirá un modal de su inventario.
    - Seleccione el producto (ej: "Hojas Bond A4").
    - Ajuste la cantidad y el precio. El sistema calculará el IGV automáticamente.
4.  **Confirmar y Emitir**:
    - Revise los totales abajo a la derecha.
    - Presione **"Emitir Comprobante"**.
    - El sistema mostrará un loader y luego descargará automáticamente el **PDF** con el código QR.

---

### 4. Inventario y Stock
Control centralizado de materiales y productos terminados.

*   **Pasos para añadir stock**: 
    1. Vaya a **Inventario**.
    2. Localice el producto (use el buscador si es necesario).
    3. Haga clic en **Editar**.
    4. Cambie el valor en el campo **Stock**.
    5. **Configuración de IGV**: Asegúrese de elegir el "Tipo de IGV" correcto (Gravado para venta común, Exonerado/Inafecto según corresponda).

> **Ejemplo**: Si registra un producto como "Tintas Offset" y pone stock `10`, cuando venda por ticket o factura, podrá validar visualmente si le quedan existencias.

---

### 5. Control de Caja y Punto de Venta (POS)
Este módulo permite gestionar los turnos de trabajo y el balance de efectivo.

#### **Flujo de Turno**:
1.  **Apertura**: Al iniciar el día, registre el monto con el que empieza la caja (ej: S/ 100.00 para vuelto).
2.  **Ventas**: Durante el día, todas las facturas y tickets emitidos se sumarán automáticamente al "Efectivo Esperado".
3.  **Cierre**: Al terminar el turno:
    - Ingrese el **Efectivo Físico** que tiene en mano.
    - El sistema comparará: `Apertura` + `Ventas` vs `Físico`.
    - Se generará un registro de **Sobrante** o **Faltante** automáticamente.

#### **Historial**:
- Puede consultar cierres pasados para auditar el desempeño del negocio.

---

### 6. Otros Movimientos (Ingresos y Egresos)
Registro diario de cada sol que entra o sale del negocio fuera del flujo de ventas directas.

---

### 6. Módulo de Almanaques
Proceso específico para la campaña de fin de año.

1.  **Nuevo Almanaque**: Ingrese los detalles de la serie, modelo y cantidad.
2.  **Lista de Almanaque**: Visualice el avance de producción y los pagos pendientes específicos de esta línea de negocio.

---

### 7. Administración y Perfil
*   **Usuarios**: Solo el Administrador puede ver la tabla de usuarios en el perfil.
*   **Emisor**: Configure aquí los datos de su empresa (RUC, Logo, Certificado para SUNAT).

---

---

## Flujo de Datos (Frontend ↔ Backend)

```
Componente React
    │
    ▼
Request Module (src/request/*.js)   ← axiosURL.js (baseURL desde .env)
    │
    ▼
Express API (localhost:3000)
    │
    ├── Middleware: express.json(), cors(), morgan
    │
    ▼
Route → Controller → Sequelize Model
    │
    ▼
PostgreSQL (servicios @ localhost:5432)
```

Estado del servidor manejado con **TanStack React Query**:
- `queryKey` identifica cada recurso en caché
- `invalidateQueries` refresca datos tras mutaciones
- `useMutation` + `toast.promise` para feedback al usuario

---

## API Endpoints

| Módulo | Método | Ruta | Descripción |
|---|---|---|---|
| Auth | GET | `/login` | Obtener usuarios |
| Auth | POST | `/login` | Crear usuario |
| Servicios | GET/POST | `/servicios` | Trabajos/órdenes |
| Servicios | PUT/DELETE | `/servicios/:id` | Editar/eliminar trabajo |
| Clientes | GET/POST | `/cliente` | Gestión de clientes |
| Comprobantes | GET/POST | `/comprobante` | Comprobantes fiscales |
| Productos | GET/POST | `/producto` | Inventario |
| Ingresos | GET/POST | `/ingresos` | Registro de ingresos |
| Egresos | GET/POST | `/egresos` | Registro de egresos |
| Tickets | GET/POST | `/tickets` | Gestión de tickets |
| Almanaques | GET/POST | `/almanaque` | Almanaques |
| RENIEC | GET | `/api/reniec/:dni` | Consulta DNI |
| Emisor | GET/PUT | `/emisor` | Datos de la empresa |
| Series | GET/POST | `/serie` | Series de comprobantes |
| Moneda | GET | `/moneda` | Tipos de moneda |
| Unidades | GET | `/unidad` | Unidades de medida |
| Tabla Paramétrica | GET | `/tabla_parametrica` | Códigos SUNAT |
| Tipo Afectación | GET | `/tipo_afectacion` | Tipos IGV |
| Tipo Comprobante | GET | `/tipo_comprobante` | Tipos de documento fiscal |
| Tipo Documento | GET | `/tipo_documento` | Tipos de documento identidad |

---

## Configuración y Desarrollo

### Requisitos
- Node.js >= 18
- PostgreSQL >= 14
- Base de datos: `servicios` en `localhost:5432`

### Backend
```bash
cd Backend_servicios_imprenta
npm install
# Configurar .env (ver sección Variables de Entorno)
npm start         # nodemon index.js — puerto 3000
```

### Frontend
```bash
cd ordenServicio
npm install
# Configurar .env
npm run dev       # Vite dev server — puerto 5173
npm run build     # Build de producción
npm run preview   # Preview del build
```

### Variables de Entorno

**Backend** (`.env`):
```env
DATABASE_URL=postgres://usuario:password@localhost:5432/servicios
PORT=3000
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:3000/
```

---

## Roles de Usuario

| Rol | Acceso |
|---|---|
| `Administrador` | Todas las rutas + Crear usuarios + Inventario |
| Usuario regular | Dashboard, facturación, ingresos, almanaques, reportes |

La autorización se verifica en el frontend mediante el campo `cargo` almacenado en `localStorage.userData`.

---

## Dominio de Producción

- Frontend / Backend: `https://impalexander.store`
- API: `https://api.impalexander.store/api/`

---

## Sistema de Colores

El sistema de colores está organizado en categorías para facilitar el mantenimiento y la futura implementación de modo oscuro. Todos los colores utilizan la paleta de Tailwind CSS.

### Colores Primarios

Colores principales de la marca e interfaz, utilizados en navegación, botones principales y elementos destacados.

| Clase Tailwind | Hex | Uso | Modo Oscuro Sugerido |
|---|---|---|---|
| `sky-700` | `#0369a1` | Navbar, botones primarios, títulos destacados | `sky-400` (#38bdf8) |
| `sky-600` | `#0284c7` | Dropdown menu, hover states | `sky-500` (#0ea5e9) |
| `sky-500` | `#0ea5e9` | Hover effects en menú | `sky-600` (#0284c7) |
| `cyan-500` | `#06b6d4` | Botones de acción (Guardar, Crear) | `cyan-400` (#22d3ee) |
| `cyan-400` | `#22d3ee` | Hover en botones cyan | `cyan-500` (#06b6d4) |

### Colores Secundarios

Colores de acento utilizados en gradientes, fondos especiales y elementos decorativos.

| Clase Tailwind | Hex | Uso | Modo Oscuro Sugerido |
|---|---|---|---|
| `indigo-500` | `#6366f1` | Gradiente de login (from) | `indigo-600` (#4f46e5) |
| `blue-500` | `#3b82f6` | Gradiente de login (to) | `blue-600` (#2563eb) |
| `amber-50` | `#fffbeb` | Texto en login | `amber-900` (#78350f) |
| `amber-100` | `#fef3c7` | Placeholder en login | `amber-800` (#92400e) |

### Colores Neutrales

Colores para backgrounds, bordes, textos y elementos de interfaz general.

| Clase Tailwind | Hex | Uso | Modo Oscuro Sugerido |
|---|---|---|---|
| `white` | `#ffffff` | Fondos de modales, cards | `gray-800` (#1f2937) |
| `gray-200` | `#e5e7eb` | Inputs, backgrounds secundarios | `gray-700` (#374151) |
| `gray-300` | `#d1d5db` | Botones cancelar, bordes | `gray-600` (#4b5563) |
| `gray-400` | `#9ca3af` | Botones deshabilitados | `gray-500` (#6b7280) |
| `gray-500` | `#6b7280` | Texto placeholder | `gray-400` (#9ca3af) |
| `gray-700` | `#374151` | Texto secundario | `gray-300` (#d1d5db) |
| `gray-800` | `#1f2937` | Texto principal | `gray-200` (#e5e7eb) |

### Colores de Estado

Colores para indicar estados de error, advertencia, éxito, etc.

| Clase Tailwind | Hex | Uso | Modo Oscuro Sugerido |
|---|---|---|---|
| `red-600` | `#dc2626` | Botones de eliminar, alertas de error | `red-500` (#ef4444) |
| `red-700` | `#b91c1c` | Hover en botones de eliminar, texto de advertencia | `red-400` (#f87171) |

### Notas para Implementación de Modo Oscuro

Para implementar el modo oscuro en el futuro:

1. **Crear variables CSS personalizadas** en `index.css`:
   ```css
   :root {
     --color-primary: #0369a1;
     --color-bg: #ffffff;
     --color-text: #1f2937;
   }
   
   [data-theme="dark"] {
     --color-primary: #38bdf8;
     --color-bg: #1f2937;
     --color-text: #e5e7eb;
   }
   ```

2. **Extender Tailwind config** para usar las variables CSS personalizadas

3. **Principios de contraste**:
   - Los colores primarios oscuros (700) → versiones más claras (400-500)
   - Los colores claros (50-200) → versiones oscuras (700-900)
   - Mantener contraste WCAG AA (mínimo 4.5:1 para texto)

4. **Elementos a considerar**:
   - Navbar: `bg-sky-700` → `bg-sky-900` o `bg-gray-900`
   - Cards/Modales: `bg-white` → `bg-gray-800`
   - Inputs: `bg-gray-200` → `bg-gray-700`
   - Texto: invertir escala de grises
