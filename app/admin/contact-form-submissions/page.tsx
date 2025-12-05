"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  metadata: {
    unitNumber?: string;
    subject?: string;
    phone?: string;
    ip?: string;
    userAgent?: string;
    timestamp?: string;
    [key: string]: any;
  } | null;
  createdAt: string;
}

async function getContactSubmissions(): Promise<ContactSubmission[]> {
  try {
    const response = await fetch("/api/admin/contact-submissions");
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch submissions");
    }

    return result.data;
  } catch (error) {
    console.error("API error:", error);
    return [];
  }
}

export default function ContactFormSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Load data on component mount
  useEffect(() => {
    getContactSubmissions().then((data) => {
      setSubmissions(data);
      setLoading(false);
    });
  }, []);

  const columns = useMemo<ColumnDef<ContactSubmission, any>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 80,
        cell: ({ getValue }) => (
          <span className="font-mono text-small text-secondary">
            #{getValue()}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 150,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 200,
        cell: ({ getValue }) => (
          <a
            href={`mailto:${getValue()}`}
            className="text-primary hover:underline"
          >
            {getValue()}
          </a>
        ),
      },
      {
        accessorKey: "metadata",
        header: "Unit",
        size: 100,
        cell: ({ getValue }) => {
          const metadata = getValue();
          return metadata?.unitNumber || "-";
        },
      },
      {
        accessorKey: "metadata",
        header: "Phone",
        size: 120,
        cell: ({ getValue }) => {
          const metadata = getValue();
          return metadata?.phone || "-";
        },
      },
      {
        accessorKey: "metadata",
        header: "Subject",
        size: 200,
        cell: ({ getValue }) => {
          const metadata = getValue();
          return metadata?.subject ? (
            <span className="font-medium">{metadata.subject}</span>
          ) : (
            <span className="text-gray-400">No subject</span>
          );
        },
      },
      {
        accessorKey: "message",
        header: "Message",
        size: 300,
        cell: ({ getValue }) => (
          <div className="max-w-xs truncate text-secondary" title={getValue()}>
            {getValue()}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Submitted",
        size: 150,
        cell: ({ getValue }) => (
          <span className="text-small">
            {new Date(getValue()).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        ),
        sortingFn: (rowA, rowB) => {
          return new Date(rowA.original.createdAt).getTime() -
            new Date(rowB.original.createdAt).getTime();
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: submissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      columnFilters,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    globalFilterFn: "includesString",
  });

  if (loading) {
    return (
      <div className="container">
        <div className="section">
          <h1>Contact Form Submissions</h1>
          <div className="card">
            <p className="text-secondary">Loading submissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section">
        <h1>Contact Form Submissions</h1>
        <p className="text-secondary text-small">
          Total submissions: {submissions.length}
        </p>
      </div>

      <div className="section">
        {/* Search Filter */}
        <div className="card mb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <label htmlFor="global-search" className="block text-small font-medium mb-2">
                Search all columns
              </label>
              <input
                id="global-search"
                type="text"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search submissions..."
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="btn btn-secondary text-small"
              >
                First
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="btn btn-secondary text-small"
              >
                Previous
              </button>
              <span className="text-small text-secondary self-center px-2">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="btn btn-secondary text-small"
              >
                Next
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="btn btn-secondary text-small"
              >
                Last
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {submissions.length === 0 ? (
            <p className="text-secondary p-4">No contact form submissions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-soft border-b border-background-divider">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="text-left p-3 text-small font-medium text-secondary border-b border-background-divider cursor-pointer hover:bg-background-soft transition-colors"
                          style={{ width: header.getSize() }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-1">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            {{
                              asc: "↑",
                              desc: "↓",
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-background-divider hover:bg-background-soft transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="p-3 text-small"
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Info */}
          <div className="p-3 bg-soft border-t border-background-divider">
            <p className="text-small text-secondary">
              Showing {table.getRowModel().rows.length} of {submissions.length} submissions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
