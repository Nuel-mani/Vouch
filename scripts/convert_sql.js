/**
 * Convert PostgreSQL pg_dump SQL to Supabase-compatible INSERT statements
 * Usage: node convert_sql.js
 * 
 * Tables are ordered to respect foreign key dependencies
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '..', 'vouch_data_backup.sql');
const OUTPUT_FILE = path.join(__dirname, '..', 'vouch_data_inserts.sql');

// Table order for FK dependencies (parent tables first)
const TABLE_ORDER = [
    'sectors',           // No dependencies
    'users',             // References sectors
    'admin_users',       // No dependencies  
    'system_settings',   // No dependencies
    'strategic_insights',// No dependencies
    'brands',            // References users
    'subscriptions',     // References users
    'starting_balances', // References users
    'refresh_tokens',    // References users
    'audit_logs',        // References users
    'balance_history',   // References users
    'invoices',          // References users
    'transactions',      // References users, invoices
    'tax_filings',       // References users
    'subscription_history', // References users
    'brand_change_history', // References users
    'password_reset_requests', // References users
    'compliance_requests', // References users
];

// Read the SQL file
const sql = fs.readFileSync(INPUT_FILE, 'utf8');
const lines = sql.split('\n');

// Store table data separately for reordering
const tableData = {};
let inCopyBlock = false;
let currentTable = '';
let currentColumns = [];
let copyData = [];

// Parse all COPY blocks
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect COPY statement start
    const copyMatch = line.match(/^COPY public\.(\w+)\s*\(([^)]+)\)\s*FROM stdin;$/);
    if (copyMatch) {
        inCopyBlock = true;
        currentTable = copyMatch[1];
        currentColumns = copyMatch[2].split(',').map(c => c.trim().replace(/"/g, ''));
        copyData = [];
        continue;
    }

    // End of COPY block
    if (inCopyBlock && line === '\\.') {
        if (copyData.length > 0) {
            tableData[currentTable] = {
                columns: currentColumns,
                rows: copyData
            };
        }
        inCopyBlock = false;
        currentTable = '';
        currentColumns = [];
        copyData = [];
        continue;
    }

    // Collect data rows within COPY block
    if (inCopyBlock && line.trim() !== '') {
        copyData.push(line);
    }
}

// Build output in correct order
let output = [];
output.push('-- Vouch Data Import for Supabase');
output.push('-- Generated: ' + new Date().toISOString());
output.push('-- This file contains INSERT statements only (no schema)');
output.push('-- Tables ordered by FK dependencies (parent tables first)');
output.push('');
output.push('-- Disable triggers during import for performance');
output.push('SET session_replication_role = replica;');
output.push('');

// Output tables in specified order
for (const tableName of TABLE_ORDER) {
    const data = tableData[tableName];
    if (!data || data.rows.length === 0) continue;

    output.push(`-- Data for table: ${tableName} (${data.rows.length} rows)`);

    for (const row of data.rows) {
        const values = parseTabSeparatedRow(row);
        if (values.length === data.columns.length) {
            const formattedValues = values.map(formatValue).join(', ');
            output.push(`INSERT INTO "${tableName}" ("${data.columns.join('", "')}") VALUES (${formattedValues}) ON CONFLICT DO NOTHING;`);
        }
    }
    output.push('');

    // Remove from tableData to track what's been processed
    delete tableData[tableName];
}

// Output any remaining tables not in TABLE_ORDER
for (const tableName of Object.keys(tableData)) {
    if (tableName === '_prisma_migrations') continue; // Skip Prisma internal

    const data = tableData[tableName];
    if (!data || data.rows.length === 0) continue;

    output.push(`-- Data for table: ${tableName} (${data.rows.length} rows)`);

    for (const row of data.rows) {
        const values = parseTabSeparatedRow(row);
        if (values.length === data.columns.length) {
            const formattedValues = values.map(formatValue).join(', ');
            output.push(`INSERT INTO "${tableName}" ("${data.columns.join('", "')}") VALUES (${formattedValues}) ON CONFLICT DO NOTHING;`);
        }
    }
    output.push('');
}

// Re-enable triggers
output.push('-- Re-enable triggers');
output.push('SET session_replication_role = DEFAULT;');
output.push('');
output.push('-- Update sequences to match inserted data (wrapped in try-catch for safety)');
output.push(`DO $$ BEGIN`);
output.push(`  PERFORM setval('invoices_serial_id_seq', COALESCE((SELECT MAX(serial_id) FROM invoices), 1));`);
output.push(`EXCEPTION WHEN undefined_table THEN NULL; END $$;`);
output.push(`DO $$ BEGIN`);
output.push(`  PERFORM setval('transactions_serial_id_seq', COALESCE((SELECT MAX(serial_id) FROM transactions), 1));`);
output.push(`EXCEPTION WHEN undefined_table THEN NULL; END $$;`);
output.push(`DO $$ BEGIN`);
output.push(`  PERFORM setval('users_serial_id_seq', COALESCE((SELECT MAX(serial_id) FROM users), 1));`);
output.push(`EXCEPTION WHEN undefined_table THEN NULL; END $$;`);
output.push(`DO $$ BEGIN`);
output.push(`  PERFORM setval('sectors_id_seq', COALESCE((SELECT MAX(id) FROM sectors), 1));`);
output.push(`EXCEPTION WHEN undefined_table THEN NULL; END $$;`);

// Write output
fs.writeFileSync(OUTPUT_FILE, output.join('\n'));
console.log(`✅ Converted SQL saved to: ${OUTPUT_FILE}`);
console.log(`   Total lines: ${output.length}`);
console.log(`   Tables processed in order: ${TABLE_ORDER.join(', ')}`);

/**
 * Parse a tab-separated row from pg_dump COPY format
 */
function parseTabSeparatedRow(row) {
    return row.split('\t');
}

/**
 * Format a value for SQL INSERT
 */
function formatValue(val) {
    // NULL values
    if (val === '\\N') {
        return 'NULL';
    }

    // Boolean
    if (val === 't') return 'TRUE';
    if (val === 'f') return 'FALSE';

    // Numbers (integers and decimals)
    if (/^-?\d+(\.\d+)?$/.test(val)) {
        return val;
    }

    // JSON objects/arrays
    if ((val.startsWith('{') && val.endsWith('}')) ||
        (val.startsWith('[') && val.endsWith(']'))) {
        // Escape single quotes and wrap in quotes
        return `'${val.replace(/'/g, "''")}'`;
    }

    // UUID pattern
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
        return `'${val}'`;
    }

    // Escape backslashes and single quotes, then wrap in quotes
    const escaped = val
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "''");

    return `'${escaped}'`;
}
