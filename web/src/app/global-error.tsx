"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold mb-4">¡Algo salió mal!</h2>
          <p className="text-muted-foreground mb-6">
            Ocurrió un error inesperado en la aplicación.
          </p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => reset()}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}