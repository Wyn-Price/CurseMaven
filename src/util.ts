import fetch from "node-fetch"

export const getDownloadUrl = (id: any, file: any) => `https://addons-ecs.forgesvc.net/api/v2/addon/${id}/file/${file}/download-url`
export const fetchDownloadUrl = (id: any, file: any) => fetch(getDownloadUrl(id, file))

//Gets the redirect url for the given url. An example of this download url would be: https://edge.forgecdn.net/files/2724/420/jei_1.12.2-4.15.0.281.jar
//
//Due to an issue with apache's http client which gradle uses, some characters will be decoded, but not encoded. 
//This in junction with curseforge's media server needing the correct encoding means redirecting to the media server won't always work.
//A fix for this is to redirect to `/download-binary/...`, instead of `https://media.forgecdn.net/files/...`. Doing this means I have to encode the
//Jar name twice (hopfully) meaning that the apache issues don't occur, as the special characters won't show up in the decoding.
//The `/download-binary/` is just a reverse proxy to the forge media server, however I'm not too sure that it doesn't use up bandwidth when downloading the jar, so I only use this when I need to.
//
//If the file name (jei_1.12.2-4.15.0.281.jar) contains any problematic characters then return a redirect to `/download-binary/`, otherwise it redirects to curseforge's media server.
export const getRedirectUrl = (url: string) => {
  var problematicChars = "! $ & ' ( ) + , ; = @".split(" ")

  //The file name will be the last one. The reason I pop to get the raw file name instead of just doing `split[6]`, is as `split` is joined back if there are no problematic chars.
  var split = url.split('\/')
  var rawFileName = split.pop()
  var fileName = encodeURIComponent(rawFileName)

  //If there are problematic chars then redirect internally.
  if (problematicChars.some(char => rawFileName.includes(char))) {
    const a = `/download-binary/${split[4]}/${split[5]}/${encodeURIComponent(fileName)}` //We have to encode it twice for this to work with gradle
    return a
  } else {
    return split.join('/') + '/' + fileName
  }
}
