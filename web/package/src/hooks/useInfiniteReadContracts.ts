'use client'

import type {
  Config,
  ReadContractsErrorType,
  ResolvedRegister,
} from '@wagmi/core'
import {
  type InfiniteReadContractsQueryFnData,
  type InfiniteReadContractsQueryKey,
  infiniteReadContractsQueryOptions,
  structuralSharing,
} from '@wagmi/core/query'
import type { ContractFunctionParameters } from 'viem'

import type {
  InfiniteReadContractsData,
  InfiniteReadContractsOptions,
} from '../exports/query.js'
import type {
  ConfigParameter,
  InfiniteQueryParameter,
} from '../types/properties.js'
import {
  type UseInfiniteQueryParameters,
  type UseInfiniteQueryReturnType,
  useInfiniteQuery,
} from '../utils/query.js'
import { useChainId } from './useChainId.js'
import { useConfig } from './useConfig.js'

export type UseInfiniteContractReadsParameters<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  config extends Config = Config,
  pageParam = unknown,
  selectData = InfiniteReadContractsData<contracts, allowFailure>,
> = InfiniteReadContractsOptions<contracts, allowFailure, pageParam, config> &
  ConfigParameter<config> &
  InfiniteQueryParameter<
    InfiniteReadContractsQueryFnData<contracts, allowFailure>,
    ReadContractsErrorType,
    selectData,
    InfiniteReadContractsData<contracts, allowFailure>,
    InfiniteReadContractsQueryKey<contracts, allowFailure, pageParam, config>,
    pageParam
  >

export type UseInfiniteContractReadsReturnType<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  selectData = InfiniteReadContractsData<contracts, allowFailure>,
> = UseInfiniteQueryReturnType<selectData, ReadContractsErrorType>

/** https://wagmi.sh/react/api/hooks/useInfiniteReadContracts */
export function useInfiniteReadContracts<
  const contracts extends readonly unknown[],
  allowFailure extends boolean = true,
  config extends Config = ResolvedRegister['config'],
  pageParam = unknown,
  selectData = InfiniteReadContractsData<contracts, allowFailure>,
>(
  parameters: UseInfiniteContractReadsParameters<
    contracts,
    allowFailure,
    config,
    pageParam,
    selectData
  >,
): UseInfiniteContractReadsReturnType<contracts, allowFailure, selectData> {
    const { contracts = [], ...params } = parameters

  const config = useConfig(parameters)
  const chainId = useChainId({ config })
  
  // Extract parameters and query
  const { query: infiniteQuery, ...restParams } = params;
  
  // We need to ensure the query object with required properties is passed to infiniteReadContractsQueryOptions
  // Use the query parameters directly, ensuring required properties are present
  const queryOptions = {
    ...infiniteQuery,
    getNextPageParam: infiniteQuery?.getNextPageParam || ((_lastPage: unknown, allPages: unknown[], _lastPageParam: unknown, _allPageParams: unknown[]) => {
      // Default implementation for getNextPageParam
      return allPages.length ? allPages.length + 1 : 1
    })
  } as { getNextPageParam: (lastPage: unknown, allPages: unknown[], lastPageParam: unknown, allPageParams: unknown[]) => unknown; } & typeof infiniteQuery;
  

  
  const options = infiniteReadContractsQueryOptions(config, {
    ...restParams,
    chainId,
    contracts: contracts as UseInfiniteContractReadsParameters['contracts'],
    query: queryOptions
  });
  
  // Create the final query object for useInfiniteQuery
  const finalQuery = {
    ...options,
    ...infiniteQuery,
  }

  return useInfiniteQuery(finalQuery as any)
}
