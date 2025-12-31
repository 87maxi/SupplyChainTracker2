"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsPage;
const card_1 = require("@/components/ui/card");
const switch_1 = require("@/components/ui/switch");
const label_1 = require("@/components/ui/label");
const input_1 = require("@/components/ui/input");
const button_1 = require("@/components/ui/button");
const use_toast_1 = require("@/hooks/use-toast");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
function SettingsPage() {
    const { toast } = (0, use_toast_1.useToast)();
    const [loading, setLoading] = (0, react_1.useState)(true);
    // State for settings
    const [settings, setSettings] = (0, react_1.useState)({
        enableNotifications: true,
        autoRefresh: true,
        refreshInterval: '30',
        theme: 'light',
        contractAddress: '',
        rpcUrl: ''
    });
    // Load settings from localStorage on mount
    (0, react_1.useEffect)(() => {
        const saved = localStorage.getItem('admin-settings');
        if (saved) {
            setSettings(prev => (Object.assign(Object.assign({}, prev), JSON.parse(saved))));
        }
        else {
            // Only set defaults from environment if no saved settings
            setSettings(prev => (Object.assign(Object.assign({}, prev), { contractAddress: process.env.NEXT_PUBLIC_SUPPLY_CHAIN_TRACKER_ADDRESS || prev.contractAddress, rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || prev.rpcUrl })));
        }
        setLoading(false);
    }, []);
    // Save settings to localStorage
    const saveSettings = () => {
        try {
            localStorage.setItem('admin-settings', JSON.stringify(settings));
            toast({
                title: "Configuración guardada",
                description: "Los cambios se han aplicado correctamente."
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "No se pudieron guardar los ajustes.",
                variant: "destructive"
            });
        }
    };
    if (loading) {
        return (<div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-lg">Cargando configuración...</p>
        </div>
      </div>);
    }
    return (<div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
          <p className="text-muted-foreground">
            Administra las preferencias y configuraciones del panel de administración.
          </p>
        </div>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Notificaciones</card_1.CardTitle>
            <card_1.CardDescription>
              Controla cómo recibes notificaciones del sistema.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label_1.Label>Notificaciones en tiempo real</label_1.Label>
                <p className="text-sm text-muted-foreground">
                  Recibe actualizaciones instantáneas cuando ocurren eventos importantes.
                </p>
              </div>
              <switch_1.Switch checked={settings.enableNotifications} onCheckedChange={(checked) => setSettings(prev => (Object.assign(Object.assign({}, prev), { enableNotifications: checked })))}/>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label_1.Label>Auto-refresh</label_1.Label>
                <p className="text-sm text-muted-foreground">
                  Refresca automáticamente los datos del dashboard.
                </p>
              </div>
              <switch_1.Switch checked={settings.autoRefresh} onCheckedChange={(checked) => setSettings(prev => (Object.assign(Object.assign({}, prev), { autoRefresh: checked })))}/>
            </div>

            {settings.autoRefresh && (<div className="space-y-2">
                <label_1.Label>Intervalo de refresco (segundos)</label_1.Label>
                <input_1.Input type="number" min="10" max="300" value={settings.refreshInterval} onChange={(e) => setSettings(prev => (Object.assign(Object.assign({}, prev), { refreshInterval: e.target.value })))} className="max-w-xs"/>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Apariencia</card_1.CardTitle>
            <card_1.CardDescription>
              Personaliza la interfaz visual del sistema.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-6">
            <div className="space-y-2">
              <label_1.Label>Tema</label_1.Label>
              <div className="flex gap-4">
                <button_1.Button variant={settings.theme === 'light' ? 'default' : 'outline'} onClick={() => setSettings(prev => (Object.assign(Object.assign({}, prev), { theme: 'light' })))} className="gap-2">
                  Claro
                </button_1.Button>
                <button_1.Button variant={settings.theme === 'dark' ? 'default' : 'outline'} onClick={() => setSettings(prev => (Object.assign(Object.assign({}, prev), { theme: 'dark' })))} className="gap-2">
                  Oscuro
                </button_1.Button>
                <button_1.Button variant={settings.theme === 'system' ? 'default' : 'outline'} onClick={() => setSettings(prev => (Object.assign(Object.assign({}, prev), { theme: 'system' })))} className="gap-2">
                  Sistema
                </button_1.Button>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Configuración de Contrato</card_1.CardTitle>
            <card_1.CardDescription>
              Ajusta la configuración avanzada del contrato inteligente.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="space-y-2">
              <label_1.Label>Dirección del Contrato</label_1.Label>
              <input_1.Input value={settings.contractAddress} onChange={(e) => setSettings(prev => (Object.assign(Object.assign({}, prev), { contractAddress: e.target.value })))} placeholder="0x..." className="font-mono"/>
            </div>
            <div className="space-y-2">
              <label_1.Label>URL del RPC</label_1.Label>
              <input_1.Input value={settings.rpcUrl} onChange={(e) => setSettings(prev => (Object.assign(Object.assign({}, prev), { rpcUrl: e.target.value })))} placeholder="https://..."/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <div className="flex justify-end">
          <button_1.Button onClick={saveSettings} className="gap-2">
            <lucide_react_1.Save className="h-4 w-4"/>
            Guardar Cambios
          </button_1.Button>
        </div>
      </div>
    </div>);
}
