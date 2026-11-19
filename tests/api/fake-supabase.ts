// A small in-memory stand-in for the Supabase query builder, covering the
// calls the paid-path handlers make. Rows are plain objects; unique columns
// raise Postgres error 23505 like the real constraints do.

type Row = Record<string, any>;
type Filter = (row: Row) => boolean;

const UNIQUE_COLUMNS: Record<string, string[]> = {
  purchases: ['stripe_session_id'],
  users: ['email', 'google_id', 'apple_id'],
};

function matchesContained(value: any, expected: any): boolean {
  if (expected && typeof expected === 'object') {
    return value && typeof value === 'object'
      && Object.entries(expected).every(([key, inner]) => matchesContained(value[key], inner));
  }
  return value === expected;
}

export class FakeSupabase {
  tables: Record<string, Row[]> = {};
  rpcHandler: ((name: string, args: any) => { data: any; error: any }) | null = null;
  // Columns that do not exist yet (simulating an unapplied migration).
  missingColumns: Record<string, string[]> = {};
  private nextId = 1;

  constructor(seed: Record<string, Row[]> = {}) {
    Object.entries(seed).forEach(([table, rows]) => {
      this.tables[table] = rows.map((row) => ({ ...row }));
    });
  }

  rows(table: string): Row[] {
    return (this.tables[table] ||= []);
  }

  rpc(name: string, args: any) {
    if (!this.rpcHandler) return Promise.resolve({ data: null, error: { code: 'PGRST202', message: 'function not found' } });
    return Promise.resolve(this.rpcHandler(name, args));
  }

  from(table: string) {
    return new FakeQuery(this, table);
  }

  newId(): string {
    return `row_${this.nextId++}`;
  }

  missingColumnIn(table: string, payload: Row): string | undefined {
    return (this.missingColumns[table] || []).find((column) => column in payload);
  }
}

class FakeQuery {
  private op: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private filters: Filter[] = [];
  private filterColumns: string[] = [];
  private payload: Row | null = null;
  private returnRows = false;
  private singleRow = false;
  private limitCount: number | null = null;

  constructor(private db: FakeSupabase, private table: string) {}

  select(_columns?: string, _options?: unknown) {
    if (this.op !== 'select') this.returnRows = true;
    return this;
  }

  insert(payload: Row) { this.op = 'insert'; this.payload = payload; return this; }
  update(payload: Row) { this.op = 'update'; this.payload = payload; return this; }
  upsert(payload: Row) { this.op = 'insert'; this.payload = payload; return this; }
  delete() { this.op = 'delete'; return this; }

  eq(column: string, value: any) { this.filterColumns.push(column); this.filters.push((row) => row[column] === value); return this; }
  is(column: string, value: any) { this.filterColumns.push(column); this.filters.push((row) => (row[column] ?? null) === value); return this; }
  contains(column: string, value: any) { this.filters.push((row) => matchesContained(row[column], value)); return this; }
  order() { return this; }
  limit(count: number) { this.limitCount = count; return this; }
  single() { this.singleRow = true; return this; }

  then<T>(resolve: (value: { data: any; error: any }) => T, reject?: (reason: unknown) => T) {
    return Promise.resolve(this.execute()).then(resolve, reject);
  }

  private execute(): { data: any; error: any } {
    const rows = this.db.rows(this.table);
    const missingFilter = this.filterColumns.find((column) => (this.db.missingColumns[this.table] || []).includes(column));
    if (missingFilter) return { data: null, error: { code: '42703', message: `column users.${missingFilter} does not exist` } };
    const matching = () => rows.filter((row) => this.filters.every((filter) => filter(row)));

    if (this.op === 'select') {
      let found = matching();
      if (this.limitCount !== null) found = found.slice(0, this.limitCount);
      return this.finish(found.map((row) => ({ ...row })));
    }

    if (this.op === 'insert' || this.op === 'update') {
      const missing = this.db.missingColumnIn(this.table, this.payload!);
      if (missing) return { data: null, error: { code: 'PGRST204', message: `Could not find the '${missing}' column` } };
    }

    if (this.op === 'insert') {
      const row = { id: this.db.newId(), ...this.payload };
      const conflict = (UNIQUE_COLUMNS[this.table] || []).find((column) =>
        row[column] != null && rows.some((existing) => existing[column] === row[column]));
      if (conflict) return { data: null, error: { code: '23505', message: `duplicate key on ${conflict}` } };
      rows.push(row);
      return this.finish([{ ...row }]);
    }

    if (this.op === 'update') {
      const updated = matching();
      updated.forEach((row) => Object.assign(row, this.payload));
      return this.finish(updated.map((row) => ({ ...row })));
    }

    const removed = matching();
    this.db.tables[this.table] = rows.filter((row) => !removed.includes(row));
    return { data: null, error: null };
  }

  private finish(found: Row[]) {
    if (this.op !== 'select' && !this.returnRows && !this.singleRow) return { data: null, error: null };
    if (this.singleRow) {
      return found.length === 1
        ? { data: found[0], error: null }
        : { data: null, error: { code: 'PGRST116', message: 'not a single row' } };
    }
    return { data: found, error: null };
  }
}

export function response() {
  const res: any = { statusCode: 200, body: null, headers: {}, redirectedTo: null };
  res.status = (status: number) => { res.statusCode = status; return res; };
  res.json = (body: unknown) => { res.body = body; return res; };
  res.end = () => res;
  res.setHeader = (key: string, value: unknown) => { res.headers[key.toLowerCase()] = value; };
  res.redirect = (status: number, url: string) => { res.statusCode = status; res.redirectedTo = url; return res; };
  return res;
}
