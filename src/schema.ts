import { defineArrayMember, defineField, definePlugin, defineType } from 'sanity'

import { CsvTableInput } from './csv-table-input'

/**
 * Defines the structure for a single row in our table data.
 * Each document in the table data array will be of this type.
 */
const CsvRow = defineType({
    name: 'csvRow',
    title: 'Row',
    type: 'object',
    fields: [
        defineField({
            name: 'cells',
            title: 'Cells',
            type: 'array',
            of: [{ type: 'string' }],
            // Hide the input for cells in the regular form view, as it's managed by the custom input.
            readOnly: true,
        }),
    ],
    preview: {
        select: {
            cells: 'cells',
        },
        prepare(selection) {
            const { cells } = selection
            // Show the first few cells as a preview in the array item list
            const previewText = cells?.slice(0, 5).join(', ') ?? 'Empty Row'
            return {
                title: previewText.length > 50 ? `${previewText.substring(0, 47)}...` : previewText,
                subtitle: `Total Cells: ${cells?.length ?? 0}`,
            }
        },
    },
})

/**
 * Defines the main custom type that editors will use in their schemas.
 * @public
 */
export const csvTableType = defineType({
    name: 'csvTable',
    title: 'CSV Data Table',
    type: 'object',
    fields: [
        defineField({
            name: 'data',
            title: 'Table Data (Rows)',
            type: 'array',
            of: [defineArrayMember(CsvRow)], // Array of our custom row objects
        }),
    ],
    // 💡 CRITICAL: Link the custom React component to this field type
    components: {
        input: CsvTableInput,
    },
})

/**
 * The plugin definition that bundles the types.
 * @public
 */
export const csvTablePlugin = definePlugin({
    name: 'sanity-plugin-csv-table-input',
    schema: {
        types: [csvTableType, CsvRow],
    },
})
