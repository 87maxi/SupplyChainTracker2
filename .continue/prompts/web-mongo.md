# web conectar a mongo


## objetivos
 1. configurar mongodb con npm, no use moongose en la aplicacion web
 2. es un proyecto web3 dapp de trazabilidad de netbooks educativas
 3. analisa los proyecto sc, son smartcontracts en solidity
 4. analisa los proyectos web, son dapps en nextjs
 5. integra mongo con la aplicacion web
 6. almacena los datos que se carga por cada role
 7. busca la mejor manera de integrar los datos en los documentos de mongo
 8. si existe alguna instalacion previa de ipfs, elimina todo lo referido a esa implementacion
 9. usa un hash para referenciar cada transacion
 10. cada role puede ver los datos cargados por otros role, pero solo puede editar los datos de su propio role
 11. mantene el flujo de la implementacion actual de la aplicacion
 12. optimiza el consumo de gas en los smartcontract eliminando transacciones inecesarias
 13. usa en lo que sea necesario localstorage como strategia para mejorar la ui/ux
 14. el objetibo de esto es solo mantener los datos cargados por cada rol, no otros datos
 15. si existe un docker-compose.yml, modificalo o crealo para agregar el servicio de mongo
 16. usa el .env.example para crear las variables que implementa el docker-compose.yml
 17. en el proyecto web no uses npm run dev, ni ejecutes servicios demonizados
 18. agrega si es necesario sitemas de lint para chequear integridad de el codigo typescript
 19. usa siempre herramientas de chequeo de integridad de codigo para evitar erores de malformato en jsx y ts 
 20. mantene la librerias ya instaladas busca que todas la librerias que agregues sean compatibles con las que estan definidas
 21. tene como objetivo mejorar las iteracciones con la blockchain,elimina todo tipo de llamadas inecesarias
