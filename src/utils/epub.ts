#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

const contentDir = 'src/content'
const imgsDir = `${contentDir}/imgs`
const outputDir = 'output'

async function createEpubWithImages() {
    try {
        // Create output directory
        await Deno.mkdir(outputDir, { recursive: true })

        // Create temporary directory
        const tempDir = await Deno.makeTempDir({
            prefix: 'epub-',
        })
        console.log(`📁 Using temp directory: ${tempDir}`)

        // Get all markdown files
        const files = Deno.readDirSync(contentDir)
            .filter(
                (file) =>
                    file.isFile && file.name.endsWith('.md')
            )
            .toArray()

        if (files.length === 0) {
            throw new Error(
                `No markdown files found in ${contentDir}`
            )
        }

        const processedFiles: string[] = []

        for (const mdFile of files) {
            const filename = mdFile.name.replace('.md', '')
            const mdPath = `${contentDir}/${mdFile.name}`
            const tempMdPath = `${tempDir}/${mdFile.name}`

            const imgPath = `./${imgsDir}/${filename}.jpg`

            const content =
                `![](${imgPath})` +
                `\n\n## ` +
                (await Deno.readTextFile(mdPath))
                    .replace(/\|\|.+\|\|/, '')
                    .replaceAll(/\n{3,}/g, '\n\n') +
                '<span class="pagebreak"></span>'

            // Write original content to temp file
            await Deno.writeTextFile(tempMdPath, content)

            processedFiles.push(tempMdPath)
        }
        processedFiles.push('src/utils/creditos.md')
        // Create CSS for page breaks
        const cssContent = `
div.span {
    page-break-after: always
}
img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 2em auto;
}
`
        const cssPath = `${tempDir}/style.css`
        await Deno.writeTextFile(cssPath, cssContent)

        // Build pandoc command
        const pandocArgs = [
            ...processedFiles,
            '-o',
            `${outputDir}/俳句.epub`,
            '--css',
            cssPath,
            '--metadata',
            'title=俳句',
            '--toc-depth=2',
        ]

        const pandocCmd = new Deno.Command('pandoc', {
            args: pandocArgs,
        })

        console.log('📚 Generating EPUB with pandoc...')

        const { success, stdout, stderr } =
            await pandocCmd.output()

        if (!success) {
            const errorText = new TextDecoder().decode(
                stderr
            )
            throw new Error(`Pandoc failed: ${errorText}`)
        }

        if (stderr.length > 0) {
            const warnText = new TextDecoder().decode(
                stderr
            )
            console.warn('Pandoc warnings:', warnText)
        }

        console.log(
            `✅ EPUB created successfully at ${outputDir}/book.epub`
        )

        // Cleanup temp directory
        await Deno.remove(tempDir, { recursive: true })
    } catch (error) {
        console.error('❌ Error:', error)
        Deno.exit(1)
    }
}

// Run the script
if (import.meta.main) {
    createEpubWithImages()
}

export { createEpubWithImages }
