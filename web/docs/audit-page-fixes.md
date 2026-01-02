# Audit Page Fixes

## Overview
This document describes the fixes made to resolve the React state update error in the audit page component.

## Issue Fixed

### Audit Page (`web/src/app/admin/audit/page.tsx`)
**Error**: "Can't perform a React state update on a component that hasn't mounted yet. This indicates that you have a side-effect in your render function that asynchronously tries to update the component. Move this work to useEffect instead."

**Problem**: The component was using `useMemo` to perform side effects (initializing event service and setting state), which is not the correct pattern. `useMemo` is intended for memoizing expensive calculations, not for side effects.

**Root Cause**: 
- `useMemo` was being used to initialize the event service and set state
- This caused state updates to happen during render rather than in effect hooks
- React detected this as an improper pattern and threw a warning

**Solution**:
1. Changed `useMemo` to `useEffect` for the initialization logic
2. Added proper `useEffect` import
3. Kept the dependency array `[toast]` to ensure the effect runs when toast changes

**Before**:
```jsx
import { useState, useCallback, useMemo } from 'react';

// ...

// Inicializar el servicio de eventos
useMemo(() => {
  const initEventService = async () => {
    try {
      const service = await getEventService();
      setEventService(service);
      
      // Escuchar eventos cuando el servicio esté listo
      if (service) {
        const allLogs = await service.getAuditLogs();
        setLogs(Array.isArray(allLogs) ? allLogs : []);
      }
    } catch (error) {
      console.error('Error initializing event service:', error);
      toast({
        title: 'Error',
        description: 'No se pudo conectar al servicio de eventos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  initEventService();
}, [toast]);
```

**After**:
```jsx
import { useState, useEffect, useCallback, useMemo } from 'react';

// ...

// Inicializar el servicio de eventos
useEffect(() => {
  const initEventService = async () => {
    try {
      const service = await getEventService();
      setEventService(service);
      
      // Escuchar eventos cuando el servicio esté listo
      if (service) {
        const allLogs = await service.getAuditLogs();
        setLogs(Array.isArray(allLogs) ? allLogs : []);
      }
    } catch (error) {
      console.error('Error initializing event service:', error);
      toast({
        title: 'Error',
        description: 'No se pudo conectar al servicio de eventos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  initEventService();
}, [toast]);
```

## Benefits
- Resolves the React warning about state updates in unmounted components
- Uses the correct React hooks for their intended purposes
- Improves component reliability and follows React best practices
- Maintains the same functionality while fixing the anti-pattern

## Files Modified
1. `web/src/app/admin/audit/page.tsx`

This fix ensures that side effects are properly handled within React's lifecycle, preventing potential issues with state updates on unmounted components.