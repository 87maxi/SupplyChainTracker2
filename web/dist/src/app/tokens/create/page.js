"use strict";
// web/src/app/tokens/create/page.tsx
"use client";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CreateTokensPage;
const useWeb3_1 = require("@/hooks/useWeb3");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const react_1 = require("react");
const use_toast_1 = require("@/hooks/use-toast"); // Importar useToast
const lucide_react_1 = require("lucide-react");
const navigation_1 = require("next/navigation"); // Para redireccionar
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("zod");
const zod_2 = require("@hookform/resolvers/zod");
const roleUtils_1 = require("@/lib/roleUtils"); // Para obtener los hashes de roles del contrato
// Esquema de validación con Zod
const formSchema = zod_1.z.object({
    serials: zod_1.z.string().min(1, 'Los números de serie son requeridos.').refine(val => val.split(',').every(s => s.trim().length > 0), { message: 'Cada número de serie debe tener un valor.' }),
    batches: zod_1.z.string().min(1, 'Los lotes son requeridos.').refine(val => val.split(',').every(s => s.trim().length > 0), { message: 'Cada lote debe tener un valor.' }),
    modelSpecs: zod_1.z.string().min(1, 'Las especificaciones del modelo son requeridas.').refine(val => val.split(',').every(s => s.trim().length > 0), { message: 'Cada especificación debe tener un valor.' }),
});
function CreateTokensPage() {
    const { address, isConnected, connectWallet } = (0, useWeb3_1.useWeb3)();
    const { registerNetbooks, hasRole, hasRoleByHash } = (0, useSupplyChainService_1.useSupplyChainService)();
    const { toast } = (0, use_toast_1.useToast)();
    const router = (0, navigation_1.useRouter)();
    const [loadingRole, setLoadingRole] = (0, react_1.useState)(true);
    const [isManufacturer, setIsManufacturer] = (0, react_1.useState)(false);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const { register, handleSubmit, formState: { errors }, reset, } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(formSchema),
    });
    // Verificar rol del usuario
    (0, react_1.useEffect)(() => {
        const checkRole = () => __awaiter(this, void 0, void 0, function* () {
            if (isConnected && address) {
                setLoadingRole(true);
                try {
                    // Obtener todos los hashes de roles del contrato
                    const roleHashes = yield (0, roleUtils_1.getRoleHashes)();
                    // Verificar si el usuario tiene el rol de fabricante
                    const hasManufacturerRole = yield hasRoleByHash(roleHashes.FABRICANTE, address);
                    setIsManufacturer(hasManufacturerRole);
                }
                catch (error) {
                    console.error("Error checking manufacturer role:", error);
                    toast({
                        title: "Error de rol",
                        description: "No se pudo verificar tu rol de fabricante. Intenta de nuevo.",
                        variant: "destructive",
                    });
                    setIsManufacturer(false); // Asumir que no es fabricante si hay error
                }
                finally {
                    setLoadingRole(false);
                }
            }
            else {
                setIsManufacturer(false);
                setLoadingRole(false);
            }
        });
        checkRole();
    }, [isConnected, address, hasRole, toast]);
    const onSubmit = (data) => __awaiter(this, void 0, void 0, function* () {
        setIsSubmitting(true);
        try {
            // Parsear inputs como arrays
            const serialArray = data.serials.split(',').map(s => s.trim()).filter(s => s.length > 0);
            const batchArray = data.batches.split(',').map(b => b.trim()).filter(b => b.length > 0);
            const modelArray = data.modelSpecs.split(',').map(m => m.trim()).filter(m => m.length > 0);
            // Validar que los arrays tengan la misma longitud
            if (serialArray.length !== batchArray.length || serialArray.length !== modelArray.length) {
                toast({
                    title: "Error de entrada",
                    description: "Todos los campos deben tener el mismo número de elementos separados por comas.",
                    variant: "destructive",
                });
                return;
            }
            if (!address) {
                toast({
                    title: "Error",
                    description: "No se pudo obtener tu dirección. Recarga la página.",
                    variant: "destructive",
                });
                return;
            }
            const result = yield registerNetbooks(serialArray, batchArray, modelArray, address);
            if (result.success) {
                toast({
                    title: "Registro Exitoso",
                    description: `Se registraron ${serialArray.length} netbooks.`,
                });
            }
            else {
                throw new Error(result.error || 'Unknown error');
            }
            reset(); // Limpiar formulario
            router.push('/tokens'); // Redirigir a la lista de tokens
        }
        catch (error) {
            console.error('Error registering netbooks:', error);
            toast({
                title: "Error al registrar netbooks",
                description: error.message || "Ocurrió un error inesperado.",
                variant: "destructive",
            });
        }
        finally {
            setIsSubmitting(false);
        }
    });
    if (!isConnected) {
        return (<div className="container mx-auto px-4 py-12">
        <card_1.Card className="border-dashed border-2">
          <card_1.CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <h3 className="text-xl font-medium text-foreground mb-2">Acceso Restringido</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Por favor, conecta tu wallet para acceder a la creación de netbooks.
            </p>
            <button_1.Button size="lg" variant="gradient" onClick={() => connectWallet()} className="h-12 px-8">
              Conectar Wallet
            </button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    if (loadingRole) {
        return (<div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <lucide_react_1.Loader2 className="h-12 w-12 text-primary animate-spin"/>
          <p className="text-lg text-muted-foreground animate-pulse">Verificando rol de fabricante...</p>
        </div>
      </div>);
    }
    if (!isManufacturer) {
        return (<div className="container mx-auto px-4 py-12">
        <card_1.Card className="border-dashed border-2">
          <card_1.CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <lucide_react_1.Factory className="h-12 w-12 text-primary/50 mb-4"/>
            <h3 className="text-xl font-medium text-foreground mb-2">Permiso Denegado</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Solo los usuarios con el rol de FABRICANTE pueden registrar nuevas netbooks. Contacta al administrador si crees que es un error.
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    return (<div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Crear NFTs de Netbooks</h1>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Registrar Nuevos Netbooks</card_1.CardTitle>
          <card_1.CardDescription>Registra una o múltiples netbooks en el sistema de trazabilidad, separando los valores por comas.</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="serials">Números de Serie (separados por comas)</label_1.Label>
                <input_1.Input id="serials" type="text" placeholder="S12345, S67890, S11223" {...register("serials")}/>
                {errors.serials && (<p className="text-sm text-red-500">{errors.serials.message}</p>)}
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="batches">Lotes (separados por comas)</label_1.Label>
                <input_1.Input id="batches" type="text" placeholder="Lote1, Lote2, Lote3" {...register("batches")}/>
                {errors.batches && (<p className="text-sm text-red-500">{errors.batches.message}</p>)}
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="modelSpecs">Especificaciones del Modelo (separadas por comas)</label_1.Label>
                <input_1.Input id="modelSpecs" type="text" placeholder="ModeloA, ModeloB, ModeloC" {...register("modelSpecs")}/>
                {errors.modelSpecs && (<p className="text-sm text-red-500">{errors.modelSpecs.message}</p>)}
              </div>
            </div>

            <button_1.Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (<>
                  <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Registrando...
                </>) : (<>
                  <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                  Registrar Netbooks
                </>)}
            </button_1.Button>
          </form>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
