import { TrashIcon, UploadIcon } from '@sanity/icons'
import { Badge, Box, Button, Card, Flex, Label, Stack, Text, TextArea, TextInput, useToast } from '@sanity/ui'
import Papa from 'papaparse'
import React, { useCallback, useId, useState } from 'react'
import { PatchEvent, set, unset } from 'sanity'
// Sanity specific types for the custom input component
import { ObjectInputProps } from 'sanity'

// Type for the final data structure stored in Sanity
// Type for the final data structure stored in Sanity
export interface CsvRowData {
    _type: 'csvRow'
    _key: string
    cells: string[]
}

// Custom props for our input component
// We use ObjectInputProps directly to satisfy Sanity's type requirements
type CsvTableInputProps = ObjectInputProps

// Utility to generate a unique key for array items
const generateKey = () => Math.random().toString(36).substring(2, 9)

interface CsvTableViewProps {
    data: CsvRowData[]
    onCellChange?: (rowKey: string, cellIndex: number, newValue: string) => void
}

export const CsvTableView = ({ data, onCellChange }: CsvTableViewProps) => {
    return (
        <Box overflow="auto" padding={1}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    {data.map((row) => (
                        <tr key={row._key}>
                            {row.cells.map((cell, cellIndex) => (
                                <td key={cellIndex} style={{ padding: '4px', minWidth: '150px' }}>
                                    <TextInput
                                        value={cell}
                                        onChange={
                                            onCellChange
                                                ? (e) => onCellChange(row._key, cellIndex, e.currentTarget.value)
                                                : undefined
                                        }
                                        readOnly={!onCellChange}
                                        fontSize={1}
                                        padding={2}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </Box>
    )
}

export const CsvTableInput = (props: CsvTableInputProps): React.JSX.Element => {
    const { onChange, value: rawValue, elementProps } = props;
    const value = rawValue as { data?: CsvRowData[] } | undefined;
    const toast = useToast()
    const inputId = useId()

    const [rawInput, setRawInput] = useState<string>('')
    const [parsing, setParsing] = useState(false)

    // Helper function to update the Sanity value
    const updateSanityValue = useCallback(
        (parsedRows: string[][]) => {
            // 1. Map parsed rows (array of arrays of strings) to Sanity's structured array type (array of objects)
            const newTableData: CsvRowData[] = parsedRows.map((row) => ({
                _type: 'csvRow',
                _key: generateKey(),
                cells: row.map((cell) => cell.trim()),
            }))

            // 2. Create the patch event
            const newData = newTableData.length > 0 ? newTableData : undefined
            const patch = set(newData, ['data']) // Target the 'data' field within the parent object

            // 3. Dispatch the patch
            onChange(PatchEvent.from([patch]))
            setRawInput('') // Clear raw input after successful parse
        },
        [onChange],
    )

    // Handler for parsing the raw input (either from file or text area)
    const handleParse = useCallback(() => {
        if (!rawInput) {
            toast.push({
                status: 'warning',
                title: 'Input Empty',
                description: 'Please upload a file or paste CSV text.',
            })
            return
        }

        setParsing(true)
        Papa.parse(rawInput, {
            header: false, // Assume no header for simple row parsing
            skipEmptyLines: true,
            complete: (results) => {
                setParsing(false)
                if (results.data.length === 0) {
                    toast.push({
                        status: 'error',
                        title: 'Parsing Failed',
                        description: 'Could not extract any data. Check the format.',
                    })
                    return
                }

                // Results.data is an array of arrays (string[][])
                updateSanityValue(results.data as string[][])

                toast.push({
                    status: 'success',
                    title: 'Data Imported',
                    description: `Successfully imported ${results.data.length} rows.`,
                })
            },
            error: (error: Error) => {
                setParsing(false)
                toast.push({
                    status: 'error',
                    title: 'CSV Error',
                    description: error.message,
                })
            },
        })
    }, [rawInput, updateSanityValue, toast])

    // Handler for file uploads
    const handleFileChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0]
            if (!file || !file.name.endsWith('.csv')) {
                toast.push({
                    status: 'error',
                    title: 'Invalid File',
                    description: 'Please select a CSV file.',
                })
                return
            }

            const reader = new FileReader()
            reader.onload = (e) => {
                const csvText = e.target?.result as string
                setRawInput(csvText)
                toast.push({
                    status: 'info',
                    title: 'File Loaded',
                    description: `CSV content loaded into text area. Click "Parse and Load" to process.`,
                })
            }
            reader.onerror = () => {
                toast.push({
                    status: 'error',
                    title: 'File Read Error',
                    description: 'Could not read the file.',
                })
            }
            reader.readAsText(file)
        },
        [toast],
    )

    // Handler to clear all data
    const handleClear = useCallback(() => {
        onChange(PatchEvent.from([unset(['data'])]))
        setRawInput('')
        toast.push({
            status: 'info',
            title: 'Data Cleared',
            description: 'The table data has been removed from the document.',
        })
    }, [onChange, toast])

    // Handler for updating a single cell
    const handleCellChange = useCallback(
        (rowKey: string, cellIndex: number, newValue: string) => {
            onChange(PatchEvent.from([set(newValue, ['data', { _key: rowKey }, 'cells', cellIndex])]))
        },
        [onChange],
    )

    const rows = value?.data?.length ?? 0

    return (
        <Card padding={4} border radius={3} tone="default" {...elementProps}>
            <Stack space={4}>
                <Text weight="semibold">CSV Data Importer</Text>

                {/* 1. File Upload Area */}
                <Card border radius={2} padding={3}>
                    <Label htmlFor={`${inputId}-file`}>1. Upload a CSV File</Label>
                    <input
                        id={`${inputId}-file`}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <Flex align="center" gap={3} marginTop={2}>
                        <Button
                            text="Choose CSV File"
                            icon={UploadIcon}
                            onClick={useCallback(
                                () => document.getElementById(`${inputId}-file`)?.click(),
                                [inputId],
                            )}
                            mode="bleed"
                            tone="primary"
                            disabled={parsing}
                        />
                        {rawInput && (
                            <Badge tone="primary" padding={2} radius={3}>
                                Content Ready
                            </Badge>
                        )}
                    </Flex>
                </Card>

                {/* 2. Manual Text Input */}
                <Card border radius={2} padding={3}>
                    <Label htmlFor={`${inputId}-text`}>2. Or Paste Raw CSV Text</Label>
                    <TextArea
                        id={`${inputId}-text`}
                        rows={5}
                        value={rawInput}
                        onChange={useCallback(
                            (event: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setRawInput(event.currentTarget.value),
                            [],
                        )}
                        placeholder="Paste your comma-separated values (CSV) here..."
                        disabled={parsing}
                    />
                </Card>

                {/* 3. Action Buttons */}
                <Flex gap={2} justify="flex-start" wrap="wrap">
                    <Button
                        text={parsing ? 'Parsing...' : 'Parse and Load Data'}
                        icon={UploadIcon}
                        tone="positive"
                        onClick={handleParse}
                        disabled={!rawInput || parsing}
                        padding={3}
                    />
                    <Button
                        text="Clear All"
                        icon={TrashIcon}
                        tone="critical"
                        onClick={handleClear}
                        disabled={rows === 0 && !rawInput}
                        mode="ghost"
                        padding={3}
                    />
                </Flex>

                {/* 4. Status/Preview & Editable Table */}
                {rows > 0 && (
                    <Stack space={3}>
                        <Card tone="caution" padding={3} radius={2}>
                            <Text size={1} weight="semibold">
                                ✅ Data Loaded: {rows} Rows
                            </Text>
                            <Text size={1} muted>
                                You can edit the values directly in the table below.
                            </Text>
                        </Card>

                        <CsvTableView data={value?.data || []} onCellChange={handleCellChange} />
                    </Stack>
                )}
            </Stack>
        </Card>
    )
}
