# ⚠️ Error: Origin not found on Allowlist - WalletConnect/Reown

## 📍 Problema Detectado

Durante la ejecución de `useUserRoles.ts`, se detectó el siguiente error crítico:

```
CRITICAL: Origin http://localhost:3000 not found on Allowlist. Please update your configuration on cloud.reown.com
```

Este error ocurre cuando el proyecto intenta conectarse a WalletConnect/Reown y el dominio `http://localhost:3000` no está registrado en la lista blanca (allowlist) del proyecto.

## 🔍 Causa Raíz

WalletConnect (ahora Reown) requiere que todos los orígenes (dominios) que usen su servicio estén previamente registrados en el panel de control de [cloud.reown.com](https://cloud.reown.com). Esto es un mecanismo de seguridad para prevenir el uso no autorizado de las credenciales del proyecto.

## 🛠️ Solución Recomendada

### Paso 1: Acceder al Dashboard de Reown

1. Visita [https://cloud.reown.com](https://cloud.reown.com)
2. Inicia sesión con tus credenciales
3. Navega a tu proyecto correspondiente

### Paso 2: Agregar Origen a la Allowlist

1. Busca la sección **"Project Settings"** o **"AppKit Configuration"**
2. Encuentra la opción **"Origin Allowlist"** o **"Domain Allowlist"**
3. Agrega los siguientes orígenes:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - `http://localhost:3001` (si usas otro puerto)
   - `https://tu-dominio.com` (para producción)

4. Guarda los cambios

### Paso 3: Verificar Variables de Entorno

Asegúrate de que en `.env.local` tengas definida la variable:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu_id_de_proyecto_aquí
```

### Paso 4: Reiniciar la Aplicación

```bash
cd web
npm run dev
```

## 📌 Prevención Futura

Si planeas desplegar en otros entornos (staging, preview, producción), asegúrate de agregar todos los dominios correspondientes a la allowlist:

- `https://myapp-staging.com`
- `https://myapp-git-branchname.vercel.app`
- `https://myapp.com`

## 🔗 Recursos

- [Documentación Oficial de Allowlist - Reown](https://docs.reown.com/appkit/advanced/origin-allowlist)
- [Guía de Configuración de Proyectos - Reown](https://docs.reown.com/appkit/getting-started/installation)
- [Soporte y Community - Discord](https://discord.gg/reown)

> **Nota**: Este error no puede resolverse desde el código. Requiere acción manual en el dashboard de Reown.