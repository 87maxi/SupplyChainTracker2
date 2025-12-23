# Análisis de confiabilidad del script `deploy_anvil.sh`

## Problemas identificados

### 1. **Extracción frágil de la dirección del contrato**

Actualmente se usa:
```bash
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -oE '0: contract SupplyChainTracker 0x[0-9a-fA-F]{40}' | grep -oE '0x[0-9a-fA-F]{40}')
```

**Problemas**:
- Depende del formato de salida de `forge script`, que puede cambiar.
- No verifica que la transacción haya sido exitosa (status: 1).
- Puede extraer una dirección de un contrato fallido si el output lo contiene.

**Solución**: Usar el archivo JSON de broadcast y validar el estado de las transacciones.

---

### 2. **Espera fija de inicialización (`sleep 3`)**

El script asume que Anvil estará listo en 3 segundos.

**Problemas**:
- En máquinas lentas o bajo carga, Anvil puede tardar más.
- Puede fallar silenciosamente si el RPC no está listo.

**Solución**: Esperar activamente a que el puerto 8545 esté escuchando.

---

### 3. **Carga de estado sin validación**

El script carga `anvil-state.json` si existe, pero no verifica su integridad.

**Problemas**:
- Si el archivo está corrupto, Anvil puede fallar al iniciar.
- No se detecta hasta que se intenta cargar.

**Solución**: Validar que es un JSON válido antes de iniciar Anvil.

---

### 4. **Gestión de errores incompleta**

Si el despliegue falla, se mata Anvil, pero no se informa claramente el motivo.

**Solución**: Mejorar el mensajería de error y sugerir pasos de recuperación.

---

## Recomendaciones de mejora

### A. Validar archivo de estado antes de cargarlo
```bash
if [ -f "anvil-state.json" ]; then
    if ! jq empty "anvil-state.json" 2>/dev/null; then
        echo "❌ Error: anvil-state.json no es JSON válido. Se eliminará."
        rm anvil-state.json
    else
        echo "✅ Estado previo válido detectado."
    fi
fi
```

> Requiere `jq` instalado.

---

### B. Esperar activamente por el RPC
```bash
wait_for_rpc() {
    echo "🔍 Esperando a que Anvil escuche en http://localhost:8545..."
    while ! nc -z localhost 8545; do
        sleep 0.5
    done
    echo "✅ RPC disponible"
}
```

> Requiere `netcat` (`nc`).

---

### C. Extraer dirección del contrato validando estado
```bash
get_contract_address() {
    local json_file="sc/broadcast/Deploy.s.sol/31337/run-latest.json"
    
    if [ ! -f "$json_file" ]; then
        echo ""; return
    fi
    
    # Extraer dirección sólo si la transacción fue exitosa
    jq -r '.transactions[] | select(.contractAddress and .receipts[].status == "1") | .contractAddress' "$json_file" 2>/dev/null | head -1
}
```

Esto garantiza que solo se usa la dirección si:
- Existe `contractAddress`
- El estado de la transacción es `1` (éxito)

---

### D. Manejo de errores con contexto
```bash
if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Despliegue fallido o no se pudo obtener la dirección."
    echo "➡️  Acciones sugeridas:"
    echo "   1. Revisa: sc/broadcast/Deploy.s.sol/31337/run-latest.json"
    echo "   2. Ejecuta: forge script sc/script/Deploy.s.sol --rpc-url http://localhost:8545 --private-key YOUR_PK"
    echo "   3. Usa: ./cleanup_anvil.sh y reintenta"
    kill $ANVIL_PID 2>/dev/null || true
    exit 1
fi
```

---

## Conclusión

El script actual es funcional, pero **no es confiable para CI/CD ni para entornos con menos control**. Implementando estas mejoras, se gana en:
- **Confianza**: Se sabe que el despliegue fue exitoso.
- **Reproducibilidad**: Menos fallos por tiempos o estados corruptos.
- **Diagnóstico**: Errores más claros y acciones de recuperación directas.

Se recomienda crear una versión mejorada con estas mejoras.
