# Documentación del Proyecto SupplyChainTracker2

Este documento proporciona una visión general de la estructura de la documentación para el proyecto de trazabilidad de netbooks.

## Estructura de Documentación

La documentación del proyecto está organizada en la siguiente estructura:

```
docs/
├── architecture.md          # Arquitectura general del sistema
├── contract-structure.puml # Diagrama de estructura de contratos (PlantUML)
├── deployment-configuration.md # Configuración de despliegue y variables de entorno
├── ui-implementation.md     # Implementación de la interfaz de usuario
├── role-management-implementation.md # Implementación del sistema de roles
├── api-reference.md         # Referencia de la API
├── troubleshooting.md        # Guía de solución de problemas
└── README.md                # Este archivo
```

## Guías Principales

- **Configuración de Despliegue**: `deployment-configuration.md`
  - Detalla las variables de entorno necesarias
  - Instrucciones para generar ABIs
  - Proceso de despliegue en Anvil

- **Arquitectura del Sistema**: `architecture.md`
  - Visión general de la arquitectura
  - Componentes principales
  - Flujo de datos

- **Implementación de UI**: `ui-implementation.md`
  - Componentes de la interfaz de usuario
  - Diseño responsivo
  - Patrones de interacción

## Diagramas

Los diagramas del sistema se mantienen en formato PlantUML para facilitar la edición y visualización. Los principales diagramas incluyen:

- `contract-structure.puml`: Estructura del contrato inteligente
- `architecture.puml`: Arquitectura general del sistema

## Actualización de Documentación

Cuando se realicen cambios significativos en el sistema, asegúrese de actualizar la documentación correspondiente:

1. Modificaciones en variables de entorno → Actualizar `deployment-configuration.md`
2. Cambios en la arquitectura → Actualizar `architecture.md`
3. Nuevos componentes de UI → Actualizar `ui-implementation.md`
4. Cambios en roles o permisos → Actualizar `role-management-implementation.md`