# sanity-plugin-csv-table-input

A Sanity plugin that provides a custom input component for importing CSV data directly into your Sanity content. It parses CSV files or pasted text and stores the data as a structured array of objects.

## Installation

```bash
npm install sanity-plugin-csv-table-input
```

## Usage

Add it as a plugin in `sanity.config.ts` (or .js):

```ts
import {defineConfig} from 'sanity'
import {csvTablePlugin} from 'sanity-plugin-csv-table-input'

export default defineConfig({
  // ...
  plugins: [csvTablePlugin()],
})
```

## Schema Configuration

You can use the `csvTable` type in your schema definitions. This type provides the custom input component for managing CSV data.

```ts
// schema/myDocument.ts
import {defineType} from 'sanity'

export default defineType({
  name: 'myDocument',
  title: 'My Document',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'tableData',
      title: 'CSV Table Data',
      type: 'csvTable', // Use the custom type provided by the plugin
    },
  ],
})
```

## Features

- **File Upload**: Upload `.csv` files directly.
- **Paste Text**: Paste raw CSV text into a text area.
- **Parsing**: Automatically parses CSV data using `papaparse`.
- **Preview**: Shows a preview of the loaded data (number of rows).
- **Clear Data**: Easily clear the imported data.

## License

[MIT](LICENSE) © Methuselah Nwodobeh

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.


## License

[BSD 3-Clause "New" or "Revised"](LICENSE) © Methuselah Nwodobeh


### Release new version

Run ["CI & Release" workflow](https://github.com/ProfessorBlackman/sanity-csv-table-input/actions/workflows/main.yml).
Make sure to select the main branch and check "Release new version".

Semantic release will only release on configured branches, so it is safe to run release on any branch.