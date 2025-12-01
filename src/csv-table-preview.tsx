import { Box, Card, Text } from '@sanity/ui'
import React from 'react'
import { PreviewProps } from 'sanity'

import { CsvRowData, CsvTableView } from './csv-table-input'

export function CsvTablePreview(props: PreviewProps) {
    const { title: _title, subtitle: _subtitle, ...rest } = props
    // The data is passed in the "selection" or directly as value depending on how it's selected
    // In our schema, we selected "data" as "data"
    // However, for object previews, the value is often passed directly if not using "select"
    // Let's inspect what we get. Usually for custom object preview, we get the whole object as `value` if we don't define `select` or if we do.
    // Wait, `PreviewProps` has `title`, `subtitle`, `media`, etc.
    // If we want the raw data, we need to look at how we defined the preview in schema.ts.

    // Actually, for a custom component at the type level (components.preview),
    // Sanity passes the value of the field.
    // Let's cast it to our expected type.
    const tableData = props as unknown as { data?: CsvRowData[] }

    if (!tableData.data || tableData.data.length === 0) {
        return (
            <Card padding={3} tone="transparent">
                <Text muted>No CSV data</Text>
            </Card>
        )
    }

    return (
        <Card padding={3} border>
            <Box>
                <Text size={1} weight="semibold" style={{ marginBottom: '0.5rem' }}>
                    CSV Table Preview ({tableData.data.length} rows)
                </Text>
                <CsvTableView data={tableData.data} />
            </Box>
        </Card>
    )
}
