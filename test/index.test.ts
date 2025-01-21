import createMarkdownIt from 'markdown-it'
import { codeToHtml, createHighlighter } from 'shiki'
import { describe, expect, it } from 'vitest'
import createMarkdownItAsync from '../src/'

const fixture = `
# Hello

Some code 

\`\`\`ts
console.log('Hello')
\`\`\`
`

describe('markdown-it-async', async () => {
  using shiki = await createHighlighter({
    themes: ['vitesse-light'],
    langs: ['ts'],
  })

  const mds = createMarkdownIt({
    highlight(str, lang) {
      return shiki.codeToHtml(str, { lang, theme: 'vitesse-light' })
    },
  })
  const expectedResult = mds.render(fixture)

  it('exported', async () => {
    const mda = createMarkdownItAsync({
      async highlight(str, lang) {
        return await codeToHtml(str, {
          lang,
          theme: 'vitesse-light',
        })
      },
    })

    expect(expectedResult)
      .toEqual(await mda.renderAsync(fixture))
  })

  it('via optons set', async () => {
    const mda = createMarkdownItAsync()

    mda.use((md) => {
      // @ts-expect-error cast, not yet have a solution to override this type
      md.options.highlight = async (str, lang) => {
        return await codeToHtml(str, {
          lang,
          theme: 'vitesse-light',
        })
      }
    })

    expect(expectedResult).toEqual(await mda.renderAsync(fixture))
  })
})
