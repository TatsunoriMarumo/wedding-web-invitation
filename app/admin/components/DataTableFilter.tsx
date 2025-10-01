"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

export function DataTableFilter<TData>({ table }: { table: Table<TData> }) {
    // Only visible columns with an accessor will appear in the dropdown
    const filterableColumns = table
        .getAllColumns()
        .filter((col) => col.getIsVisible() && col.getCanSort());

    // Local states for filtering
    const [selectedColumnId, setSelectedColumnId] = React.useState<string>(filterableColumns[0].id);
    const [filterValue, setFilterValue] = React.useState<string>("");

    // Whenever user changes either selectedColumnId or filterValue,
    // apply the filter to that column.
    React.useEffect(() => {
        if (!selectedColumnId) return;
        table.getColumn(selectedColumnId)?.setFilterValue(filterValue);
    }, [selectedColumnId, filterValue, table]);

    return (
        <div className="flex items-center space-x-2">
            {/* Column selector dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 flex items-center">
                        <MagnifyingGlassIcon className="h-4 w-4" />
                        フィルター
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[150px]">
                    <DropdownMenuLabel>Select Column</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                        value={selectedColumnId}
                        onValueChange={(value) => setSelectedColumnId(value)}
                    >
                        {filterableColumns.map((column) => (
                            <DropdownMenuRadioItem
                                key={column.id}
                                value={column.id}
                                className="capitalize"
                            >
                                {column.columnDef.meta?.title ?? column.id}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter text input */}
            <Input
                placeholder={
                    selectedColumnId
                        ? `${
                              table.getColumn(selectedColumnId)?.columnDef.meta?.title ??
                              selectedColumnId
                          }でフィルター`
                        : "Select a column..."
                }
                className="h-8 max-w-sm"
                value={filterValue} // always a string, so it's controlled
                onChange={(e) => setFilterValue(e.target.value)}
                disabled={!selectedColumnId}
            />
        </div>
    );
}
