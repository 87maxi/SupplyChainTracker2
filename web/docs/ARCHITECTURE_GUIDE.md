# Arquitectura Web3 - Guía de Implementación

## 🏗️ Arquitectura Híbrida Cliente-Servidor

### **Problema Identificado**
Las funciones de escritura (`grantRole`, `revokeRole`, etc.) **NO funcionan en el servidor** porque requieren:
- Una wallet con fondos para firmar transacciones
- Una clave privada (que nunca debe exponerse en el servidor)
- Interacción directa con la wallet del usuario

### **Solución Implementada**

#### 1. **Lecturas desde Servidor (SSR)**
```typescript
// Servidor puede hacer lecturas sin wallet
const netbooks = await contract.read.getAllSerialNumbers();
const userRoles = await contract.read.hasRole(role, address);
```

#### 2. **Escrituras desde Cliente**
```typescript
// Cliente firma transacciones con wallet del usuario
const { hash } = await contract.write.grantRole({
  account: userAddress,
  role: FABRICANTE_ROLE
});
```

## 📁 Estructura de Archivos Clave

### **Configuración Wagmi**
- `src/lib/wagmi/config.ts` - Configuración SSR con chains
- `src/lib/wagmi/connectors.ts` - Conectores de wallets
- `src/lib/wagmi/useWeb3.ts` - Hook personalizado

### **Servicios de Contrato**
- `src/services/SupplyChainService.ts` - Funciones principales
- `src/services/RoleApprovalService.ts` - Gestión de roles
- `src/services/TransactionManager.ts` - Manejo de transacciones

### **Componentes de Contrato**
- `src/components/contract/RoleManager.tsx` - UI para gestión de roles
- `src/components/contract/TransactionStatus.tsx` - Estado de transacciones

## 🔧 Implementación Correcta

### **Desde el Cliente (Componentes React)**
```typescript
import { useAccount, useWriteContract } from 'wagmi'

function RoleManager() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  const grantRole = async (userAddress: string, role: string) => {
    try {
      const hash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: SUPPLY_CHAIN_ABI,
        functionName: 'grantRole',
        args: [role, userAddress]
      })
      // Mostrar estado de transacción
    } catch (error) {
      console.error('Error granting role:', error)
    }
  }
}
```

### **Desde el Servidor (API Routes)**
```typescript
// app/api/rpc/route.ts
import { createPublicClient, http } from 'viem'
import { anvilChain } from '@/lib/wagmi/config'

export async function POST(request: Request) {
  const client = createPublicClient({
    chain: anvilChain,
    transport: http()
  })

  // Solo operaciones de lectura
  const netbooks = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getAllSerialNumbers'
  })

  return Response.json({ netbooks })
}
```

## 🚫 Lo que NO se debe hacer

### **Error Común**
```typescript
// ❌ NUNCA hacer esto en el servidor
const privateKey = process.env.PRIVATE_KEY
const wallet = new Wallet(privateKey)
await contract.connect(wallet).grantRole(role, address)
```

### **Problemas de esta aproximación**
1. **Exposición de clave privada**
2. **Transacciones no firmadas por el usuario real**
3. **Problemas de seguridad graves**
4. **Falta de consentimiento del usuario**

## ✅ Mejores Prácticas

### **1. Validación en Cliente**
```typescript
// Verificar permisos antes de ejecutar
const hasAdminRole = await contract.read.hasRole(
  DEFAULT_ADMIN_ROLE, 
  userAddress
)
```

### **2. Manejo de Estados**
```typescript
// Usar estados de carga y error
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string>()

const handleGrantRole = async () => {
  setIsLoading(true)
  setError(undefined)
  try {
    await grantRole(userAddress, role)
  } catch (err) {
    setError(err.message)
  } finally {
    setIsLoading(false)
  }
}
```

### **3. Feedback al Usuario**
```typescript
// Mostrar estado de transacción
<TransactionStatus 
  hash={transactionHash}
  onSuccess={() => refreshData()}
  onError={(error) => showError(error)}
/>
```

## 🌐 Flujo Completo de una Transacción

1. **Usuario** hace clic en "Grant Role" en la UI
2. **Cliente** verifica permisos (lectura desde servidor)
3. **Wallet** muestra popup para firmar transacción
4. **Usuario** firma la transacción
5. **Blockchain** procesa la transacción
6. **UI** muestra estado pendiente/completado/error
7. **Datos** se actualizan automáticamente

## 🔒 Consideraciones de Seguridad

### **Variables de Entorno**
```
# ✅ Correcto - Solo URLs públicas
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# ❌ Peligroso - Nunca en frontend
PRIVATE_KEY=tu_clave_privada
MNEMONIC=tu_frase_secreta
```

### **Validación de Permisos**
Siempre verificar roles en el contrato antes de mostrar opciones de UI:
```typescript
const canGrantRoles = await contract.read.hasRole(
  DEFAULT_ADMIN_ROLE, 
  userAddress
)
```

## 🧪 Testing

### **Tests Unitarios**
```typescript
// Mock de wagmi para testing
vi.mock('wagmi', () => ({
  useAccount: () => ({ address: '0x123...' }),
  useWriteContract: () => ({ writeContract: mockWriteContract })
}))
```

### **Tests de Integración**
```typescript
// Verificar flujo completo
test('should grant role and update UI', async () => {
  render(<RoleManager />)
  await user.click(screen.getByText('Grant Role'))
  expect(mockWriteContract).toHaveBeenCalledWith(...)
})
```

---

**Nota**: Esta arquitectura garantiza que todas las transacciones sean firmadas por el usuario real desde su wallet, manteniendo la seguridad y descentralización de la aplicación web3.