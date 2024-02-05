import {ModFileMetadata, ModFileResponse, ModMetadata} from "./cfmetadata";
import {authFetch} from "../util";

export type SuccessfulCurseForgeResponse<T> = {
    success: true,
    data: T,
}

export type CurseForgeResponse<T> = {
    success: false,
    message: string,
    status: number,
} | SuccessfulCurseForgeResponse<T>;

export const fetchModFile = async (modId: string, fileId: string): Promise<CurseForgeResponse<ModFileMetadata>> => {
    const response = await authFetch(`https://api.curseforge.com/v1/mods/${modId}/files/${fileId}`)
    if (!response.ok) return {
        success: false,
        message: `Error loading mod file from curse forge. The status was: ${response.status}, the message was: '${response.statusText}'.`,
        status: response.status
    }
    return {
        success: true,
        data: (await response.json()).data
    }
}

export const fetchAllModFiles = async (modId: string): Promise<CurseForgeResponse<ModFileMetadata[]>> => {
    const fileMetadata: ModFileMetadata[] = []
    let totalFiles = 1
    let index = 0
    while (index < totalFiles) {
        const fetch = await authFetch(`https://api.curseforge.com/v1/mods/${modId}/files?index=${index}`)

        if (!fetch.ok) {
            return {
                success: false,
                message: `Failed to fetch file information for mod: '${modId}' from curse forge.`,
                status: fetch.status
            }
        }

        const response: ModFileResponse = await fetch.json()
        totalFiles = response.pagination.totalCount
        index += response.pagination.resultCount
        fileMetadata.push(...response.data)
    }
    return {
        success: true,
        data: fileMetadata
    }
}


export const fetchModMetadata = async (modId: string): Promise<CurseForgeResponse<ModMetadata>> => {
    const response = await authFetch(`https://api.curseforge.com/v1/mods/${modId}`)
    if (!response.ok) return {
        success: false,
        message: `Error loading mod metadata from curse forge. The status was: ${response.status}, the message was: '${response.statusText}'.`,
        status: response.status
    }
    return {
        success: true,
        data: (await response.json()).data
    }
}