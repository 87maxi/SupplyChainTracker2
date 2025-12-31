import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type User = {
  id: string
  address: string
  role: string
  assignedAt: string
  status: string
  loginCount: number
  lastLogin: string
}

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "address",
    header: "Dirección",
    cell: ({ row }) => {
      const address = row.getValue("address") as string
      return (
        <div className="font-mono text-sm">{address.slice(0, 6)}...{address.slice(-4)}</div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      const variantColors = {
        ADMIN_ROLE: "default",
        MANUFACTURER_ROLE: "secondary",
        DISTRIBUTOR_ROLE: "secondary",
        RETAILER_ROLE: "secondary",
        CONSUMER_ROLE: "secondary",
        LOGISTICS_ROLE: "secondary",
        QUALITY_CONTROL_ROLE: "secondary",
        REGULATORY_COMPLIANCE_ROLE: "secondary",
      }
      
      return (
        <Badge variant={variantColors[role as keyof typeof variantColors]} className="font-mono">
          {role.replace('_ROLE', '')}
        </Badge>
      );
    },
  },
  {
    accessorKey: "assignedAt",
    header: "Asignado",
    cell: ({ row }) => {
      const date = new Date(row.getValue("assignedAt"))
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === 'active' ? "success" : "destructive"}>
          {status === 'active' ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "loginCount",
    header: "Inicios",
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("loginCount")}</div>;
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Último",
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastLogin"))
      return <div className="text-sm">{date.toLocaleDateString()}</div>
    },
  },
]