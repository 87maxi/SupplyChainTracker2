// web/src/lib/cache/cache-service.ts

/**
 * Servicio de Caché para almacenamiento en memoria y localStorage
 * Implementa un mecanismo TTL (Time To Live) para invalidación automática
 */
export class CacheService {
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
  private static readonly PREFIX = 'supplychain-cache:';

  /**
   * Almacena un valor en caché con un tiempo de vida específico
   * @param key Clave única para el valor
   * @param data Datos a almacenar
   * @param ttl Tiempo de vida en milisegundos (opcional)
   */
  static set(key: string, data: any, ttl?: number): void {
    if (typeof window === 'undefined') return; // SSR safety
    
    try {
      const item = {
        data,
        expiry: Date.now() + (ttl || this.DEFAULT_TTL)
      };
      localStorage.setItem(this.PREFIX + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  }

  /**
   * Recupera un valor de la caché si aún es válido
   * @param key Clave del valor a recuperar
   * @returns El valor almacenado o null si no existe o ha expirado
   */
  static get(key: string): any {
    if (typeof window === 'undefined') return null;
    
    try {
      const itemStr = localStorage.getItem(this.PREFIX + key);
      if (!itemStr) return null;
      
      const item = JSON.parse(itemStr);
      
      if (Date.now() > item.expiry) {
        localStorage.removeItem(this.PREFIX + key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  /**
   * Elimina un valor específico de la caché
   * @param key Clave del valor a eliminar
   */
  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.warn('Cache remove failed:', error);
    }
  }

  /**
   * Limpia todos los datos de la caché
   */
  static clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }
}