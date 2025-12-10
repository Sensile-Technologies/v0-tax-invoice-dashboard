import { query, queryOne, execute } from '../db/client';

export async function createClient() {
  return {
    from: (table: string) => createQueryBuilder(table),
    auth: createAuthClient(),
  };
}

function createQueryBuilder(table: string) {
  let selectColumns = '*';
  let whereConditions: { column: string; operator: string; value: any }[] = [];
  let orderByColumn: string | null = null;
  let orderDirection: 'asc' | 'desc' = 'asc';
  let limitCount: number | null = null;
  let singleResult = false;

  const builder = {
    select: (columns = '*') => {
      selectColumns = columns;
      return builder;
    },
    insert: async (data: any | any[]) => {
      const rows = Array.isArray(data) ? data : [data];
      if (rows.length === 0) return { data: [], error: null };
      
      const columns = Object.keys(rows[0]);
      const values = rows.map((row, i) => 
        `(${columns.map((_, j) => `$${i * columns.length + j + 1}`).join(', ')})`
      ).join(', ');
      const params = rows.flatMap(row => columns.map(col => row[col]));
      
      try {
        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${values} RETURNING *`;
        const result = await query(sql, params);
        return { data: result, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    },
    update: async (data: any) => {
      const columns = Object.keys(data);
      const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
      const params = columns.map(col => data[col]);
      
      let sql = `UPDATE ${table} SET ${setClause}`;
      let paramIndex = params.length;
      
      if (whereConditions.length > 0) {
        const whereClauses = whereConditions.map((cond, i) => {
          paramIndex++;
          return `${cond.column} ${cond.operator} $${paramIndex}`;
        });
        sql += ` WHERE ${whereClauses.join(' AND ')}`;
        params.push(...whereConditions.map(c => c.value));
      }
      
      sql += ' RETURNING *';
      
      try {
        const result = await query(sql, params);
        return { data: result, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    },
    delete: async () => {
      let sql = `DELETE FROM ${table}`;
      const params: any[] = [];
      
      if (whereConditions.length > 0) {
        const whereClauses = whereConditions.map((cond, i) => {
          return `${cond.column} ${cond.operator} $${i + 1}`;
        });
        sql += ` WHERE ${whereClauses.join(' AND ')}`;
        params.push(...whereConditions.map(c => c.value));
      }
      
      sql += ' RETURNING *';
      
      try {
        const result = await query(sql, params);
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
    like: (column: string, value: any) => {
      whereConditions.push({ column, operator: 'LIKE', value });
      return builder;
    },
    ilike: (column: string, value: any) => {
      whereConditions.push({ column, operator: 'ILIKE', value });
      return builder;
    },
    is: (column: string, value: any) => {
      whereConditions.push({ column, operator: 'IS', value });
      return builder;
    },
    in: (column: string, values: any[]) => {
      whereConditions.push({ column, operator: 'IN', value: values });
      return builder;
    },
    order: (column: string, options?: { ascending?: boolean }) => {
      orderByColumn = column;
      orderDirection = options?.ascending === false ? 'desc' : 'asc';
      return builder;
    },
    limit: (count: number) => {
      limitCount = count;
      return builder;
    },
    single: () => {
      singleResult = true;
      limitCount = 1;
      return builder;
    },
    maybeSingle: () => {
      singleResult = true;
      limitCount = 1;
      return builder;
    },
    then: async (resolve: any, reject?: any) => {
      try {
        let sql = `SELECT ${selectColumns} FROM ${table}`;
        const params: any[] = [];
        let paramIndex = 0;
        
        if (whereConditions.length > 0) {
          const whereClauses = whereConditions.map(cond => {
            if (cond.operator === 'IN') {
              const placeholders = cond.value.map(() => `$${++paramIndex}`).join(', ');
              params.push(...cond.value);
              return `${cond.column} IN (${placeholders})`;
            } else if (cond.operator === 'IS') {
              return `${cond.column} IS ${cond.value}`;
            } else {
              paramIndex++;
              params.push(cond.value);
              return `${cond.column} ${cond.operator} $${paramIndex}`;
            }
          });
          sql += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        
        if (orderByColumn) {
          sql += ` ORDER BY ${orderByColumn} ${orderDirection.toUpperCase()}`;
        }
        
        if (limitCount !== null) {
          sql += ` LIMIT ${limitCount}`;
        }
        
        const result = await query(sql, params);
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
