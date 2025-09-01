import { Mark, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface HighlightAttributes {
  id: string
  color: string
  userId: string
  userName?: string
  userAvatar?: string
  note?: string
  createdAt: number
}

export interface HighlightOptions {
  HTMLAttributes: Record<string, string | number | boolean>
  multicolor: boolean
  highlights: HighlightAttributes[]
  onHighlightClick?: (highlight: HighlightAttributes) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    highlight: {
      setHighlight: (attributes?: HighlightAttributes) => ReturnType
      toggleHighlight: (attributes?: HighlightAttributes) => ReturnType
      unsetHighlight: () => ReturnType
    }
  }
}

const HighlightExtension = Mark.create<HighlightOptions>({
  name: 'highlight',

  addOptions() {
    return {
      multicolor: true,
      HTMLAttributes: {},
      highlights: [],
      onHighlightClick: undefined,
    }
  },

  addAttributes() {
    if (!this.options.multicolor) {
      return {}
    }

    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-highlight-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-highlight-id': attributes.id,
          }
        },
      },
      color: {
        default: null,
        parseHTML: element => element.getAttribute('data-color') || element.style.backgroundColor,
        renderHTML: attributes => {
          if (!attributes.color) {
            return {}
          }
          return {
            'data-color': attributes.color,
            style: `background-color: ${attributes.color}; cursor: pointer; position: relative;`,
          }
        },
      },
      userId: {
        default: null,
        parseHTML: element => element.getAttribute('data-user-id'),
        renderHTML: attributes => {
          if (!attributes.userId) {
            return {}
          }
          return {
            'data-user-id': attributes.userId,
          }
        },
      },
      userName: {
        default: null,
        parseHTML: element => element.getAttribute('data-user-name'),
        renderHTML: attributes => {
          if (!attributes.userName) {
            return {}
          }
          return {
            'data-user-name': attributes.userName,
          }
        },
      },
      note: {
        default: null,
        parseHTML: element => element.getAttribute('data-note'),
        renderHTML: attributes => {
          if (!attributes.note) {
            return {}
          }
          return {
            'data-note': attributes.note,
            title: attributes.note, // Show note on hover
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'mark[data-highlight-id]',
      },
      {
        tag: 'span[data-highlight-id]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setHighlight:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },
      toggleHighlight:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes)
        },
      unsetHighlight:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },

  addProseMirrorPlugins() {
    const { onHighlightClick } = this.options

    return [
      new Plugin({
        key: new PluginKey('highlightClick'),
        props: {
          handleClick: (view, pos, event) => {
            if (!onHighlightClick) return false

            const { schema, doc } = view.state
            const range = doc.resolve(pos)
            const marks = range.marks()
            
            const highlightMark = marks.find(mark => mark.type === schema.marks.highlight)
            
            if (highlightMark && highlightMark.attrs.id) {
              event.preventDefault()
              onHighlightClick(highlightMark.attrs as HighlightAttributes)
              return true
            }
            
            return false
          },
        },
      }),
      new Plugin({
        key: new PluginKey('highlightDecoration'),
        state: {
          init: () => DecorationSet.empty,
          apply: (tr, set) => {
            // Update decorations if needed
            return set.map(tr.mapping, tr.doc)
          },
        },
        props: {
          decorations(state) {
            const { doc, schema } = state
            const decorations: Decoration[] = []
            
            doc.descendants((node, pos) => {
              if (node.isText && node.marks.length) {
                node.marks.forEach(mark => {
                  if (mark.type === schema.marks.highlight) {
                    // Add animation class to highlighted text
                    const from = pos
                    const to = pos + node.nodeSize
                    decorations.push(
                      Decoration.inline(from, to, {
                        class: 'highlight-animated',
                        style: `
                          background-image: linear-gradient(${mark.attrs.color || '#FFEB3B'}, ${mark.attrs.color || '#FFEB3B'});
                          background-repeat: no-repeat;
                          background-size: 100% 100%;
                          background-position: 0 0;
                          animation: highlight-fade-in 0.4s ease-out;
                          cursor: pointer;
                          position: relative;
                          transition: filter 0.2s ease;
                        `,
                      })
                    )
                  }
                })
              }
            })
            
            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})

export default HighlightExtension