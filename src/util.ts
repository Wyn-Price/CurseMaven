import {ModFileMetadata, ModFileResponse, ModMetadata} from "./modmetadata";

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

export interface CurseForgeError {
    message: string,
    status: number,
}

export const wasErroneous = (value: any | CurseForgeError): value is CurseForgeError => typeof value === "object" && "message" in value

export const fetchModFile = async (modId: string, fileId: string): Promise<ModFileMetadata | CurseForgeError> => {
    const response = (await authFetch(`https://api.curseforge.com/v1/mods/${modId}/files/${fileId}`))
    if (!response.ok) return {message: `Error loading mod file from curse forge. The status was: ${response.status}, the message was: '${response.statusText}'.`, status: response.status}
    return (await response.json()).data
}

export const fetchAllModFiles = async (modId: string): Promise<ModFileMetadata[] | CurseForgeError> => {
    let fileMetadata: ModFileMetadata[] = []
    let totalFiles = 1
    let index = 0
    while (index < totalFiles) {
        const fetch = (await authFetch(`https://api.curseforge.com/v1/mods/${modId}/files?index=${index}`))

        if (!fetch.ok) {
            return {message: `Failed to fetch file information for mod: '${modId}' from curse forge.`, status: fetch.status}
        }

        const response: ModFileResponse = await fetch.json()
        totalFiles = response.pagination.totalCount
        index += response.pagination.resultCount
        fileMetadata = [...fileMetadata, ...response.data]
    }
    return fileMetadata
}


export const fetchModMetadata = async (modId: string): Promise<ModMetadata | CurseForgeError> =>{
    const response = (await authFetch(`https://api.curseforge.com/v1/mods/${modId}`))
    if (!response.ok) return {message: `Error loading mod metadata from curse forge. The status was: ${response.status}, the message was: '${response.statusText}'.`, status: response.status}
    return (await response.json()).data
}
