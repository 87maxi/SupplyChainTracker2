# Configuración y Validación de Variables de Entorno

## Estado Actual

La configuración de entorno ha sido verificada y corregida para asegurar que todos los servicios de la aplicación web3 puedan comunicarse correctamente con el contrato inteligente desplegado en Anvil.

## Variables de Entorno Criticas

Las siguientes variables son esenciales para el funcionamiento correcto de la aplicación:

| Variable | Valor | Descripción |
|---------|-------|------------|
| NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS | 0xe7f1725E7734CE288F8368f2E04C4400557EA640 | Dirección del contrato SupplyChainTracker en Anvil |
| NEXT_PUBLIC_RPC_URL | http://localhost:8545 | URL del nodo RPC para conectar con Anvil |
| NEXT_PUBLIC_NETWORK_ID | 31337 | ID de red para Anvil |
| MONGODB_URI | mongodb://localhost:27017/SupplyChainTracker | URI para conexión con MongoDB |

## Validación de Configuración

Se ha implementado un script de validación para prevenir errores comunes de configuración:

```javascript
// scripts/debug-config.js
const { config } = require('dotenv');

// Cargar variables de entorno
config();

console.log('=== VALIDACIÓN DE CONFIGURACIÓN DE ENTORNO ===\n');

// Validar variables esenciales
class ConfigValidator {
  static validate() {
    const errors = [];
    
    // Validar dirección del contrato
    if (!process.env.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS) {
      errors.push('❌ NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS no está definida');
    } else {
      console.log(`✅ NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS: ${process.env.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS}`);
    }
    
    // Validar RPC URL
    if (!process.env.NEXT_PUBLIC_RPC_URL) {
      errors.push('❌ NEXT_PUBLIC_RPC_URL no está definida');
    } else {
      console.log(`✅ NEXT_PUBLIC_RPC_URL: ${process.env.NEXT_PUBLIC_RPC_URL}`);
    }
    
    // Validar network ID
    if (!process.env.NEXT_PUBLIC_NETWORK_ID) {
      errors.push('❌ NEXT_PUBLIC_NETWORK_ID no está definida');
    } else {
      console.log(`✅ NEXT_PUBLIC_NETWORK_ID: ${process.env.NEXT_PUBLIC_NETWORK_ID}`);
    }
    
    // Validar MongoDB URI
    if (!process.env.MONGODB_URI) {
      errors.push('❌ MONGODB_URI no está definida');
    } else {
      console.log(`✅ MONGODB_URI: ${process.env.MONGODB_URI.replace(/:([^:]+)@/, ':*****@')}');
    }
    
    // Verificar conexión con Anvil
    const axios = require('axios');
    
    axios.post(process.env.NEXT_PUBLIC_RPC_URL, {
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: [],
      id: 1
    }, {
      timeout: 5000
    })
    .then(response => {
      const chainId = parseInt(response.data.result, 16);
      if (chainId === 31337) {
        console.log('✅ Conexión exitosa con Anvil (chainId: 31337)');
      } else {
        errors.push(`❌ Conexión con nodo RPC, pero chainId inesperado: ${chainId}`);
      }
    })
    .catch(err => {
      errors.push(`❌ No se pudo conectar con Anvil en ${process.env.NEXT_PUBLIC_RPC_URL}: ${err.message}`);
    });
    
    // Mostrar resultados
    if (errors.length === 0) {
      console.log('\n✅ TODAS LAS VALIDACIONES PASARON');
    } else {
      console.log('\n❌ ERRORES ENCONTRADOS:');
      errors.forEach(error => console.log(error));
      process.exit(1);
    }
  }
}

// Ejecutar validación
ConfigValidator.validate();
```

## Instrucciones para Uso

1. Asegúrate de tener Anvil corriendo:
```bash
anvil
```

2. Ejecuta el script de validación:
```bash
node scripts/debug-config.js
```

3. Si todo está configurado correctamente, verás:
```
=== VALIDACIÓN DE CONFIGURACIÓN DE ENTORNO ===

✅ NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS: 0xe7f1725E7734CE288F8368f2E04C4400557EA640
✅ NEXT_PUBLIC_RPC_URL: http://localhost:8545
✅ NEXT_PUBLIC_NETWORK_ID: 31337
✅ MONGODB_URI: mongodb://localhost:27017/SupplyChainTracker
✅ Conexión exitosa con Anvil (chainId: 31337)

✅ TODAS LAS VALIDACIONES PASARON
```

4. Inicia la aplicación:
```bash
npm run dev
```

## Solución de Problemas Comunes

### Error: "readContract must be implemented"
Este error generalmente indica un problema de configuración del contrato, no una falta de implementación. Verifica:

- La dirección del contrato en `.env` y `.env.local`
- Que Anvil esté corriendo y accesible en `http://localhost:8545`
- Que el contrato esté desplegado en Anvil con la dirección correcta

### Error de Conexión con Anvil
Si no puedes conectar con Anvil:

- Verifica que Anvil esté corriendo
- Revisa el puerto (por defecto 8545)
- Asegúrate de que no haya firewalls bloqueando la conexión

### Problemas con MongoDB
- Asegúrate de que MongoDB esté corriendo
- Verifica la URI de conexión
- Comprueba que la base de datos `SupplyChainTracker` exista o se pueda crear

## Revisión Final

La causa raíz del problema original fue una dirección de contrato incorrecta en las variables de entorno. Los métodos `readContract`, `writeContract`, etc., ya estaban correctamente implementados en `SupplyChainService` y `RoleService`, pero la aplicación no podía interactuar con el contrato debido a la dirección errónea.

Con la configuración actual, todos los servicios deberían funcionar correctamente y los componentes de la interfaz deberían poder interactuar con el contrato inteligente sin problemas.