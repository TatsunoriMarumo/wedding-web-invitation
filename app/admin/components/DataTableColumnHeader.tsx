import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DataTableColumnHeaderProps<TData, TValue>
    extends React.HtmlHTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
    title: string;
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>;
    }

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <Button
                variant="ghost"
                size="sm"
                className="font-bold m-0 p-0 h-8 data-[state=open]:big-accent"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                <span>{title}</span>
                {column.getIsSorted() === "desc" ? (
                    <ArrowDown />
                ) : column.getIsSorted() === "asc" ? (
                    <ArrowUp />
                ) : (
                    <ChevronsUpDown />
                )}
            </Button>
        </div>
    );
}
