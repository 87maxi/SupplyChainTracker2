'use client'

import { useState } from 'react'
import { DataTable } from "./ui/data-table"
import { netbookColumns, Netbook } from "./data/netbook-columns"

export function NetbookDataTable({ serialNumbers, onFilterChange }: { serialNumbers: string[]; onFilterChange: (filter: { key: string; value: string }) => void }) {
  const [filter, setFilter] = useState({ key: '', value: '' })

  // Convert serial numbers to Netbook objects
  const netbookData: Netbook[] = serialNumbers.map(serial => ({
    id: serial,
    serialNumber: serial,
    manufacturer: 'unknown',
    model: 'unknown',
    productionDate: new Date().toISOString(),
    status: 'unknown',
    ownerAddress: '0x0000000000000000000000000000000000000000',
    processor: 'unknown',
    ram: 'unknown',
    storage: 'unknown',
    display: 'unknown'
  }));

  const handleFilterChange = ({ key, value }: { key: string; value: string }) => {
    setFilter({ key, value })
    onFilterChange({ key, value }) // Llamar a la función de filtro externa
  }

  return <DataTable columns={netbookColumns} data={netbookData} onFilterChange={handleFilterChange} />
}