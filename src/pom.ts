import {RequestHandler} from "express";
import {CurseForgeError, fetchAllModFiles, fetchModMetadata, wasErroneous} from "./util";
import {ModFileDependency, ModFileDependencyType, ModFileMetadata, ModMetadata} from "./modmetadata";

const pom: RequestHandler = async (req, res) => {
    const {descriptor, fileIds} = req.params
    const {id} = res.locals

    const metadata = await fetchModMetadata(id)
    if (wasErroneous(metadata)) {
        res.status(404)
        return res.send(metadata.message)
    }

    const modFiles = await fetchAllModFiles(id)
    if (wasErroneous(modFiles)) {
        res.status(404)
        return res.send(modFiles.message)
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
            res.status(404)
            return res.send(e.message)
        }
    }
    const dependenciesString = dependencyStringsOrError
        .map((it) => it as ResolvedModDependency)
        .map((it) => {
            return `<dependency>
                <groupId>curse.maven</groupId>
                <artifactId>${it.mod.id}</artifactId>
                <version>${it.mod.slug}-${it.file.id}</version>
            </dependency>`
        }).join("\n")

    return res.send(
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
    gameVersions: string[],
): Promise<ResolvedModDependency | CurseForgeError> => {
    const modFiles = await fetchAllModFiles(id)
    if (wasErroneous(modFiles)) return modFiles
    const modMetadata = await fetchModMetadata(id);
    if (wasErroneous(modMetadata)) return modMetadata
    return {
        mod: modMetadata,
        file: modFiles
                .filter((file) => file.isAvailable)
                .filter((file) => filePublicationMillis(file) <= publicationMillis)
                .sort((f, s) => filePublicationMillis(f) - filePublicationMillis(s))
                .find((file) => file.gameId === gameId /*&& hasIntersections(file.gameVersions, gameVersions) */)
            ?? modFiles.find((file) => modMetadata.mainFileId === file.id)
    }
}

export default pom