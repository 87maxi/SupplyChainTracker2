//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// supplyChainTracker
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const supplyChainTrackerAbi = [
  {
    type: 'function',
    inputs: [{ name: 'role', type: 'string' }],
    name: 'getRoleByName',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', type: 'string' },
      { name: 'metadata', type: 'string' },
    ],
    name: 'requestRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'role', type: 'bytes32' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPendingRoleRequests',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'requestId', type: 'uint256' }],
    name: 'getRoleRequest',
    outputs: [
      { name: '', type: 'address' },
      { name: '', type: 'bytes32' },
      { name: '', type: 'uint8' },
      { name: '', type: 'uint256' },
      { name: '', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'requestId', type: 'uint256' }],
    name: 'rejectRoleRequest',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'serial', type: 'string' }],
    name: 'getNetbookState',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'serial', type: 'string' }],
    name: 'getNetbookReport',
    outputs: [
      { name: '', type: 'string' },
      { name: '', type: 'bool' },
      { name: '', type: 'string' },
      { name: '', type: 'string' },
      { name: '', type: 'bool' },
      { name: '', type: 'string' },
      { name: '', type: 'bytes32' },
      { name: '', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'serials', type: 'string[]' },
      { name: 'batches', type: 'string[]' },
      { name: 'specs', type: 'string[]' },
    ],
    name: 'registerNetbooks',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'serial', type: 'string' },
      { name: 'passed', type: 'bool' },
      { name: 'reportHash', type: 'bytes32' },
    ],
    name: 'auditHardware',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'serial', type: 'string' },
      { name: 'osVersion', type: 'string' },
      { name: 'passed', type: 'bool' },
    ],
    name: 'validateSoftware',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'serial', type: 'string' },
      { name: 'schoolHash', type: 'bytes32' },
      { name: 'studentHash', type: 'bytes32' },
    ],
    name: 'assignToStudent',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 *
 */
export const supplyChainTrackerAddress = {
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
} as const

/**
 *
 */
export const supplyChainTrackerConfig = {
  address: supplyChainTrackerAddress,
  abi: supplyChainTrackerAbi,
} as const
