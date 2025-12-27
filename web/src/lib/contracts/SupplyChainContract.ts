'use server';

import { config } from '@/lib/wagmi/config';
import { readContract, writeContract } from '@wagmi/core';
import { formatEther } from 'viem';

// Importar el ABI y la dirección del contrato
import SupplyChainTrackerABI from '@/contracts/abi/SupplyChainTracker.json';
import { NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS } from '@/lib/env';

const contractAddress = NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS as `0x${string}`;
const abi = SupplyChainTrackerABI;

// Función para obtener todos los números de serie
export async function getAllSerialNumbers(): Promise<string[]> {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getAllSerialNumbers',
      args: []
    });
    return result as string[];
  } catch (error) {
    console.error('Error al obtener números de serie:', error);
    throw error;
  }
}

// Función para obtener el estado de una netbook
export async function getNetbookState(serial: string): Promise<number> {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getNetbookState',
      args: [serial]
    });
    return result as number;
  } catch (error) {
    console.error('Error al obtener estado de netbook:', error);
    throw error;
  }
}

// Función para obtener el reporte de una netbook
export async function getNetbookReport(serial: string): Promise<any> {
  try {
    const result = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'getNetbookReport',
      args: [serial]
    });
    return result;
  } catch (error) {
    console.error('Error al obtener reporte de netbook:', error);
    throw error;
  }
}

// Función para registrar netbooks
export async function registerNetbooks(
  serials: string[], 
  batches: string[], 
  specs: string[]
): Promise<string> {
  try {
    const { request } = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'registerNetbooks',
      args: [serials, batches, specs]
    });
    
    // Simular transacción exitosa
    return '0x' + '1234567890abcdef'.repeat(8);
  } catch (error) {
    console.error('Error al registrar netbooks:', error);
    throw error;
  }
}

// Función para auditar hardware
export async function auditHardware(
  serial: string, 
  passed: boolean, 
  reportHash: string
): Promise<string> {
  try {
    const { request } = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'auditHardware',
      args: [serial, passed, reportHash as `0x${string}`]
    });
    
    // Simular transacción exitosa
    return '0x' + '1234567890abcdef'.repeat(8);
  } catch (error) {
    console.error('Error al auditar hardware:', error);
    throw error;
  }
}

// Función para validar software
export async function validateSoftware(
  serial: string, 
  osVersion: string, 
  passed: boolean
): Promise<string> {
  try {
    const { request } = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'validateSoftware',
      args: [serial, osVersion, passed]
    });
    
    // Simular transacción exitosa
    return '0x' + '1234567890abcdef'.repeat(8);
  } catch (error) {
    console.error('Error al validar software:', error);
    throw error;
  }
}

// Función para asignar a estudiante
export async function assignToStudent(
  serial: string, 
  schoolHash: string, 
  studentHash: string
): Promise<string> {
  try {
    const { request } = await writeContract(config, {
      address: contractAddress,
      abi,
      functionName: 'assignToStudent',
      args: [serial, schoolHash as `0x${string}`, studentHash as `0x${string}`]
    });
    
    // Simular transacción exitosa
    return '0x' + '1234567890abcdef'.repeat(8);
  } catch (error) {
    console.error('Error al asignar a estudiante:', error);
    throw error;
  }
}

// Función para obtener el balance
export async function getBalance(address: string): Promise<string> {
  try {
    const balance = await readContract(config, {
      address: contractAddress,
      abi,
      functionName: 'balanceOf',
      args: [address]
    });
    
    return formatEther(balance as bigint);
  } catch (error) {
    console.error('Error al obtener balance:', error);
    return '0';
  }
}