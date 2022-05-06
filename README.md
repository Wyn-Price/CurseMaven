# CurseMaven
[![powered-by-vercel](https://user-images.githubusercontent.com/15876682/167162686-115e80ad-d6f2-44f5-bd36-4d506531e17e.svg)](https://vercel.com/?utm_source=wyn-price&utm_campaign=oss)

A more robust alternative to the normal curseforge maven, that takes in the project id and file id, rather than getting the artifacts from the jar name.

# Adding the Maven
Add `https://cursemaven.com/` as a maven repository, like normal.
```gradle
repositories {
    maven {
        url "https://cursemaven.com"
    
}
```
## Gradle 5+
If you're using Gradle 5+, you can optimize the maven repository:
```gradle
repositories {
    maven {
        url "https://cursemaven.com"
        content {
            includeGroup "curse.maven"
        }
    }
}
```
# Usage
The dependency format is as follows: `curse.maven:<descriptor>-<projectid>:<fileid>`
 - `curse.maven` -> Required. Marks the dependency to be resolved by the curse maven website.
 - `<descriptor>` -> Can be anything you want. This file downloaded will have this in it's name, so it's good to use this to show which files are what. A good practice would be to have this as the project slug.
 - `<projectid>` -> The project id of the file you want to add as a dependency.
 - `<fileid>` -> The file id of the file you want to add as a dependency.

## Getting the IDs
### Project ID
The Project ID can be found on the `About Project` section of the project
<img height="300px" src="https://www.cursemaven.com/projectid.png">

### File ID
To get the file ID, go to the download page of file you want to use, and the file ID will be in the URL.
<img height="300px" src="https://www.cursemaven.com/fileid.png">

# Examples
 - [Forge Example](https://www.cursemaven.com/forge)
 - [Fabric Example](https://www.cursemaven.com/fabric)
 
```gradle
dependencies {
    api "curse.maven:jei-238222:2724420"
}
```
Would point [here](https://www.curseforge.com/minecraft/mc-mods/ctm/files/2642375) with the scope `api`     

```gradle
dependencies {
    implementation fg.deobf("curse.maven:ctm-267602:2642375")
}
```
Would point [here](https://www.curseforge.com/minecraft/mc-mods/ctm/files/2642375) with the scope `implementation`, and be decompiled by ForgeGradle


# Testing
To test cursemaven, get the project id and file id (and optional classifier), and navigate to `https://www.cursemaven.com/test/<ProjectId>/<FileId>/<Classifier?>`
