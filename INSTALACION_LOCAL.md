# Instalación Tienda de Puntos - PC Local

## Requisitos
- Node.js 18+ instalado (https://nodejs.org)
- 2 terminales (PowerShell o CMD)

## Instalación (una sola vez)

```bash
# Clonar o descargar repo
git clone https://github.com/villaloboslote322/tienda-puntos.git
cd tienda-puntos

# Backend: instalar dependencias
cd backend
npm install

# Frontend: instalar dependencias (otra terminal)
cd web-admin
npm install
```

## Ejecutar (cada día que uses)

**Terminal 1 - Backend:**
```bash
cd tienda-puntos/backend
npm run dev
# Verás: "Server running on port 3001"
```

**Terminal 2 - Frontend:**
```bash
cd tienda-puntos/web-admin
npm run dev
# Verás: "Local: http://localhost:3000"
```

## Acceder

**Admin (tu PC):**
- URL: http://localhost:3000
- Email: admin@test.com
- Password: password123

**Clientes (otra PC/tablet en tu red):**
- Averigua IP de tu PC: 
  ```bash
  ipconfig | findstr "IPv4"
  ```
  Ej: `192.168.1.100`
- Clientes acceden a: `http://192.168.1.100:3000`
- Se registran con WhatsApp + DNI

## Datos

- Todos los datos se guardan en: `backend/prisma/dev.db`
- Es un archivo SQLite, puedes hacer backup copiándolo

## Primeros pasos

1. Levanta backend + frontend (arriba)
2. Accede a admin con credenciales arriba
3. Crea clientes o usa seed: `npx ts-node backend/seed.ts`
4. Asigna puntos via dashboard
5. Clientes ven puntos en app

## Problemas

**"Port 3000/3001 already in use":**
- Cambia puerto en code o cierra app que use ese puerto

**"npm: command not found":**
- Node.js no instalado, descarga e instala

**Datos se perdieron:**
- Eliminaste `backend/prisma/dev.db`
- Créalo de nuevo: `npx ts-node backend/seed.ts`
