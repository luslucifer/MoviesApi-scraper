import * as cheerio from 'cheerio'
import CryptoJSAesJson from './cryptojs/f'
import { key } from './cryptojs/f'
import 'colors'
import JSON5 from 'json5'
import { JSObj } from './types/jsObj'
// import { Result } from '../../utils/types'
// import { result } from '../../utils/types'


export class MoviesApi {
    private id: string
    private ss: string | null
    private ep: string | null
    private type: string
    private url: string
    private root: string
    private header: any
    private user_agent: string
    private referer : any
    constructor(id: string, ss: string | null = null, ep: string | null = null) {
        this.id = id
        this.ss = ss
        this.ep = ep
        this.root = 'https://moviesapi.club'
        this.user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0'
        this.type = ss && ep ? 'tv' : 'movie'
        this.url = !ss && !ep ? `${this.root}/${this.type}/${this.id}` : `${this.root}/${this.type}/${this.id}-${this.ss}-${this.ep}`
        this.header = { 'Referer': this.root + '/', 'User-agent': this.user_agent }
    }

    async fetch(url: string, headers: any = {}): Promise<Response> {
        console.log(`fetching   `.cyan + url.green)
        const u = new URL(url)
        const host = u.hash
        const origin = u.origin
        const generated_header = { 'Host': host, 'Origin': origin }
        const res = await fetch(url, { headers: { ...this.header, ...generated_header, ...headers } })
        if (res.status == 200) {
            // console.log(`fetching link ${url.green.bold} was a  `.blue+ 'success'.green )
            console.log('successed !!!'.green.bold)
        }
        return res
    }
    async scraper(): Promise<JSObj | null> {
        try {

            let res = await this.fetch(this.url)
            if (res.status == 200) {
                console.error(`successfully fetched  `.cyan + this.url.red)
                let html = await res.text()
                let $ = cheerio.load(html)
                const title = $('title')
                if (title.text().length == 0) {
                    console.error(` sorry the ${this.type} isnt available in  `.yellow + this.root.red)
                    return null
                }
                const iframe_src = $('iframe').attr('src')
                this.referer = iframe_src
                res = await this.fetch(iframe_src)
                if (res.status == 200) {
                    html = await res.text()
                    let pattern = /'[^]+'/
                    let match = html.match(pattern)
                    if (match) {
                        const encryptedContent = match[0].replace(/'/g, '') // removing all ( ' ) 
                        console.log(`encrypted content length ${encryptedContent.length.toString().america}`.green)
                        const decryptedContent = CryptoJSAesJson.decrypt(encryptedContent, key)
                        // fs.writeFileSync('o.js' ,decryptedContent)
                        pattern = /(?<=var\s+config\s*=\s*){([^]*?)\};/ //  to scrape config obj 
                        const config_obj = decryptedContent.match(pattern)
                        if (config_obj) {
                            // let config = JSON.parse(config_obj[0].trim())
                            const jsObj: JSObj = JSON5.parse(config_obj[0].replace(';', ''))
                            // console.log(jsObj)
                            return jsObj
                        }
                        else {
                            console.log('no configObj found update pattern or contact '.red + 'nameless monster '.america)
                            return null
                        }

                    } else {
                        console.log('no encrypted content found '.red)
                        return null
                    }

                } else {
                    console.error(`error : ${res.status.toString().bold} during fetching `.red + iframe_src.green + `\nperhaps it is down atm or headers need to be changed  `.yellow)
                    return null
                }
            }
            else {
                console.error(`something went wrong during fetching link `.cyan + this.url.red)
                return null
            }

        } catch (error) {
            console.error(error)
        }
        // console.log(this.url)
        // console.log(html)
    }
    async main() :Promise<JSObj|any> {
        const res = await this.scraper()
        if (res) {
            const url = new URL(this.referer)
            const obj= {
                url: res.sources.map(obj => {
                    return { lang: 'english', 'link': obj.file, type: obj.type }
                }),
                headers: {"DNT":"1","Referer":url.origin+'/',"Sec-Fetch-Dest":"empty","Sec-Fetch-Mode":"cors","Sec-Fetch-Site":"cross-site","Sec-GPC":"1","User-Agent":"Mozilla/5.0 (Windows NT 10.0; rv:130.0) Gecko/20100101 Firefox/130.0"},
                tracks: res.tracks.map(obj => { if (obj.label) { return { lang: obj.label, url: obj.file } } }),
                provider: 'moviesApi',
                servers: [],
                thumbnail: res.tracks.find(obj => obj.kind == 'thumbnails').file
            }
            return obj
        }
        return { 'message': 'something went wrong ' }
    }
}


const mv =  new MoviesApi('597')
// const mv = new MoviesApi('1399','1','1') // for tv seris 


mv.main().then(res => console.log(res))
