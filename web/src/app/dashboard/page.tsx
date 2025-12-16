import { Header } from '@/components/layout/Header';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useContract } from '@/hooks/useContract';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { State } from '@/types/contract';

export default function Dashboard() {
  const { isConnected } = useWeb3();
  const contract = useContract();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      if (!contract) return null;
      
      // Estos son datos simulados, en producción se obtendrían del contrato
      return {
        total: 1234,
        manufacturing: 589,
        readyForDelivery: 412,
        delivered: 233
      };
    },
    enabled: isConnected && !!contract,
  });

  const { data: recentActivity, isLoading: isActivityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      // Simular datos de actividad reciente
      return [
        {
          id: 1,
          action: 'Registro de 25 netbooks',
          timestamp: '2024-01-15T10:30:00Z',
          actor: '0x1234...5678',
          status: 'success'
        },
        {
          id: 2,
          action: 'Auditoría de hardware completada',
          timestamp: '2024-01-15T07:15:00Z',
          actor: '0x9abc...def0',
          status: 'success'
        },
        {
          id: 3,
          action: 'Validación de software iniciada',
          timestamp: '2024-01-15T06:00:00Z',
          actor: '0x1111...2222',
          status: 'pending'
        }
      ];
    },
    enabled: isConnected,
  });

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Debes conectar tu wallet para acceder al dashboard.</p>
            <Button asChild className="mt-4">
              <Link href="/">Conectar Wallet</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

      return (
      <>
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Resumen del sistema de trazabilidad</p>
              </div>
              <Button asChild>
                <Link href="/tokens/create">Registrar Netbooks</Link>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Netbooks Totales</CardTitle>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="h-4 w-4 text-muted-foreground">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total || '0'}</div>
                  <p className="text-xs text-muted-foreground">+20.1% respecto al mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En Fabricación</CardTitle>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="h-4 w-4 text-muted-foreground">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.manufacturing || '0'}</div>
                  <p className="text-xs text-muted-foreground">+18.6% respecto al mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Listas para Entrega</CardTitle>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="h-4 w-4 text-muted-foreground">
                    <path d="M20 10c0 4.993-5.539 10.1-13 10.1h-3" />
                    <path d="M15 9.344V4a3 3 0 0 0-3-3v0a3 3 0 0 0-3 3v5.344" />
                    <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
                    <line x1="9.78" y1="14.89" x2="8.36" y2="16.31" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.readyForDelivery || '0'}</div>
                  <p className="text-xs text-muted-foreground">+19.3% respecto al mes pasado</p>
                </CardContent>
              </Card>

                        <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entregadas</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="h-4 w-4 text-muted-foreground">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 12 2 4" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.delivered || '0'}</div>
                  <p className="text-xs text-muted-foreground">+23.1% respecto al mes pasado</p>
                </CardContent>
              </Card>

              <div className='mt-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>Últimas acciones en el sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {isActivityLoading ? (
                        <div>Cargando actividad...</div>
                      ) : (
                        recentActivity?.map((activity) => (
                          <div key={activity.id} className="flex items-center">
                            <div className={`flex h-2 w-2 rounded-full ${activity.status === 'success' ? 'bg-success' : activity.status === 'pending' ? 'bg-yellow-400' : 'bg-destructive'}`} />
                            <div className="ml-4 space-y-1">
                              <p className="text-sm font-medium leading-none">{activity.action}</p>
                              <p className="text-sm text-muted-foreground">
                                por {activity.actor} • {formatDistanceToNow(new Date(activity.timestamp), { locale: es, addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }