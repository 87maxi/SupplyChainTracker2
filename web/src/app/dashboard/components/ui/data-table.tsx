'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from 'react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onFilterChange: (filter: { key: string; value: string }) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onFilterChange
}: DataTableProps<TData, TValue>) {
  const [filterValue, setFilterValue] = useState('')
  const [filterKey, setFilterKey] = useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  
  const handleFilterChange = () => {
    onFilterChange({ key: filterKey, value: filterValue })
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Registros</CardTitle>
            <CardDescription>Visualización de datos con paginación y filtros</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Input
              placeholder="Buscar..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full sm:w-[200px]"
            />
            <Select value={filterKey} onValueChange={setFilterKey}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="address">Dirección</SelectItem>
                <SelectItem value="serialNumber">S/N</SelectItem>
                <SelectItem value="role">Rol</SelectItem>
                <SelectItem value="status">Estado</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleFilterChange} className="whitespace-nowrap">
              Aplicar Filtro
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/70">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows && table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="transition-colors duration-200 hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-muted-foreground mb-2">No se encontraron resultados</div>
                      <Button variant="outline" onClick={() => { setFilterValue(''); setFilterKey('all'); handleFilterChange(); }}>
                        Limpiar filtros
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {table.getRowModel().rows.length} de {data.length} registros
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="transition-all duration-200"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="transition-all duration-200"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}