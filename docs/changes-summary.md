# Changes Summary

## Fix for useInfiniteReadContracts Type Error

### Issue
The build was failing due to a type error in `useInfiniteReadContracts.ts`. The error indicated that the `query` parameter was missing required properties `initialPageParam` and `getNextPageParam` from the `UseInfiniteQueryParameters` type.

### Root Cause
The `useInfiniteReadContracts` hook was not properly forwarding the required infinite query parameters (`initialPageParam` and `getNextPageParam`) from the `query` object to the underlying `useInfiniteQuery` call. The hook was spreading the query object directly without ensuring these required properties were included.

### Solution
Updated the `useInfiniteReadContracts` hook to properly extract and forward the required infinite query parameters. The fix ensures that:

1. The `initialPageParam` is properly passed from the options
2. The `getNextPageParam` function is properly passed from the options
3. The query parameters are correctly typed and forwarded to `useInfiniteQuery`

### Implementation Details
- Modified the return statement of `useInfiniteReadContracts` to properly extract and forward the required infinite query parameters
- Ensured type safety by properly typing the query parameters
- Maintained structural sharing for performance

### Verification
- Run `npm run build` to verify the fix
- Check that the type error is resolved
- Ensure all functionality related to infinite contract reads continues to work as expected

### Next Steps
- Add comprehensive tests for the infinite read contracts functionality
- Document the proper usage pattern in the project documentation
- Review other custom hooks for similar type safety issues