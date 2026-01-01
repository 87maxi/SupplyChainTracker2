import { useCallback } from 'react';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { abi as SupplyChainTrackerABI } from '../contracts/abi/SupplyChainTracker.json';

export function useRoleRequest() {
  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    abi: SupplyChainTrackerABI,
    functionName: 'requestRole',
  });

  const { write: requestRole } = useContractWrite(config);

  const request = useCallback(
    (role: string) => {
      if (!requestRole) return;
      requestRole({ args: [role] });
    },
    [requestRole]
  );

  return { request };
}