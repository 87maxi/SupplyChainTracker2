---
globs: |-
  **/*.ts
  **/*.tsx
description: >-
  Las transacciones en redes locales como Anvil pueden fallar por timeouts. Se
  debe implementar:

  1. Timeouts configurables por tipo de operación

  2. Reintentos automáticos con backoff exponencial

  3. Feedback claro al usuario sobre el estado de la transacción

  4. Opción de cancelar transacciones pendientes
alwaysApply: true
---

Implementar manejo robusto de timeouts en transacciones blockchain con reintentos automáticos y feedback claro al usuario