import { SupabaseClient } from "@supabase/supabase-js";
import { OrderDbRow } from "../../src/types/order.js";

export function createMockSupabaseDb(initialOrders: OrderDbRow[] = []) {
  const orders: OrderDbRow[] = initialOrders.map((o) => JSON.parse(JSON.stringify(o)));
  let forcedError: { message: string } | null = null;

  const db = {
    orders,
    setForcedError: (err: { message: string } | null) => {
      forcedError = err;
    },
    from: (table: string) => {
      if (table !== "orders") {
        throw new Error(`Mock table '${table}' not supported`);
      }

      return {
        select: (_cols = "*") => {
          if (forcedError) {
            const err = forcedError;
            const errorBuilder = {
              eq: () => errorBuilder,
              order: () => errorBuilder,
              maybeSingle: async () => ({ data: null, error: err }),
              single: async () => ({ data: null, error: err }),
              then: (resolve: any, reject: any) =>
                Promise.resolve({ data: null, error: err }).then(resolve, reject),
            };
            return errorBuilder;
          }

          let filtered = [...orders];

          const builder = {
            eq: (col: string, val: any) => {
              filtered = filtered.filter((row: any) => row[col] === val);
              return builder;
            },
            order: (
              col: string,
              { ascending = true }: { ascending?: boolean } = {}
            ) => {
              filtered.sort((a: any, b: any) => {
                if (a[col] < b[col]) return ascending ? -1 : 1;
                if (a[col] > b[col]) return ascending ? 1 : -1;
                return 0;
              });
              return builder;
            },
            maybeSingle: async () => {
              return { data: filtered[0] || null, error: null };
            },
            single: async () => {
              if (filtered.length === 0) {
                return { data: null, error: { message: "Row not found" } };
              }
              return { data: filtered[0], error: null };
            },
            then: (resolve: any, reject: any) => {
              return Promise.resolve({ data: filtered, error: null }).then(
                resolve,
                reject
              );
            },
          };

          return builder;
        },

        insert: (rowOrRows: any) => {
          if (forcedError) {
            const err = forcedError;
            const errorBuilder = {
              select: () => errorBuilder,
              single: async () => ({ data: null, error: err }),
              then: (resolve: any, reject: any) =>
                Promise.resolve({ data: null, error: err }).then(resolve, reject),
            };
            return errorBuilder;
          }

          const rowsToInsert = Array.isArray(rowOrRows)
            ? rowOrRows
            : [rowOrRows];
          const inserted: any[] = [];
          for (const row of rowsToInsert) {
            const newRow: OrderDbRow = {
              id:
                row.id ||
                `uuid-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              user_id: row.user_id,
              order_reference: row.order_reference,
              purchase_date: row.purchase_date || new Date().toISOString(),
              status: row.status || "pending",
              event_id: row.event_id,
              event_name: row.event_name,
              event_date: row.event_date,
              venue: row.venue,
              city: row.city,
              image_url: row.image_url || null,
              tickets: row.tickets || [],
              total_amount: row.total_amount,
              currency: row.currency || "EUR",
              created_at: row.created_at || new Date().toISOString(),
              updated_at: row.updated_at || new Date().toISOString(),
            };
            orders.push(newRow);
            inserted.push(newRow);
          }

          const builder = {
            select: () => builder,
            single: async () => ({ data: inserted[0], error: null }),
            then: (resolve: any, reject: any) => {
              return Promise.resolve({ data: inserted, error: null }).then(
                resolve,
                reject
              );
            },
          };

          return builder;
        },

        update: (updates: any) => {
          if (forcedError) {
            const err = forcedError;
            const errorBuilder = {
              eq: () => errorBuilder,
              then: (resolve: any, reject: any) =>
                Promise.resolve({ data: null, error: err }).then(resolve, reject),
            };
            return errorBuilder;
          }

          const builder = {
            eq: (col: string, val: any) => {
              const matching = orders.filter((row: any) => row[col] === val);
              for (const row of matching) {
                Object.assign(row, updates);
              }
              return builder;
            },
            then: (resolve: any, reject: any) => {
              return Promise.resolve({ data: null, error: null }).then(
                resolve,
                reject
              );
            },
          };

          return builder;
        },
      };
    },
  } as unknown as SupabaseClient & {
    orders: OrderDbRow[];
    setForcedError: (err: { message: string } | null) => void;
  };

  return db;
}

