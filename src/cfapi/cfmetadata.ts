export type ModMetadata = {
    id: number;
    gameId: number;
    name: string;
    slug: string;
    links: ModLinks;
    summary: string;
    status: number;
    downloadCount: number;
    isFeatured: boolean;
    primaryCategoryId: number;
    categories: ModCategory[];
    classId: number;
    authors: ModAuthor[];
    logo: ModLogo;
    screenshots: ModScreenshot[];
    mainFileId: number;
    latestFiles: ModFileMetadata[];
    latestFilesIndexes: ModLatestFilesIndex[];
    latestEarlyAccessFilesIndexes: ModLatestFilesIndex[];
    dateCreated: string;
    dateModified: string;
    dateReleased: string;
    allowModDistribution: boolean;
    gamePopularityRank: number;
    isAvailable: boolean;
    thumbsUpCount: number;
    rating: number;
}

export type ModLinks = {
    websiteUrl: string;
    wikiUrl: string;
    issuesUrl: string;
    sourceUrl: string;
}

export type ModCategory = {
    id: number;
    gameId: number;
    name: string;
    slug: string;
    url: string;
    iconUrl: string;
    dateModified: string;
    isClass: boolean;
    classId: number;
    parentCategoryId: number;
    displayIndex: number;
}

export type ModAuthor = {
    id: number;
    name: string;
    url: string;
}

export type ModLogo = {
    id: number;
    modId: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    url: string;
}

export type ModScreenshot = {
    id: number;
    modId: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    url: string;
}

export type ModLatestFilesIndex = {
    gameVersion: string;
    fileId: number;
    filename: string;
    releaseType: number;
    gameVersionTypeId: number;
    modLoader: number;
}

/// -----------------------------------


export type ModFileMetadata = {
    id: number;
    gameId: number;
    modId: number;
    isAvailable: boolean;
    displayName: string;
    fileName: string;
    releaseType: number;
    fileStatus: number;
    hashes: ModFileHash[];
    fileDate: string;
    fileLength: number;
    downloadCount: number;
    fileSizeOnDisk: number;
    downloadUrl: string;
    gameVersions: string[];
    sortableGameVersions: ModFileSortableGameVersion[];
    dependencies: ModFileDependency[];
    exposeAsAlternative: boolean;
    parentProjectFileId: number;
    alternateFileId: number;
    isServerPack: boolean;
    serverPackFileId: number;
    isEarlyAccessContent: boolean;
    earlyAccessEndDate: string;
    fileFingerprint: number;
    modules: ModFileModule[];
}

export type ModFileHash = {
    value: string;
    algo: number;
}


export const AlgoType = {
    SHA1: 1,
    MD5: 2
}

export type ModFileSortableGameVersion = {
    gameVersionName: string;
    gameVersionPadded: string;
    gameVersion: string;
    gameVersionReleaseDate: string;
    gameVersionTypeId: number;
}

export type ModFileDependency = {
    modId: number;
    relationType: number;
}


export type ModFileModule = {
    name: string;
    fingerprint: number;
}

export type ModFileResponse = {
    data: ModFileMetadata[];
    pagination: ModFileListPagination;
}

export type ModFileListPagination = {
    index: number;
    pageSize: number;
    resultCount: number;
    totalCount: number;
}

export const ModFileDependencyType = {
    EmbeddedLibrary: 1,
    OptionalDependency: 2,
    RequiredDependency: 3,
    Tool: 4,
    Incompatible: 5,
    Include: 6
}