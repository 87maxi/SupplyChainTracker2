# SOLUCIÓN AL ERROR "EXECUTION REVERTED" EN ANVIL

## DIAGNÓSTICO DEL PROBLEMA

El error "Execution error: execution reverted" con la firma de función `0x313ce567` (función `name()` de ERC-20) ocurre porque:

1. **Nuestro contrato SupplyChainTracker NO es un token ERC-20**
2. **No implementa la función `name()`**
3. **Algún componente está intentando llamar a funciones ERC-20 en nuestro contrato**

## SOLUCIÓN IMPLEMENTADA

### 1. Verificación del Despliegue
- ✅ Contrato correctamente desplegado en: `0x0165878A594ca255338adfa4d48449f69242Eb8F`
- ✅ Todas las funciones de SupplyChainTracker están operativas
- ✅ Las funciones de roles, control de acceso y trazabilidad funcionan correctamente

### 2. Identificación del Problema
- ❌ Alguna herramienta/billetera está llamando a `name()` (0x313ce567)
- ❌ Esta función no existe en nuestro contrato
- ✅ El contrato en sí está funcionando perfectamente

## PASOS PARA PREVENIR EL ERROR

### 1. Identificar la Fuente
```bash
# Verificar qué está llamando a la función name()
# Revisar:
# - Conexiones de billetera (algunas auto-detectan tokens)
# - Código frontend que llama al contrato
# - Bibliotecas que asumen interfaz ERC-20
```

### 2. Corregir la Implementación
- Solo llamar a funciones que existen en el ABI de SupplyChainTracker
- Agregar verificaciones de interfaz antes de llamar a funciones
- Usar bloques try/catch para manejo de errores

### 3. Verificar la Solución
```bash
# Ejecutar scripts de verificación
cd web
node scripts/verify-correct-contract-functions.cjs
```

## FUNCIONES DISPONIBLES EN SUPPLYCHAINTRACKER

### Funciones de Roles
- `DEFAULT_ADMIN_ROLE()`
- `FABRICANTE_ROLE()`
- `AUDITOR_HW_ROLE()`
- `TECNICO_SW_ROLE()`
- `ESCUELA_ROLE()`

### Funciones de Control de Acceso
- `hasRole(role, account)`
- `getRoleMemberCount(role)`
- `getRoleMember(role, index)`
- `getAllMembers(role)`

### Funciones de Trazabilidad
- `getAllSerialNumbers()`
- `getNetbookState(serial)`
- `getNetbookReport(serial)`

## FUNCIONES NO DISPONIBLES (CAUSA DEL ERROR)

### Funciones ERC-20 (NO implementadas)
- `name()` ← **Causa del error**
- `symbol()`
- `balanceOf()`
- `transfer()`
- `approve()`
- `allowance()`

## CONCLUSIÓN

✅ **El contrato está funcionando correctamente**
❌ **El error ocurre cuando se intentan llamar funciones ERC-20**
💡 **Solución: Asegurar que solo se llamen funciones de SupplyChainTracker**

## COMANDOS ÚTILES PARA VERIFICACIÓN

```bash
# Verificar estado del contrato
cd web
node scripts/complete-contract-check.cjs

# Verificar funciones correctas
node scripts/verify-correct-contract-functions.cjs

# Probar llamada problemática
node scripts/test-erc20-name-call.cjs
```

## PRÓXIMOS PASOS

1. Revisar el código frontend para identificar llamadas incorrectas
2. Verificar configuración de billeteras
3. Asegurar que todas las interacciones usen solo funciones de SupplyChainTracker
4. Implementar manejo de errores adecuado
