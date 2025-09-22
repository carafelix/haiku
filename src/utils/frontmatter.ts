export function populateFrontmatter() {
    return function (tree: any, file: any): void {
        file.data.astro.frontmatter.imgp = 'HIJO DE PUTA'
        // file.path
    }
}
