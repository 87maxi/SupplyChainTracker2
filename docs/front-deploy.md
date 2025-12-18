# Deploy del Frontend

## Descripción
Este documento detalla el deploy del frontend para el proyecto SupplyChainTracker2.

## Componentes

### Componentes Modificados
1. **Layout (app/layout.tsx)**
   - Remplazado `Web3Provider` personalizado por `WagmiProvider`, `QueryClientProvider` y `RainbowKitProvider`
   - Ahora usa el sistema completo de wagmi/rainbowkit para la gestión de conexiones de billetera

2. **Hook useWeb3 (lib/wagmi/useWeb3.ts)**
   - Creado nuevo hook que envuelve `useAccount` y `useSigner` de wagmi
   - Mantiene la interfaz compatible con el hook anterior para facilitar la migración
   - Proporciona acceso al provider, signer, address e isConnected

3. **Configuración de Wagmi (lib/wagmi/config.ts)**
   - Configuración centralizada para wagmi con soporte para múltiples cadenas
   - Integración con WalletConnect a través de projectId

### Componentes Eliminados
Se ha quitado la dependencia del contexto Web3 personalizado, ya que wagmi proporciona funcionalidad superior para la gestión de conexiones de billetera.

## Instrucciones de Deploy

1. Asegúrate de tener las variables de entorno configuradas:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   WALLETCONNECT_PROJECT_ID=tu_project_id_aqui
   ```

2. Instala las dependencias:
   ```bash
   cd web
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Accede a la aplicación en `http://localhost:3000`

## Verificación

Para verificar que el deploy fue exitoso:

1. Abre la aplicación en un navegador
2. Haz clic en el botón "Connect Wallet" en la esquina superior derecha
3. Conecta tu billetera (MetaMask, etc.)
4. Verifica que el estado de conexión se actualice correctamente
5. Confirma que el botón de desconexión funcione adecuadamente

## Consideraciones

- El projectId de WalletConnect debe ser reemplazado con uno válido en producción
- La configuración actual incluye soporte para mainnet, polygon y bscTestnet
- Se puede agregar más redes según sea necesario
- El hook useWeb3 mantiene compatibilidad hacia atrás con el código existente

## Troubleshooting

**Problema: El botón ConnectButton no aparece o no funciona**
- Verifica que las dependencias wagmi y rainbowkit estén correctamente instaladas
- Asegúrate de que el projectId de WalletConnect esté configurado
- Revisa la consola del navegador para errores

**Problema: No se muestra la dirección de la billetera conectada**
- Verifica que el hook useWeb3 esté importando desde la ruta correcta
- Confirma que WagmiProvider esté envolviendo adecuadamente todos los componentes

**Problema: Errores de tipo en el signer**
- El tipo de signer en wagmi es complejo, por eso se usa `any` temporalmente
- Considera crear un tipo más específico si es necesario para validaciones adicionales

## Estado
- [x] Migración completada
- [ ] Pruebas pendientes
- [ ] Documentación finalizada

*Deploy generado con [Continue](https://continue.dev)*
Generated with [Continue](https://continue.dev)

Co-Authored-By: Continue <noreply@continue.dev>