export const authFetch = (url: string) => fetch(url, { headers: { 'x-api-key': process.env.API_KEY ?? "" } })

export const getDownloadUrl = (id: string, file: string | number) => `https://api.curseforge.com/v1/mods/${id}/files/${file}/download-url`
export const fetchDownloadUrl = (id: string, file: string | number) => authFetch(getDownloadUrl(id, file))

export const getFetchedData = async (response: Response) => {
  const json = await response.json() as { data: string }
  return json.data
}

//Gets the redirect url for the given url. An example of this download url would be: https://edge.forgecdn.net/files/2724/420/jei_1.12.2-4.15.0.281.jar
//
//Due to an issue with apache's http client which gradle uses, some characters will be decoded, but not encoded.
//This in junction with curseforge's media server needing the correct encoding means redirecting to the media server won't always work.
//A fix for this is to redirect to `/download-binary/...`, instead of `https://media.forgecdn.net/files/...`. Doing this means I have to encode the
//Jar name twice (hopfully) meaning that the apache issues don't occur, as the special characters won't show up in the decoding.
//The `/download-binary/` is just a reverse proxy to the forge media server, however I'm not too sure that it doesn't use up bandwidth when downloading the jar, so I only use this when I need to.
//
//If the file name (jei_1.12.2-4.15.0.281.jar) contains any problematic characters then return a redirect to `/download-binary/`, otherwise it redirects to curseforge's media server.
//
//
//2022-01-02T06:14:58.021+0000 [DEBUG] [org.gradle.internal.resource.transport.http.HttpClientConfigurer$DowngradeProtectingRedirectStrategy] Redirect requested to location 'https://media.forgecdn.net/files/3335/93/BetterFoliage-2.6.5%2B368b50a-Fabric-1.16.5.jar'
//2022-01-02T06:14:58.022+0000 [DEBUG] [org.apache.http.impl.execchain.RedirectExec] Resetting target auth state
//2022-01-02T06:14:58.022+0000 [DEBUG] [org.apache.http.impl.execchain.RedirectExec] Redirecting to 'https://media.forgecdn.net/files/3335/93/BetterFoliage-2.6.5+368b50a-Fabric-1.16.5.jar' via {s}->https://media.forgecdn.net:443
//
//Decoding is done at URLEncodedUtils#urlDecode
//Call stack is below (line numbers are the line of the next call):
//DefaultRedirectStrategy#getLocationURI L 97
//URIUtils#normalizeSyntax L 196
//new URIBuilder --> URIBuilder#digestURI --> URIBuilder#parsePath L 157
//URLEncodedUtils#parsePathSegments L 236
//URLEncodedUtils#urlDecode
export const getRedirectUrl = (url: string) => {

  //The file name will be the last one. The reason I pop to get the raw file name instead of just doing `split[6]`, is as `split` is joined back if there are no problematic chars.
  var split = url.split('\/')
  var rawFileName = split.pop()
  var fileName = encodeURIComponent(rawFileName)

  // If there are problematic chars then redirect internally.
  if (rawFileName.includes("+")) {
    //We have to encode it twice for this to work with gradle
    return `/download-binary/${split[4]}/${split[5]}/${encodeURIComponent(fileName)}`
  } else if (rawFileName.toLowerCase().includes("%2b")) {
    // It seems like sometimes, curseforge returns the %2b instead of the +, which we need to account for
    return `/download-binary/${split[4]}/${split[5]}/${fileName}`
  } else {
    return split.join('/') + '/' + fileName
  }
}