import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type Netbook = {
  id: string
  serialNumber: string
  manufacturer: string
  model: string
  productionDate: string
  status: string
  ownerAddress: string
  processor: string
  ram: string
  storage: string
  display: string
}

export const netbookColumns: ColumnDef<Netbook>[] = [
  {
    accessorKey: "serialNumber",
    header: "S/N",
    cell: ({ row }) => {
      const serial = row.getValue("serialNumber") as string
      return <div className='font-mono text-sm'>{serial}</div>;
    },
  },
  {
    accessorKey: "manufacturer",
    header: "Fabricante",
    cell: ({ row }) => {
      return <div>{row.getValue("manufacturer")}</div>;
    },
  },
  {
    accessorKey: "model",
    header: "Modelo",
    cell: ({ row }) => {
      return <div>{row.getValue("model")}</div>;
    },
  },
  {
    accessorKey: "productionDate",
    header: "Producción",
    cell: ({ row }) => {
      const date = new Date(row.getValue("productionDate"))
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variantColors = {
        production: "secondary",
        distribution: "outline-glow",
        retail: "outline",
        sold: "success"
      }
      
      return (
        <Badge variant={variantColors[status as keyof typeof variantColors]}>
          {status === 'production' ? 'Producción' :
           status === 'distribution' ? 'Distribución' :
           status === 'retail' ? 'Venta' : 'Vendido'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "ownerAddress",
    header: "Propietario",
    cell: ({ row }) => {
      const address = row.getValue("ownerAddress") as string
      if (!address) return <div className='font-mono text-xs'>N/A</div>;
      return (
        <div className='font-mono text-xs'>{address.slice(0, 6)}...{address.slice(-4)}</div>
      );
    },
  },
  {
    accessorKey: "processor",
    header: "Procesador",
    cell: ({ row }) => {
      return <div className='text-xs'>{row.getValue("processor")}</div>;
    },
  }
]