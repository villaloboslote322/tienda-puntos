#!/bin/bash

# Setup script para Tienda de Puntos

echo "=== Tienda de Puntos - Setup Automático ==="

# Backend
echo "1. Instalando backend..."
cd backend
npm install
npx prisma generate
echo "✓ Backend listo"

# Frontend
echo "2. Instalando frontend..."
cd ../web-admin
npm install
echo "✓ Frontend listo"

echo ""
echo "=== Setup completado ==="
echo ""
echo "Próximos pasos:"
echo "Terminal 1: cd tienda-puntos/backend && npm run dev"
echo "Terminal 2: cd tienda-puntos/web-admin && npm run dev"
echo ""
echo "Luego accede a: http://localhost:3000"
echo "Admin: admin@test.com / password123"
