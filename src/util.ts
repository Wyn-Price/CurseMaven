export const authFetch = (url: string) => fetch(url, {
    headers: {
        'x-api-key': process.env.API_KEY ?? ""
    }
})

export const getDownloadUrl = (id: string, file: string | number) => `https://api.curseforge.com/v1/mods/${id}/files/${file}/download-url`
export const fetchDownloadUrl = (id: string, file: string | number) => authFetch(getDownloadUrl(id, file))

export const getFetchedData = async (response: Response) => {
    const json = await response.json() as { data: string }
    return json.data
}

export const isLatinLetter = (c: string) => c.toUpperCase() === c.toLowerCase()

export const partition = <T>(arr: T[], fn: (t: T) => boolean) : T[][] => {
    const a: T[] = []
    const b: T[] = []

    arr.forEach((t) =>{
        if (fn(t)) {
            a.push(t)
        } else {
            b.push(t)
        }
    })
    return [a, b]
}