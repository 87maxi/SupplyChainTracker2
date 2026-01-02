// Constantes de roles para SupplyChainTracker
// Estos hashes corresponden a keccak256("ROLE_NAME") del contrato

export const ROLE_HASHES = {
  // FABRICANTE_ROLE = keccak256("FABRICANTE_ROLE")
  FABRICANTE: "0xdf8b4c520affe6d5bd668f8a16ff439b2b3fe20527c8a5d5d7cd0f17c3aa9c5d" as const,
  
  // AUDITOR_HW_ROLE = keccak256("AUDITOR_HW_ROLE")
  AUDITOR_HW: "0xed8e002819d8cf1a851ca1db7d19c6848d2559e61bf51cf90a464bd116556c00" as const,
  
  // TECNICO_SW_ROLE = keccak256("TECNICO_SW_ROLE")
  TECNICO_SW: "0x2ed8949af5557e2edaec784b826d9da85a22565588342ae7b736d3e8ebd76bfe" as const,
  
  // ESCUELA_ROLE = keccak256("ESCUELA_ROLE")
  ESCUELA: "0x88a49b04486bc479c925034ad3947fb7a1dc63c11a4fc29c186b7efde141b141" as const,
  
  // DEFAULT_ADMIN_ROLE es 0x00...00
  ADMIN: "0x0000000000000000000000000000000000000000000000000000000000000000" as const
} as const;

// Tipo para los nombres de roles
export type RoleName = keyof typeof ROLE_HASHES;

// Función para obtener el hash de un rol
export const getRoleHash = (roleName: RoleName): `0x${string}` => {
  return ROLE_HASHES[roleName];
};
