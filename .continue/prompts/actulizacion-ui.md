# Web Admin Platform

## seccion admin
 1. con el rol de admin tiene que poder ver las auditorias de las netbooks
 2. visualizar los analitics con datos de mongodb fake
 3. actualizar el componente "roles de usuario" en la seccion de solicitudes de rol
 4. actualizar el componente "estado de las netbooks" en la seccion de solicitudes de rol
 5. actualizar los datos en los componentes de contadores en las distintas etapas de la trazabilidad
 6. actualizar los datos en los componentes de contadores de usuarios por rol
 7. completar la coneccion con los datos de mongo en la seccion registro de auditoria
 8. en la seccion solicitudes de rol, en el panel mejorar los marjenes entre los components


 ## el dashboard 
  1. mejorar la el listado de tareas, las dimenciones de la filas es muy desproporcionada
  2. los componentes de los contadores no estan actualizados
  3. **admin** no puede filtrar por estado de la netbook
  4. agrega en las filas columnas para ver datos de las netbooks



## Rol

 1. integrar los formularios de cada rol para que guarden los datos
 2. organizar la estructura de datos en los documentos de mongo para poder seguir el estado de la traza
 3. poder verificar los datos de las etapas anteriores a el rol que le toca la auditoria
 4. verificar los formularios esten insertando los datos persitiendo los datos en mongodb
 5. implementa select en los formularios para limitar tener mejor consistencia en los datos
 7. en los campos donde los valores no deben tener mucha opcines, pone valores mas estaticos, con un select o alguna alternativa segun el caso
 8. tienes que hacer que la transaccion sea firmada por la wallet del auditor, y el hash de retorno vincularlo con los datos que se insertan en mongodb
 9. verifica que los datos en mongodb sean consistentes con los datos que se insertan en los formularios
 10. verifica que el hash de los datos insertados en la blockcahin por el usuario sea el mismo que el hash que se inserta en mongodb
 11. tienes que tener en cuenta que los datos son inmutables, no puedes modificarlos, solo puedes crearlos
 12. cada insercion tiene que estar firmada por la wallet, y tener registro en la blockchain del hash de la transaccion 
 13. tener vinculados los datos de la traza de cada netbook con un uuid para tener una referencia unica de la netbook
 14. mantener simpre este uuid durante toda la traza de la netbook
 
 
 

 


