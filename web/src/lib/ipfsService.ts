/*
 * Servicio IPFS para el sistema de trazabilidad
 * Maneja la conexión con IPFS y el almacenamiento/recuperación de datos
 */

import { create as createIPFS } from 'ipfs-http-client';

// Configuración del nodo IPFS
const projectId = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || '2jSkRipsZnsF06t3ecVNlA2ts5X';
const projectSecret = process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET || '1bbc68836348b72dba92c5c7ca8c3cd0';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

// Cliente IPFS configurado para Infura
const ipfsClient = createIPFS({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

// Interfaz para los resultados de carga
export interface IPFSResult {
  path: string;
  url: string;
  hash: string;
}

// Función para cargar datos a IPFS
export const uploadToIPFS = async (data: Record<string, unknown> | string): Promise<IPFSResult> => {
  try {
    // Convertir los datos a JSON si no lo están
    const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Subir a IPFS
    const result = await ipfsClient.add(jsonData);
    
    // Construir URL pública
    const url = `https://ipfs.io/ipfs/${result.path}`;
    
    return {
      path: result.path,
      url,
      hash: result.path // El hash es el path en IPFS
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload data to IPFS');
  }
};

// Función para recuperar datos de IPFS
export const getFromIPFS = async (hash: string): Promise<unknown> => {
  try {
    // Obtener el contenido de IPFS
    const chunks: Uint8Array[] = [];
    for await (const chunk of ipfsClient.cat(hash)) {
      chunks.push(chunk);
    }
    
    // Combinar los chunks y parsear JSON
    const data = Buffer.concat(chunks).toString('utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting from IPFS:', error);
    throw new Error('Failed to retrieve data from IPFS');
  }
};

// Función para verificar si IPFS está disponible
export const isIPFSAvailable = async (): Promise<boolean> => {
  try {
    const version = await ipfsClient.version();
    console.log('IPFS version:', version);
    return true;
  } catch (error) {
    console.error('IPFS not available:', error);
    return false;
  }
};