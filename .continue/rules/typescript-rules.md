---
name: typescript-rules
description: descripcion de la metodologia de desarrollo y debug
invokable: false
---





## TypeScript y Estándares de Codificación


**1. utiliza el workspace ./web:** 
   - en el directorio ./web ya esta inicializado el proyecto de nextjs
   - el proyecto tiene los paquetes principales para esta tarea
   - analiza el pakage.json para constatar los paquetes instalados 
   - manten siempre la consistencia de una plataforma web3
   - las dependencias estan instaladas, si necesitas ver las dependecias disponibles usa el package.json


**2. Tipado Riguroso (TypeScript):**
   - Siempre utiliza **tipos explícitos** para argumentos de funciones, retornos y variables de estado (`useState`).
   - nunca uses **any**. Prefiere los tipos de utilidad (Partial, Omit, Record) sobre la redefinición.
   - **TypeScript** - usa typescript de manera tigurosa el tipado de varible, por ningun motivo uses **any**


**3. Diseño de Interfaz (Responsividad):**
   - **Responsivo por Defecto:** Todo el código de UI debe ser diseñado utilizando ese enfoque 
   - **Responsividad** Utiliza las utilidades de diseño clases de Tailwind se muy riguroso con la definiciones de css, 
   - **interfaz ui/ux** se adapte correctamente a dispositivos móviles, tabletas y escritorios.
   - **usabilidad del proyecto** usa componetes de **componentes de shadcn** para que la aplicacion se intuitiva para el usuario

**4. definicion de funciones**
   - utiliza las funciones de anvil para crear los archivos abi
   - crea dentro del proyecto web un directorio contracts
   - dentro del directorio contracts genera los archivos abi en formato json
   - analiza la funciones que existen en el directorio dontracts
   - utiliza la fuinciones analizadas para implementar en la aplicacion web 
   - utiliza funcionalidades azyncronas para mejor interacion con el usuario


## Pruebas y Consistencia de Código

**1. Testing Funcional (Unitario y de Integración):**
   - **Cobertura Mínima:** Las funciones críticas, especialmente las de **interacción con Web3 (contratos)** 
   - **Librerías:** Utiliza **Jest** para pruebas unitarias y **Testing Library (React)** para pruebas de componentes.
   - **jest:** configura jest de manera consistente para el requerimiento para hacer test de los componentes y funcionalides
   - **anvil:** el objetivo de esta interfaz es interactuar con anvil, usa las cuentas de anvil para pruebas 

**2. Consistencia de Código:**
   - **Formato:** El código debe seguir las reglas definidas por **ESLint** y **Prettier**.
   - **Nomenclatura:** Utiliza **CamelCase** para variables y funciones, y **PascalCase** para componentes y tipos.
   - **Comentarios:** Documenta funciones y tipos complejos usando **TSDoc** (o JSDoc),  generar documentación de forma consistente.
   - **Reporte** generar un u directorio si no existe docs, si es que no existe  donde se describa todas las funcionalidades realizadas y una descripcion funcional del codigo
   - genera un **archivo .env.local** con todas las variables necesarias para iniciar la aplicacion
   - se consistente con la implementacion de package.json, define claramente todos los comandos necesarios para poder ejecutar la aplicacion **se muy extricto en esta definicion y en el uso** chequea que los comandos funcionen correctamente
   - dentro del directorio docs crea  un diagrama fucional de la aplicacion, y diagrama uml con las definiciones funcionales


## Herramientas que se utilizan 
 - para la interacion con solidity se utiliza anvil
 - utiliza anvil para crear el **ABI en el directorio contracts**
 - utiliza siempre cuentas de anvil, en la definicion del .env.local
 - utiliza las herramientas que se utilizan con foundry
 - analiza los abi que estan  utiliza como gia, para la implementacion de las funcionalidades
 - las coneccion a la wallet es siempre 
 - utiliza ethers como libreria para el manejo de la wallet
 - utiliza la conexion a la wallet de manera agnostica, que se pueda implementar con la wallet que este en la extencion  del browser
