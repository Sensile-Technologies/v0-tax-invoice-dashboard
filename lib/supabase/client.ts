"use client";

export function createClient() {
  return {
    from: (table: string) => createQueryBuilder(table),
    auth: createAuthClient(),
  };
}

function createQueryBuilder(table: string) {
  let whereConditions: { column: string; operator: string; value: any }[] = [];
  let selectColumns = '*';
  let singleResult = false;

  const builder = {
    select: (columns = '*') => {
      selectColumns = columns;
      return builder;
    },
    insert: async (data: any | any[]) => {
      try {
        const response = await fetch(`/api/db/${table}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data }),
        });
        const result = await response.json();
        if (!response.ok) return { data: null, error: { message: result.error } };
        return { data: result, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    },
    update: async (data: any) => {
      try {
        const response = await fetch(`/api/db/${table}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, where: whereConditions }),
        });
        const result = await response.json();
        if (!response.ok) return { data: null, error: { message: result.error } };
        return { data: result, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    },
    delete: async () => {
      try {
        const response = await fetch(`/api/db/${table}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ where: whereConditions }),
        });
        const result = await response.json();
        if (!response.ok) return { data: null, error: { message: result.error } };
        return { data: result, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
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
    then: async (resolve: any, reject?: any) => {
      try {
        const params = new URLSearchParams();
        whereConditions.forEach((cond, i) => {
          params.append(`filter_${i}`, `${cond.column}:${cond.operator}:${cond.value}`);
        });
        if (singleResult) params.append('single', 'true');
        
        const response = await fetch(`/api/db/${table}?${params.toString()}`);
        const result = await response.json();
        
        if (!response.ok) {
          resolve({ data: null, error: { message: result.error } });
          return;
        }
        
        const data = singleResult ? (result[0] || null) : result;
        resolve({ data, error: null });
      } catch (error: any) {
        if (reject) {
          reject(error);
        } else {
          resolve({ data: null, error: { message: error.message } });
        }
      }
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
