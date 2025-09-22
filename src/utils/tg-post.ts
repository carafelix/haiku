// scrip to push a channel post
import {
    Api,
    InputFile,
} from 'https://deno.land/x/grammy/mod.ts'
import { autoRetry } from 'https://deno.land/x/grammy_auto_retry@v2.0.2/mod.ts'

const SECRETS = [
    Deno.env.get('BOT_TOKEN'),
    Deno.env.get('CHAT_ID'),
    Deno.env.get('POST_COUNTER'),
]
const [BOT_TOKEN, CHAT_ID, POST_COUNTER] = SECRETS

if (!BOT_TOKEN || !CHAT_ID || !POST_COUNTER) {
    const missing = Object.entries({
        BOT_TOKEN,
        CHAT_ID,
        POST_COUNTER,
    })
        .filter(([_key, value]) => !value)
        .map(([key, _value]) => key)
        .join(', ')
    throw `❌ Missing the following env variables: ${missing}. Please provide a working .env file`
}

const api = new Api(BOT_TOKEN)
api.config.use(autoRetry())

const SPECIAL_CHARS = [
    '_',
    '*',
    '~',
    '`',
    '>',
    '<',
    '&',
    '#',
    '+',
    '-',
    '=',
    '{',
    '}',
    '.',
    '/',
    '!',
]

function escapeMarkdown(text: string, list?: string[]) {
    ;(list || SPECIAL_CHARS).forEach(
        (char) =>
            (text = text.replaceAll(char, `\\${char}`))
    )
    return text
}

const mds = Deno.readDirSync('src/content')
    .filter((file) => file.name.endsWith('.md'))
    .toArray()
    .toSorted((a, b) => a.name.localeCompare(b.name))

if (+POST_COUNTER + 1 === mds.length)
    throw 'Reached the last post of the list'

const filename = mds[+POST_COUNTER].name
const [og, toSkip] = Deno.readTextFileSync(
    `src/content/${filename}`
).split('浮世絵:')

const content =
    og + '浮世絵:' + escapeMarkdown(toSkip, ['(', ')'])

await api.sendPhoto(
    CHAT_ID,
    new InputFile(
        `src/content/imgs/${filename.replace(
            '.md',
            ''
        )}.jpg`
    ),
    {
        parse_mode: 'MarkdownV2',
        caption: escapeMarkdown(content),
    }
)

Deno.writeTextFileSync(
    '.env',
    `BOT_TOKEN=${BOT_TOKEN}\nCHAT_ID=${CHAT_ID}\nPOST_COUNTER=${
        +POST_COUNTER + 1
    }`
)
