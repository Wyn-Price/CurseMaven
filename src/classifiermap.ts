//fileIds = 2724420-sources-2724421-api-2724422
//returns:
// {
//   main: '2724420',
//   classifierMap: {
//     sources: '2724421',
//     api: '2724422'
//   }
// }
//
// Will also return null if no main file id can be found.
const createClassifierMap = (fileIds: string) => {
  if (fileIds.length > 100) {
    return null
  }
  let regexResult: RegExpExecArray

  const mainFileIdRegex = /^\d+/
  const mainFileMatch = fileIds.match(mainFileIdRegex)
  if (mainFileMatch === null) {
    return null
  }
  const main = mainFileMatch[0]
  const classifierMap: Record<string, string> = {}

  //Populate the classifier map:
  const fileIdLocationRegex = /-(.+?)-(\d+)/g
  while ((regexResult = fileIdLocationRegex.exec(fileIds)) !== null) {
    //fileIds: -sources-2724421
    //  classifier: sources
    //  id: 2724421
    const classifier = regexResult[1]
    const id = regexResult[2]

    classifierMap[classifier] = id
  }

  const leftoverClassifiers = fileIds.replace(mainFileIdRegex, "").replace(fileIdLocationRegex, "")
  const sequentialRegex = /-([^-]+)/g
  let sequentialCounter = 1
  while ((regexResult = sequentialRegex.exec(leftoverClassifiers)) !== null) {
    //fileIds: -sources
    //  classifier: sources
    //  id: $mainid + (++$sequentialCounter)

    classifierMap[regexResult[1]] = String(parseInt(main) + (sequentialCounter++))
  }

  return { main, classifierMap }
}

export default createClassifierMap