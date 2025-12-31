'use client'

import { useState } from 'react'
import { DataTable } from "./ui/data-table"
import { netbookColumns, Netbook } from "./data/netbook-columns"

export function NetbookDataTable({ data, onFilterChange }: { data: Netbook[]; onFilterChange: (filter: { key: string; value: string }) => void }) {
  const [filter, setFilter] = useState({ key: '', value: '' })

  const handleFilterChange = ({ key, value }: { key: string; value: string }) => {
    setFilter({ key, value })
    onFilterChange({ key, value }) // Llamar a la función de filtro externa
  }

  return <DataTable columns={netbookColumns} data={data} onFilterChange={handleFilterChange} />
}