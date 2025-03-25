import createMarkdownIt from 'markdown-it'
import { codeToHtml, createHighlighter } from 'shiki'
import { describe, expect, it, vi } from 'vitest'
import createMarkdownItAsync from '../src'

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
      // @ts-expect-error cast, patched in dist
      md.options.highlight = async (str, lang) => {
        return await codeToHtml(str, {
          lang,
          theme: 'vitesse-light',
        })
      }
    })

    expect(expectedResult).toEqual(await mda.renderAsync(fixture))
  })

  it('warn', () => {
    const mda = createMarkdownItAsync({
      warnOnSyncRender: true,
    })

    const spy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {})

    mda.render(fixture)

    expect.soft(spy)
      .toHaveBeenCalledWith('[markdown-it-async] Please use `md.renderAsync` instead of `md.render`')

    spy.mockRestore()
  })

  it('async rules', async () => {
    const mda = createMarkdownItAsync({
      async highlight(str, lang) {
        return await codeToHtml(str, {
          lang,
          theme: 'vitesse-light',
        })
      },
    })

    const mock = vi.fn()

    Object.entries(mda.renderer.rules).forEach(([key, rule]) => {
      if (typeof rule === 'function') {
        mda.renderer.asyncRules[key] = async (tokens, index, options, env?: any) => {
          await new Promise(resolve => setTimeout(resolve, 10))
          mock()
          return rule(tokens, index, options, env, mda.renderer)
        }
      }
    })

    expect(expectedResult)
      .toEqual(await mda.renderAsync(fixture))
    expect(mock).toHaveBeenCalled()
  })
})
