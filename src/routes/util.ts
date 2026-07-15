export const authFetch = (url: string) => fetch(url, {
  redirect: 'follow',
  headers: { 'x-api-key': process.env.CF_API_KEY ?? "" },
})

export const getDownloadUrl = (id: string, file: string | number) => `https://api.curseforge.com/v1/mods/${id}/files/${file}/download-url`
export const fetchDownloadUrl = (id: string, file: string | number) => authFetch(getDownloadUrl(id, file))

export const getRedirectUrl = async (response: Response) => {
  const json = await response.json() as { data: string }
  return json.data
}

export const getFirst = (str: string | string[]) => {
  return Array.isArray(str) ? str[0] : str;
}

// Marks a redirect that the cloudflare worker should follow itself, streaming
// the file back rather than passing the redirect on to the client
export const FOLLOW_REDIRECT_HEADER = "X-CurseMaven-Follow";
