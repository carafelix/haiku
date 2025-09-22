import { remark } from 'astro:remark'
import frontmatter from 'remark-frontmatter'
import { visit } from 'unist-util-visit'

// Custom plugin to add/modify frontmatter
function addFrontmatterPlugin(frontmatterData) {
    return (tree, file) => {
        let hasFrontmatter = false

        // Check if frontmatter already exists
        visit(tree, 'yaml', (node) => {
            hasFrontmatter = true
            // You could modify existing frontmatter here
        })

        // If no frontmatter exists, add it at the beginning
        if (!hasFrontmatter && tree.children.length > 0) {
            const yamlNode = {
                type: 'yaml',
                value: Object.entries(frontmatterData)
                    .map(
                        ([key, value]) =>
                            `${key}: ${JSON.stringify(
                                value
                            )}`
                    )
                    .join('\n'),
            }
            tree.children.unshift(yamlNode)
        }
    }
}

// Usage
const markdownContent = `# My Document

This is some content.`

const result = await remark()
    .use(frontmatter, ['yaml'])
    .use(addFrontmatterPlugin, {
        title: 'My Document',
        date: '2023-10-01',
        tags: ['javascript', 'markdown'],
    })
    .process(markdownContent)

console.log(result.toString())
