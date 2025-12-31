"use strict";
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
exports.NetbookStateMetrics = void 0;
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
const useSupplyChainService_1 = require("@/hooks/useSupplyChainService");
const utils_1 = require("@/lib/utils");
const StateCard = ({ title, count, icon: Icon, color, percentage }) => (<card_1.Card className="relative overflow-hidden group hover:shadow-lg transition-all">
        <div className={(0, utils_1.cn)("absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity", color)}>
            <Icon className="h-12 w-12"/>
        </div>
        <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium text-muted-foreground">{title}</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{count}</span>
                <span className="text-sm text-muted-foreground">netbooks</span>
            </div>
            <div className="mt-3">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={(0, utils_1.cn)("h-full rounded-full transition-all", color.replace('text-', 'bg-'))} style={{ width: `${percentage}%` }}/>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(0)}% del total</p>
            </div>
        </card_1.CardContent>
    </card_1.Card>);
const NetbookStateMetrics = () => {
    const { getAllSerialNumbers, getNetbookState } = (0, useSupplyChainService_1.useSupplyChainService)();
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [counts, setCounts] = (0, react_1.useState)(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('netbook_metrics_cache');
            if (cached) {
                try {
                    return JSON.parse(cached);
                }
                catch (e) {
                    return { total: 0, fabricadas: 0, hwAprobado: 0, swValidado: 0, distribuidas: 0 };
                }
            }
        }
        return { total: 0, fabricadas: 0, hwAprobado: 0, swValidado: 0, distribuidas: 0 };
    });
    (0, react_1.useEffect)(() => {
        const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Only show loader if we don't have cached data
                if (counts.total === 0)
                    setLoading(true);
                const serials = yield getAllSerialNumbers();
                const total = serials.length;
                if (total === 0) {
                    const newCounts = { total: 0, fabricadas: 0, hwAprobado: 0, swValidado: 0, distribuidas: 0 };
                    setCounts(newCounts);
                    localStorage.setItem('netbook_metrics_cache', JSON.stringify(newCounts));
                    return;
                }
                // Contar netbooks por estado en paralelo
                const states = yield Promise.all(serials.map((serial) => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        const state = yield getNetbookState(serial);
                        return Number(state);
                    }
                    catch (e) {
                        console.error(`Error getting state for ${serial}:`, e);
                        return -1;
                    }
                })));
                let fabricadas = 0, hwAprobado = 0, swValidado = 0, distribuidas = 0;
                states.forEach((state) => {
                    switch (state) {
                        case 0:
                            fabricadas++;
                            break;
                        case 1:
                            hwAprobado++;
                            break;
                        case 2:
                            swValidado++;
                            break;
                        case 3:
                            distribuidas++;
                            break;
                    }
                });
                const newCounts = { total, fabricadas, hwAprobado, swValidado, distribuidas };
                setCounts(newCounts);
                localStorage.setItem('netbook_metrics_cache', JSON.stringify(newCounts));
            }
            catch (error) {
                console.error('Error fetching netbook metrics:', error);
            }
            finally {
                setLoading(false);
            }
        });
        fetchData();
        // Listen for global refresh events
        const { eventBus, EVENTS } = require('@/lib/events');
        const unsubscribe = eventBus.on(EVENTS.REFRESH_DATA || 'REFRESH_DATA', () => {
            console.log('[NetbookStateMetrics] Global refresh detected...');
            fetchData();
        });
        return () => unsubscribe();
    }, []);
    if (loading) {
        return (<card_1.Card>
                <card_1.CardContent className="flex items-center justify-center py-12">
                    <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                    <span className="ml-3 text-muted-foreground">Cargando métricas de netbooks...</span>
                </card_1.CardContent>
            </card_1.Card>);
    }
    const getPercentage = (value) => counts.total > 0 ? (value / counts.total) * 100 : 0;
    return (<div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Estado de Netbooks</h2>
                    <p className="text-muted-foreground">Distribución por etapa del ciclo de vida</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold">{counts.total}</p>
                    <p className="text-sm text-muted-foreground">Total registradas</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StateCard title="Fabricadas" count={counts.fabricadas} icon={lucide_react_1.Package} color="text-blue-500" percentage={getPercentage(counts.fabricadas)}/>
                <StateCard title="HW Aprobado" count={counts.hwAprobado} icon={lucide_react_1.ShieldCheck} color="text-emerald-500" percentage={getPercentage(counts.hwAprobado)}/>
                <StateCard title="SW Validado" count={counts.swValidado} icon={lucide_react_1.Monitor} color="text-purple-500" percentage={getPercentage(counts.swValidado)}/>
                <StateCard title="Distribuidas" count={counts.distribuidas} icon={lucide_react_1.Truck} color="text-amber-500" percentage={getPercentage(counts.distribuidas)}/>
            </div>
        </div>);
};
exports.NetbookStateMetrics = NetbookStateMetrics;
