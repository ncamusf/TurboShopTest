# 🚗 TurboShop Marketplace

Marketplace de autopartes que integra múltiples proveedores en una plataforma unificada.

## 🌟 Características

- ✅ Integración con múltiples proveedores (AutoPartsPlus, RepuestosMax, GlobalParts)
- ✅ Búsqueda y filtrado avanzado
- ✅ Comparación de precios entre proveedores
- ✅ Interfaz moderna y responsiva
- ✅ Backend con reintentos automáticos
- ✅ Desplegable en Firebase

## 🏗️ Arquitectura

```
turboShopTest/
├── client/              # Frontend React + Vite
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── pages/       # Páginas de la aplicación
│   │   ├── hooks/       # Custom hooks
│   │   └── services/    # Servicios API
│   └── dist/            # Build de producción
├── backend/             # Backend Express (desarrollo)
│   └── src/
│       ├── routes/      # Rutas API
│       └── services/    # Lógica de negocio
└── functions/           # Firebase Functions (producción)
    ├── routes/
    ├── services/
    └── index.js
```

## 🚀 Despliegue en Firebase

### Opción 1: Despliegue Rápido

Sigue la guía en [`QUICK_DEPLOY.md`](QUICK_DEPLOY.md) (5 minutos)

### Opción 2: Guía Completa

Consulta [`FIREBASE_DEPLOYMENT.md`](FIREBASE_DEPLOYMENT.md) para instrucciones detalladas.

### Comandos de Despliegue

```bash
# Instalar dependencias
npm run install:all

# Desplegar todo (hosting + functions)
npm run deploy

# Solo frontend
npm run deploy:hosting

# Solo backend
npm run deploy:functions

# Emuladores locales
npm run emulate
```

## 💻 Desarrollo Local

### Backend (Express)

```bash
cd backend
npm install
npm run dev
```

El servidor estará en `http://localhost:3000`

### Frontend (React + Vite)

```bash
cd client
npm install
npm run dev
```

La aplicación estará en `http://localhost:5173`

## 📡 Endpoints API

### Producción (Firebase)
- `https://turboshoptest.web.app/api/health` - Health check
- `https://turboshoptest.web.app/api/catalog` - Catálogo
- `https://turboshoptest.web.app/api/products/:sku` - Detalle

### Desarrollo (Local)
- `http://localhost:3000/api/health`
- `http://localhost:3000/api/catalog`
- `http://localhost:3000/api/products/:sku`

## 🔧 Tecnologías

### Frontend
- React 18
- React Router v6
- Vite
- CSS3

### Backend
- Node.js 18
- Express
- Axios
- Firebase Functions

### Cloud
- Firebase Hosting
- Firebase Functions
- Firebase CLI

## 📊 Variables de Entorno

### Backend (Firebase Functions)

```bash
firebase functions:config:set providers.base_url="https://web-production-84144.up.railway.app"
```

### Frontend

El frontend detecta automáticamente el entorno:
- **Desarrollo**: `http://localhost:3000`
- **Producción**: `https://turboshoptest.web.app/`

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd client
npm test
```

## 📝 Documentación Adicional

- [`API_DOCUMENTATION.md`](backend/API_DOCUMENTATION.md) - Documentación de la API
- [`DEPLOYMENT.md`](backend/DEPLOYMENT.md) - Despliegue en Railway
- [`TESTING.md`](backend/TESTING.md) - Guía de testing
- [`FIREBASE_DEPLOYMENT.md`](FIREBASE_DEPLOYMENT.md) - Despliegue en Firebase

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver el archivo LICENSE para más detalles

## 👥 Autores

TurboShop Team

## 🙏 Agradecimientos

- Proveedores de autopartes
- Firebase por el hosting gratuito
- Comunidad de React y Node.js
