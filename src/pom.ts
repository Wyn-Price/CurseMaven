import {RequestHandler} from "express";
import {CurseForgeError, fetchAllModFiles, fetchModMetadata, isLatinLetter, partition, wasErroneous} from "./util";
import {ModFileDependency, ModFileDependencyType, ModFileMetadata, ModMetadata} from "./modmetadata";

export const generatePom = async (id: any, fileIds: string, descriptor: string): Promise<string | CurseForgeError> => {
    const metadata = await fetchModMetadata(id)
    if (wasErroneous(metadata)) {
        return metadata
    }

    const modFiles = await fetchAllModFiles(id)
    if (wasErroneous(modFiles)) {
        return modFiles
    }

    const file = modFiles.find((it) => it.id === parseInt(fileIds, 10))
    const publicationMillis = filePublicationMillis(file);
    const dependencies = file.dependencies
        .filter((it: ModFileDependency) =>
            it.relationType === ModFileDependencyType.RequiredDependency ||
            it.relationType === ModFileDependencyType.Include ||
            it.relationType === ModFileDependencyType.Tool)
        .map(async (dep: ModFileDependency) => await resolveDependencyFile(dep.modId + "", publicationMillis, file.gameId, file.gameVersions))

    const dependencyStringsOrError = await Promise.all(dependencies);
    for (const e of dependencyStringsOrError) {
        if (wasErroneous(e)) {
            return e
        }
    }
    const dependenciesString = dependencyStringsOrError
        .map((it) => it as ResolvedModDependency)
        .map((it) => {
            return `<dependency>
                <groupId>curse.maven</groupId>
                <artifactId>${it.mod.slug}-${it.mod.id}</artifactId>
                <version>${it.file.id}</version>
            </dependency>`
        }).join("\n")

    return (
        `<?xml version="1.0" encoding="UTF-8"?>
    <project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd" xmlns="http://maven.apache.org/POM/4.0.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <modelVersion>4.0.0</modelVersion>
      <groupId>curse.maven</groupId>
      <artifactId>${descriptor}</artifactId>
      <version>${fileIds}</version>
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

const pom: RequestHandler = async (req, res) => {
    const {descriptor, fileIds} = req.params
    const {id} = res.locals

    const pom = await generatePom(id, fileIds, descriptor);
    if (wasErroneous(pom)) {
        res.status(pom.status)
        return res.send(pom.message)
    }
    return res.send(pom)
}

const filePublicationMillis = (file: ModFileMetadata) => new Date(file.fileDate).getTime()

const hasIntersections = (a: string[], b: string[]): boolean => a.filter((e) => b.includes(e)).length !== 0

interface ResolvedModDependency {
    mod: ModMetadata,
    file: ModFileMetadata
}

// Take the ID of the dependency, and the publicationTime, gameId, and gameVersion from the parent mod.
// We then look for the most recent date before the parent dependency was published and make sure the
// gameIds and gameVersions match up right.
const resolveDependencyFile = async (
    id: string,
    publicationMillis: number,
    gameId: number,
    environment: string[],
): Promise<ResolvedModDependency | CurseForgeError> => {
    const [gameVersions, modLoaders] = partition(environment, (t) => isLatinLetter(t.charAt(0)))

    const modFiles = await fetchAllModFiles(id)
    if (wasErroneous(modFiles)) return modFiles
    const modMetadata = await fetchModMetadata(id);
    if (wasErroneous(modMetadata)) return modMetadata
    return {
        mod: modMetadata,
        file: modFiles
                .filter((file) => file.isAvailable)
                .filter((file) => filePublicationMillis(file) <= publicationMillis)
                .sort((f, s) => filePublicationMillis(s) - filePublicationMillis(f))
                .find((file) => {
                        const [fileGameVersions, fileModLoaders] = partition(file.gameVersions, (t) => isLatinLetter(t.charAt(0)))
                        return file.gameId === gameId &&
                            hasIntersections(modLoaders, fileModLoaders) &&
                            hasIntersections(gameVersions, fileGameVersions)
                    }
                )
            ?? modFiles.find((file) => modMetadata.mainFileId === file.id)
    }
}

export default pom