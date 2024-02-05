import {RequestHandler} from "express";
import {
    isLatinLetter,
    partition,
} from "./util";
import {ModFileDependency, ModFileDependencyType, ModFileMetadata, ModMetadata} from "./cfapi/cfmetadata";
import {
    CurseForgeResponse,
    fetchAllModFiles,
    fetchModFile,
    fetchModMetadata,
    SuccessfulCurseForgeResponse
} from "./cfapi/cffetch";

export const generatePom = async (id: any, fileId: string, descriptor: string): Promise<CurseForgeResponse<string>> => {
    const metadataResponse = await fetchModMetadata(id)
    if (metadataResponse.success === false) return metadataResponse

    const fileResponse = await fetchModFile(id, fileId)
    if (fileResponse.success === false) return fileResponse
    const publicationMillis = filePublicationMillis(fileResponse.data);
    const dependencies = fileResponse.data.dependencies
        .filter((it: ModFileDependency) =>
            it.relationType === ModFileDependencyType.RequiredDependency ||
            it.relationType === ModFileDependencyType.Include ||
            it.relationType === ModFileDependencyType.Tool)
        .map(async (dep: ModFileDependency) => await resolveDependencyFile(dep.modId + "", publicationMillis, fileResponse.data.gameId, fileResponse.data.gameVersions))

    const dependencyStringsOrError = await Promise.all(dependencies);
    for (const e of dependencyStringsOrError) {
        if (e.success === false) {
            return e
        }
    }
    const dependenciesString = dependencyStringsOrError
        .map((it) => (it as SuccessfulCurseForgeResponse<ResolvedModDependency>).data)
        .map((it) => {
            return `<dependency>
                <groupId>curse.maven</groupId>
                <artifactId>${it.mod.slug}-${it.mod.id}</artifactId>
                <version>${it.file.id}</version>
            </dependency>`
        }).join("\n")

    return {
        success: true,
        data: (
            `<?xml version="1.0" encoding="UTF-8"?>
    <project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd" xmlns="http://maven.apache.org/POM/4.0.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <modelVersion>4.0.0</modelVersion>
      <groupId>curse.maven</groupId>
      <artifactId>${descriptor}</artifactId>
      <version>${fileId}</version>
      <repositories>
        <repository>
          <id>curse-maven</id>
          <url>https://cursemaven.com</url>
        </repository>
      </repositories>
      <dependencies>${dependenciesString}</dependencies>
    </project>`
        )
    }
}

const pom: RequestHandler = async (req, res) => {
    const {descriptor, fileIds} = req.params
    const {id} = res.locals

    const pomResponse = await generatePom(id, fileIds, descriptor);
    if (pomResponse.success === false) {
        res.status(pomResponse.status)
        return res.send(pomResponse.message)
    }
    return res.send(pomResponse.data)
}

const filePublicationMillis = (file: ModFileMetadata) => new Date(file.fileDate).getTime()

const hasIntersections = (a: string[], b: string[]): boolean => a.some((e) => b.includes(e))

type ResolvedModDependency = {
    mod: ModMetadata,
    file: ModFileMetadata
}

// Resolution Process:
// Step 1: Fetch and filter all files of the given mod that are:
//    - 3rd party available
//    - Published before the publication date of the calling mod
//    - Sort them in order from oldest to latest
// Step 2: Find the most recent file from step 1 that is of the same
//         Game and is for a compatible environment (same mod loaders/version)
// Step 3: If step 2 failed, return the most recent file from step 1
// Step 4: If step 3 failed, return the mainFile from the mod metadata
// Step 5: If step 4 failed, return an error.
const resolveDependencyFile = async (
    id: string,
    publicationMillis: number,
    gameId: number,
    environment: string[],
): Promise<CurseForgeResponse<ResolvedModDependency>> => {
    // The parameters 'environment' is really just a list of modloader ID's and
    // Minecraft versions. ModLoaders will probably always start with a letter, and
    // Minecraft versions will start with numbers (like 15w15a, or 1.20.1, etc.)
    // To separate them we split the list into 2 based on if its starts with a latin
    // alphabetical letter or not.
    const [modLoaders, gameVersions] = partition(environment, (t) => isLatinLetter(t.charAt(0)))

    const modFilesResponse = await fetchAllModFiles(id)
    if (modFilesResponse.success === false) return modFilesResponse
    const modMetadataResponse = await fetchModMetadata(id);
    if (modMetadataResponse.success === false) return modMetadataResponse

    let returnFile: ModFileMetadata

    // ----- STEP 1 -----
    const recentApplicableFiles = modFilesResponse.data
        .filter((file) => file.isAvailable)
        .filter((file) => filePublicationMillis(file) <= publicationMillis)
        .sort((f, s) => filePublicationMillis(s) - filePublicationMillis(f))

    // ----- STEP 2 -----
    returnFile = recentApplicableFiles.find((file) => {
            const [fileModLoaders, fileGameVersions] = partition(file.gameVersions, (t) => isLatinLetter(t.charAt(0)))
            return file.gameId === gameId &&
                hasIntersections(modLoaders, fileModLoaders) &&
                hasIntersections(gameVersions, fileGameVersions)
        }
    )

    // ----- STEP 3 -----
    if (!returnFile) {
        returnFile = recentApplicableFiles[0]
    }

    // ----- STEP 4 -----
    if (!returnFile) {
        returnFile = modFilesResponse.data.find((file) => modMetadataResponse.data.mainFileId === file.id)
    }

    // ----- STEP 5 (sanity check) -----
    if (!returnFile) {
        return {
            success: false,
            message: `Failed to find an appropriate file dependency for project: '${id}'`,
            status: 500
        }
    }

    return {
        success: true,
        data: {
            mod: modMetadataResponse.data,
            file: returnFile
        }
    }
}

export default pom