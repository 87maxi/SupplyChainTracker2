# Reporte de Error: Integración con Smart Contract

## Descripción del Problema

Se ha detectado un error crítico en la integración entre el frontend y el contrato inteligente SupplyChainTracker. El error principal es:

```
invalid EIP-1193 provider (argument="ethereum", value=null, code=INVALID_ARGUMENT, version=6.16.0)
```

Este error indica que la aplicación no puede establecer una conexión válida con un proveedor EIP-1193, lo que impide toda comunicación con la blockchain.

## Análisis de la Arquitectura Actual

### Contrato Inteligente

El contrato SupplyChainTracker (ABI en `web/src/contracts/abi/SupplyChainTracker.json`) expone las siguientes funciones principales:

**Funciones de Lectura (View):**
- `getNetbookReport(serial)`: Obtiene el reporte completo de una netbook
- `getNetbookState(serial)`: Obtiene el estado actual de una netbook
- `hasRole(role, account)`: Verifica si una cuenta tiene un rol específico

**Funciones de Escritura (Non-payable):**
- `registerNetbooks(serials, batches, specs)`: Registra nuevas netbooks
- `auditHardware(serial, passed, reportHash)`: Audita el hardware
- `validateSoftware(serial, version, passed)`: Valida el software
- `assignToStudent(serial, schoolHash, studentHash)`: Asigna netbook a estudiante

**Gestión de Roles:**
- `grantRole(role, account)`: Otorga un rol a una cuenta
- `revokeRole(role, account)`: Revoca un rol de una cuenta

### Servicios de Web3

La aplicación utiliza dos servicios principales para la conexión con blockchain:

1. `Web3Service` - Clase singleton que maneja la conexión y el contrato
2. `SupplyChainService` - Servicio específico que utiliza Web3Service para interactuar con SupplyChainTracker

## Diagnóstico del Error

El error se origina en la incompatibilidad entre los diferentes sistemas de gestión de conexión en el frontend:

1. **Sistema Duplicado de Conexión**: 
   - Se migró a wagmi + RainbowKit para la UI (correcto)
   - Pero los servicios de Web3 aún usan un sistema propio basado en `ethers.BrowserProvider`
   - Esto crea un conflicto de proveedores

2. **Problema en Web3Service**:
   - La clase `Web3Service` intenta crear su propio `BrowserProvider`
   - Pero no puede acceder al objeto `window.ethereum` porque wagmi ya lo está gestionando
   - Resultado: `provider` es null, causando el error EIP-1193

3. **Falta de Integración**:
   - `Web3Service` no está utilizando el `provider` o `signer` de wagmi
   - En lugar de reutilizar la conexión establecida por wagmi, intenta crear una nueva
   - Esto es imposible porque wagmi controla el acceso al proveedor

## Solución Propuesta

### 1. Integrar Web3Service con wagmi

Modificar `Web3Service` para que utilice el proveedor de wagmi en lugar de crear uno propio:

```typescript
// Modificar el constructor para aceptar provider y signer externos
setProviderAndSigner(provider: BrowserProvider, signer: ethers.Signer) {
  this.provider = provider;
  this.signer = signer;
  
  if (this.contractConfig && signer) {
    this.contract = new ethers.Contract(
      this.contractConfig.address,
      this.contractConfig.abi,
      signer
    );
  }
}
```

### 2. Conectar los Hooks de wagmi con Web3Service

En el componente principal, conectar los hooks de wagmi con Web3Service:

```typescript
// En un componente de inicialización
const { provider } = useProvider();
const { data: signer } = useSigner();

useEffect(() => {
  if (provider && signer) {
    Web3Service.setProviderAndSigner(provider, signer);
  }
}, [provider, signer]);
```

### 3. Alternativa: Migrar completamente a wagmi

La solución más robusta sería eliminar `Web3Service` y usar directamente los hooks de wagmi junto con el `useContractWrite` y `useContractRead`:

```typescript
// Reemplazar llamadas a SupplyChainService con hooks directos
const { writeContract } = useContractWrite({
  address: CONTRACT_ADDRESS,
  abi: SupplyChainTrackerABI,
  functionName: 'registerNetbooks',
})

// Uso
const register = async () => {
  writeContract({
    args: [serials, batches, modelSpecs]
  })
}
```

## Pasos de Implementación

1. Implementar `setProviderAndSigner` en `Web3Service`
2. Crear un componente de proveedor que conecte wagmi con Web3Service
3. Asegurar que `useWalletClient` proporciona un signer compatible
4. Actualizar la lógica de inicialización para esperar la conexión antes de acceder al contrato
5. Agregar manejo de errores para estados de conexión

## Impacto

Este error actualmente bloquea toda la funcionalidad de la aplicación que requiere interacción con el contrato inteligente. Sin una conexión válida, no se pueden:

- Registrar nuevas netbooks
- Auditar hardware
- Validar software
- Asignar netbooks a estudiantes
- Consultar estados o reportes

## Conclusión

El error se debe a una arquitectura híbrida incompleta, donde la UI utiliza wagmi pero la lógica de negocio todavía depende de un sistema de conexión heredado. La solución requiere integrar ambos sistemas o migrar completamente a uno solo.

*Reporte generado con [Continue](https://continue.dev)*
Generated with [Continue](https://continue.dev)

Co-Authored-By: Continue <noreply@continue.dev>