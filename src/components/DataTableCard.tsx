
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface DataTableCardProps<TData> {
  title: string;
  description?: string;
  data: TData[];
  columns: ColumnDef<TData>[];
  searchColumn?: string;
}

function DataTableCard<TData>({
  title,
  description,
  data,
  columns,
  searchColumn
}: DataTableCardProps<TData>) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">Nessun dato disponibile</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={columns} 
          data={data} 
          searchColumn={searchColumn}
        />
      </CardContent>
    </Card>
  );
};

export default DataTableCard;
