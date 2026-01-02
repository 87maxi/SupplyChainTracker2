# Refactor datos de netebook

## Descripocion del proyecto
1. es una aplicacin de trazabilidad, que tiene distintas etapas
2. las etapas de la trazabilidad son:
   - FABRICADA
   - HW_APROBADO
   - SW_VALIDADO
   - DISTRIBUIDA
3. hay roles definidos por etapas, y los roles son solicitados y aprobados por el administrador
4. la cuenta administrador es la primera cuenta de anvil




## manejos de datos por roles

1. la cadena de trazabilidad es Flujo completo FABRICADA→HW_APROBADO→SW_VALIDADO→DISTRIBUIDA
2. los datos se almacenan en formato json
3. los datos son consecutivos, de manera que el hash de la transaccion de fabricada va a pasar a la siguiente etapa que seria hw_aprobado, y asi sucesivamente
4. los datos recuperados de la transacion anterior se guardan en la transaccion actual, y asi sucesivamente




## Smartcontract Solidity funciones de la cadena de trazabilidad

- **los valores de data se hace la trazabilidad por el hash de la transaccion**
- **`getData(hash)`**: Devuelve la estructura completa de la netbook, incluyendo todos los datos registrados en cada etapa. Es la base del reporte final de trazabilidad.
- **`getDataState(hash)`**: Devuelve únicamente el estado actual de la netbook, útil para validaciones rápidas o interfaces de usuario.