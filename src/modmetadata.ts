export interface ModMetadata {
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
    latestFiles: ModLatestFile[];
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

export interface ModLinks {
    websiteUrl: string;
    wikiUrl: string;
    issuesUrl: string;
    sourceUrl: string;
}

export interface ModCategory {
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

export interface ModAuthor {
    id: number;
    name: string;
    url: string;
}

export interface ModLogo {
    id: number;
    modId: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    url: string;
}

export interface ModScreenshot {
    id: number;
    modId: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    url: string;
}

export interface ModLatestFile {
    id: number;
    gameId: number;
    modId: number;
    isAvailable: boolean;
    displayName: string;
    fileName: string;
    releaseType: number;
    fileStatus: number;
    hashes: ModHash[];
    fileDate: string;
    fileLength: number;
    downloadCount: number;
    fileSizeOnDisk: number;
    downloadUrl: string;
    gameVersions: string[];
    sortableGameVersions: ModSortableGameVersion[];
    dependencies: ModDependency[];
    exposeAsAlternative: boolean;
    parentProjectFileId: number;
    alternateFileId: number;
    isServerPack: boolean;
    serverPackFileId: number;
    isEarlyAccessContent: boolean;
    earlyAccessEndDate: string;
    fileFingerprint: number;
    modules: ModModule[];
}

export interface ModHash {
    value: string;
    algo: number;
}

export interface ModSortableGameVersion {
    gameVersionName: string;
    gameVersionPadded: string;
    gameVersion: string;
    gameVersionReleaseDate: string;
    gameVersionTypeId: number;
}

export interface ModDependency {
    modId: number;
    relationType: number;
}

export interface ModModule {
    name: string;
    fingerprint: number;
}

export interface ModLatestFilesIndex {
    gameVersion: string;
    fileId: number;
    filename: string;
    releaseType: number;
    gameVersionTypeId: number;
    modLoader: number;
}

/// -----------------------------------


export interface ModFileMetadata {
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

export interface ModFileHash {
    value: string;
    algo: number;
}

export interface ModFileSortableGameVersion {
    gameVersionName: string;
    gameVersionPadded: string;
    gameVersion: string;
    gameVersionReleaseDate: string;
    gameVersionTypeId: number;
}

export interface ModFileDependency {
    modId: number;
    relationType: number;
}


export interface ModFileModule {
    name: string;
    fingerprint: number;
}

export interface ModFileResponse {
    data: ModFileMetadata[];
    pagination: ModFileListPagination;
}

export interface ModFileListPagination {
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