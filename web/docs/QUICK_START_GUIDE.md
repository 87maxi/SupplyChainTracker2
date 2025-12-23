# Guía de Inicio Rápido - Sistema de Trazabilidad Web3

## 🚀 Comenzando en 5 Minutos

### **Prerrequisitos**
- Node.js 18+
- Foundry (forge, anvil, cast)
- MetaMask u otra wallet Web3

### **1. Instalar Dependencias**
```bash
# Instalar dependencias del frontend
cd web
npm install

# Instalar dependencias de contratos (si es necesario)
cd ../sc
forge install
```

### **2. Iniciar Blockchain Local**
```bash
# Terminal 1 - Iniciar Anvil
cd sc
anvil
# Anvil iniciará en http://localhost:8545 con cuentas pre-fundadas
```

### **3. Desplegar Contrato**
```bash
# Terminal 2 - Desplegar contrato (si no está desplegado)
cd sc
forge script script/Deploy.sol --broadcast --rpc-url http://localhost:8545

# O usar script existente
./deploy_anvil.sh
```

### **4. Configurar Variables**
```bash
# Copiar archivo de ejemplo (si no existe)
cp EXAMPLE.env .env.local

# Configurar variables en .env.local:
NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_NETWORK_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### **5. Generar ABI**
```bash
# Generar ABI del contrato
npm run abi:generate

# O ejecutar manualmente
cd sc && forge inspect src/SupplyChainTracker.sol abi --json > ../web/src/contracts/abi/SupplyChainTracker.json
```

### **6. Iniciar Aplicación**
```bash
# Terminal 3 - Iniciar frontend
cd web
npm run dev

# La aplicación estará en http://localhost:3000
```

## 🔗 Conectar Wallet

1. **Abrir** http://localhost:3000
2. **Conectar Wallet** usando el botón "Connect Wallet"
3. **Cambiar Red** a "Anvil Local" (ID: 31337)
4. **Importar Cuenta** de Anvil a MetaMask:
   - Clave privada de una cuenta de Anvil
   - Las cuentas aparecen en los logs de Anvil

## 👥 Configurar Roles Iniciales

### **Como Administrador**
1. **Conectar** con la cuenta administradora (primera cuenta de Anvil)
2. **Ir a** /admin panel
3. **Otorgar roles** a otras direcciones

### **Roles Disponibles**
- `FABRICANTE_ROLE` - Registrar netbooks
- `AUDITOR_HW_ROLE` - Auditar hardware
- `TECNICO_SW_ROLE` - Validar software
- `ESCUELA_ROLE` - Asignar a estudiantes

## 📱 Flujo de Trabajo

### **1. Registrar Netbooks**
```
FABRICANTE_ROLE → /tokens/create
```

### **2. Auditar Hardware**
```
AUDITOR_HW_ROLE → /tokens/[serial] → Auditar Hardware
```

### **3. Validar Software**
```
TECNICO_SW_ROLE → /tokens/[serial] → Validar Software
```

### **4. Asignar a Estudiante**
```
ESCUELA_ROLE → /tokens/[serial] → Asignar a Estudiante
```

## 🧪 Testing

### **Tests Unitarios**
```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage
```

### **Tests de Integración**
```bash
# Test específico de aprobación de roles
npm run test:role-approval
```

## 🛠️ Comandos Útiles

### **Desarrollo**
```bash
# Build producción
npm run build

# Análisis de bundle
npm run analyze

# Linting
npm run lint
```

### **Blockchain**
```bash
# Generar ABI automáticamente
npm run abi:generate

# Monitorizar cambios en contratos
npm run abi:watch
```

### **Depuración**
```bash
# Verificar despliegue contrato
node scripts/check-contract-deployment.ts

# Verificar inicialización de roles
node scripts/check-role-initialization.ts

# Testear flujo completo
node scripts/test-frontend-final.cjs
```

## 🔍 Monitoreo y Debug

### **Logs de Transacciones**
- Las transacciones muestran hash y nonce en consola
- Estado de confirmación se actualiza automáticamente
- Errores se muestran con mensajes descriptivos

### **Herramientas de Desarrollo**
- **React DevTools** para depurar componentes
- **Wagmi DevTools** para monitorear estado Web3
- **MetaMask** para ver transacciones y cuentas

## 🚨 Solución de Problemas

### **Error: "Nonce too low"**
- El sistema maneja esto automáticamente
- Reintenta con nonce actualizado

### **Error: "User rejected"**
- Usuario rechazó la transacción en MetaMask
- Mensaje claro se muestra en UI

### **Error: "RPC connection"**
- Verificar que Anvil esté ejecutándose
- Confirmar URL RPC en configuración

### **Error: "Contract not deployed"**
- Verificar dirección del contrato
- Confirmar despliegue en Anvil

## 📊 Estructura del Proyecto

```
web/
├── src/
│   ├── app/                 # Pages de Next.js
│   ├── components/          # Componentes React
│   ├── contracts/          # ABIs y tipos
│   ├── hooks/              # Custom hooks
│   ├── lib/               # Configuración y utils
│   └── services/          # Lógica de negocio
├── scripts/               # Scripts de utilidad
└── docs/                 # Documentación

sc/
├── src/                  # Contratos Solidity
├── script/              # Scripts de despliegue
└── test/               # Tests de contratos
```

## 🌐 Producción

### **Variables de Producción**
```env
NEXT_PUBLIC_RPC_URL=https://mainnet.example.com
NEXT_PUBLIC_NETWORK_ID=1
NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS=0x...
```

### **Build Producción**
```bash
npm run build
npm start
```

### **Deploy**
- Vercel, Netlify, o cualquier hosting estático
- Asegurar configuración CORS para RPC
- Configurar dominios en WalletConnect

---

**¡Listo!** Tu aplicación Web3 de trazabilidad está funcionando. 🎉

Para más detalles, verifica la documentación completa en `/docs`.