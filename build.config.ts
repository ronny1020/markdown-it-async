import fs from 'node:fs/promises'
import { glob } from 'tinyglobby'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: 'node16',
  clean: true,
  hooks: {
    'build:done': async () => {
      for (const file of await glob('./dist/*.d.{cts,mts,ts}')) {
        let content = await fs.readFile(file, 'utf-8')
        // Override `options` type on dist dts only
        let newContent = content.replace(
          'class MarkdownItAsync extends MarkdownIt {',
          'class MarkdownItAsync extends MarkdownIt {\n     // @ts-ignore\n    options: MarkdownItAsyncOptions',
        )
        if (content === newContent)
          throw new Error(`Failed to replace for ${file}`)
        content = newContent
        newContent = content.replace(
          'import MarkdownIt',
          'import type MarkdownIt',
        )
        if (content === newContent)
          throw new Error(`Failed to replace for ${file}`)
        await fs.writeFile(file, newContent, 'utf-8')
      }
    },
  },
})
