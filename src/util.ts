export const authFetch = (url: string) => fetch(url, { headers: { 'x-api-key': process.env.API_KEY ?? "" } })

export const getDownloadUrl = (id: string, file: string | number) => `https://api.curseforge.com/v1/mods/${id}/files/${file}/download-url`
export const fetchDownloadUrl = (id: string, file: string | number) => authFetch(getDownloadUrl(id, file))

export const getFetchedData = async (response: Response) => {
  const json = await response.json() as { data: string }
  return json.data
}