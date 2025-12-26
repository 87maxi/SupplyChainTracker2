// web/src/lib/errors/error-handler.ts

/**
 * Clase para manejar errores de manera consistente en toda la aplicación
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Manejador centralizado de errores
 */
export class ErrorHandler {
  /**
   * Maneja errores de Web3 y los convierte en AppError consistentes
   * @param error Error recibido de Web3/Wagmi
   * @returns AppError con mensaje y código adecuado
   */
  static handleWeb3Error(error: any): AppError {
    // Códigos de error comunes de Web3
    if (error.code === 4001) {
      return new AppError('Transacción rechazada por el usuario', 'USER_REJECTED');
    }
    
    if (error.code === -32603) {
      return new AppError('Error interno de la red', 'INTERNAL_ERROR');
    }
    
    if (error.code === 4100) {
      return new AppError('Permiso no concedido', 'PERMISSION_DENIED');
    }
    
    if (error.message?.includes('user rejected transaction')) {
      return new AppError('Transacción rechazada por el usuario', 'USER_REJECTED');
    }
    
    if (error.message?.includes('insufficient funds')) {
      return new AppError('Fondos insuficientes para la transacción', 'INSUFFICIENT_FUNDS');
    }
    
    if (error.message?.includes('gas required exceeds allowance')) {
      return new AppError('El gas requerido excede el límite disponible', 'GAS_LIMIT_EXCEEDED');
    }
    
    // Errores de validación
    if (error.message?.includes('reverted with reason string') ||
        error.message?.includes('VM execution error')) {
      const reason = this.extractRevertReason(error.message);
      return new AppError(`Transacción revertida: ${reason}`, 'TRANSACTION_REVERTED', error);
    }
    
    // Error genérico
    return new AppError(
      error.message || 'Ocurrió un error desconocido', 
      'UNKNOWN_ERROR', 
      error
    );
  }

  /**
   * Extrae el motivo de reversión de un error de contrato
   * @param message Mensaje de error completo
   * @returns Motivo de reversión
   */
  private static extractRevertReason(message: string): string {
    // Intentar extraer el motivo de diferentes formatos
    const reasonMatch = message.match(/reason string '(.+?)'/);
    if (reasonMatch && reasonMatch[1]) {
      return reasonMatch[1];
    }
    
    const revertMatch = message.match(/reverted: (.+?)(?:,|$)/);
    if (revertMatch && revertMatch[1]) {
      return revertMatch[1];
    }
    
    return 'Error desconocido';
  }

  /**
   * Registra un error en la consola y en sistemas de monitoreo
   * @param error Error a registrar
   * @param context Información adicional sobre el contexto
   */
  static logError(error: any, context?: Record<string, any>): void {
    console.error('Error registrado:', { error, context });
    
    // Aquí se podría integrar con servicios de monitoreo como Sentry, Rollbar, etc.
    // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   Sentry.captureException(error, { contexts: { additional: context } });
    // }
  }
}