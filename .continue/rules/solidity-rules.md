
# Reglas de uso de solidity



## Intruciones de uso del workspace projecto 

1. inicializa el projecto con el comando foundry en el directorio stablecoin/sc
2. usa en todo momento el directorio **sc** como workspace para este desarrollo
3. usa siempre  las herramientas basadas en foundry
4. usa siempre las convenciones de desarrollo de solidity
5. tienes que hacer los procesos para mantener la coherencia en el desarrollo y el codigo
6. presta especial atencion en los imports de los contratos, en esta version de solidity son de la siguiente manera 
7. tienes que tener en cuenata que la forma los **imports** , cambio, para versiones actuales de solidity.
8. ejecuta los comandos que sean necesarios
9. crea los archivos necesarios para este projecto, siguiendo los estandares de solidity


## criterios a utilizar en el proyecto
  1. utiliza el directorio sc, el proyecto ya esta inicializado con foudry
  2. siempre ten encuenta la forma mas eficiente de implementacion para optimizar gas
  3. el desarrollo al estar en modo de prueba usa foundry para las comprobasiones
  4. el licensiamiento va a ser siempre **SPDX-License-Identifier: MIT**
  5. tienes que tener en cuenata que la forma de importar, cambio, para versiones actuales de solidity.
  6. realiza test de **funcionalidad**
  7. realiza test de **seguridad exhaustivo**, Fuzzing Reentrancy
   
## reportes
 - utiliza el directorio **./docs**, para todos los reportes que generes que sean en markdown
 - usa siempre el criterio de ser especifico y detallado en los reportes
 - genera reportes de uso de gas, por funcion y de todo de la ejecucion de todo el contrato 
 - genera los reportes bien formateados
 - describe la estructura del contrato en un uml
 - describe cada archivo generado y el contrato y las funcionalidades que fueron definidas 

 


## razonamiento de desarrollo e implementacion
 
  - siempre manten el criterio de que estas desarrollando y tienes que comprobar lo que realizas
  - usa siempre los criterios de desarrollo en solidity 0.8.19
  - usa el comando **forge test --force** y **forge build** para matener la consistencia del proyecto
  - se muy exaustivo en la generacion de test tanto funcionales como de seguridad
  - no omitas los ningun tipo de advertencia/warning en los test
  - crea un script en de deploy de solidity, usando la primera direccion de anvil 
  - crea en el directorio pricipal por fuera del directorio sc, para crear el deploy de los contratos
  - crea un archivo variables.txt, con los datos del deploy del contrato



