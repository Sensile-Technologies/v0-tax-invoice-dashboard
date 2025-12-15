"use client";

interface QueryResult<T = any> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

interface QueryBuilder {
  select: (columns?: string) => QueryBuilder;
  insert: (data: any | any[]) => QueryBuilder;
  update: (data: any) => QueryBuilder;
  delete: () => QueryBuilder;
  eq: (column: string, value: any) => QueryBuilder;
  neq: (column: string, value: any) => QueryBuilder;
  gt: (column: string, value: any) => QueryBuilder;
  gte: (column: string, value: any) => QueryBuilder;
  lt: (column: string, value: any) => QueryBuilder;
  lte: (column: string, value: any) => QueryBuilder;
  single: () => QueryBuilder;
  maybeSingle: () => QueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => QueryBuilder;
  limit: (count: number) => QueryBuilder;
  then: <TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>;
}

export function createClient() {
  return {
    from: (table: string): QueryBuilder => createQueryBuilder(table),
    auth: createAuthClient(),
  };
}

function createQueryBuilder(table: string): QueryBuilder {
  let whereConditions: { column: string; operator: string; value: any }[] = [];
  let selectColumns = '*';
  let singleResult = false;
  let pendingInsertData: any = null;
  let pendingUpdateData: any = null;
  let pendingDelete = false;

  const executeInsert = async (): Promise<QueryResult> => {
    try {
      const response = await fetch(`/api/db/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: pendingInsertData }),
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(`API returned non-JSON response for ${table}:`, text.substring(0, 200));
        return { data: null, error: { message: `Server error: Expected JSON but received ${contentType || 'unknown content type'}` } };
      }
      
      const result = await response.json();
      if (!response.ok) return { data: null, error: { message: result.error || 'Unknown error' } };
      const data = singleResult ? (result[0] || null) : result;
      return { data, error: null };
    } catch (error: any) {
      console.error(`Insert error for ${table}:`, error);
      return { data: null, error: { message: error.message } };
    }
  };

  const executeUpdate = async (): Promise<QueryResult> => {
    try {
      const response = await fetch(`/api/db/${table}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: pendingUpdateData, where: whereConditions }),
      });
      const result = await response.json();
      if (!response.ok) return { data: null, error: { message: result.error } };
      const data = singleResult ? (result[0] || null) : result;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  };

  const executeDelete = async (): Promise<QueryResult> => {
    try {
      const response = await fetch(`/api/db/${table}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ where: whereConditions }),
      });
      const result = await response.json();
      if (!response.ok) return { data: null, error: { message: result.error } };
      const data = singleResult ? (result[0] || null) : result;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  };

  const executeSelect = async (): Promise<QueryResult> => {
    try {
      const params = new URLSearchParams();
      whereConditions.forEach((cond, i) => {
        params.append(`filter_${i}`, `${cond.column}:${cond.operator}:${cond.value}`);
      });
      if (singleResult) params.append('single', 'true');
      
      const response = await fetch(`/api/db/${table}?${params.toString()}`);
      const result = await response.json();
      
      if (!response.ok) {
        return { data: null, error: { message: result.error } };
      }
      
      const data = singleResult ? (result[0] || null) : result;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  };

  const execute = async (): Promise<QueryResult> => {
    if (pendingInsertData !== null) {
      return executeInsert();
    } else if (pendingUpdateData !== null) {
      return executeUpdate();
    } else if (pendingDelete) {
      return executeDelete();
    } else {
      return executeSelect();
    }
  };

  const builder: QueryBuilder = {
    select: (columns = '*') => {
      selectColumns = columns;
      return builder;
    },
    insert: (data: any | any[]) => {
      pendingInsertData = data;
      return builder;
    },
    update: (data: any) => {
      pendingUpdateData = data;
      return builder;
    },
    delete: () => {
      pendingDelete = true;
      return builder;
    },
    eq: (column: string, value: any) => {
      whereConditions.push({ column, operator: '=', value });
      return builder;
    },
    neq: (column: string, value: any) => {
      whereConditions.push({ column, operator: '!=', value });
      return builder;
    },
    gt: (column: string, value: any) => {
      whereConditions.push({ column, operator: '>', value });
      return builder;
    },
    gte: (column: string, value: any) => {
      whereConditions.push({ column, operator: '>=', value });
      return builder;
    },
    lt: (column: string, value: any) => {
      whereConditions.push({ column, operator: '<', value });
      return builder;
    },
    lte: (column: string, value: any) => {
      whereConditions.push({ column, operator: '<=', value });
      return builder;
    },
    single: () => {
      singleResult = true;
      return builder;
    },
    maybeSingle: () => {
      singleResult = true;
      return builder;
    },
    order: (column: string, options?: { ascending?: boolean }) => {
      return builder;
    },
    limit: (count: number) => {
      return builder;
    },
    then: (onfulfilled, onrejected) => {
      return execute().then(onfulfilled, onrejected);
    },
  };

  return builder;
}

function createAuthClient() {
  return {
    getUser: async () => {
      return { data: { user: null }, error: null };
    },
    getSession: async () => {
      return { data: { session: null }, error: null };
    },
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      return { data: { user: null, session: null }, error: { message: 'Local auth not implemented' } };
    },
    signUp: async (credentials: { email: string; password: string }) => {
      return { data: { user: null, session: null }, error: { message: 'Local auth not implemented' } };
    },
    signOut: async () => {
      return { error: null };
    },
    onAuthStateChange: (callback: any) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  };
}
