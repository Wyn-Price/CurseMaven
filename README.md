# CurseMaven
A more robust alternative to the normal curseforge maven, that takes in the project id and file id, rather than getting the artifacts from the jar name.

See https://cursemaven.com/ for an up-to-date instructions.

# History
 - [Version 1 (Java app)](https://github.com/Wyn-Price/CurseForge-Maven-Helper)
   - Scraped the file download page to get the filename, and worked out the required maven coordinates for the official CurseForge maven.
 - [Version 2 (Gradle Plugin)](https://github.com/Wyn-Price/CurseMaven-OLD/tree/1.x.x)
   - Can be called directly from build.gradle `compile curse.resolve("jei", "2724420")`, and would download the dependency into a local repo
 - [Version 3 (Gradle Plugin)](https://github.com/Wyn-Price/CurseMaven-OLD/tree/2.x.x)
   - Attached a dummy artefact repo that would download the required dep via `compile "curse.maven:jei:2724420"`
 - [Version 4 (Nginx JS)](https://gist.github.com/Wyn-Price/c9e70557a8abc926e69712d06f948fae)
   - Moved to a proper maven site that would call curseforge's API then return a redirect to the Download url
   - (Thanks [@NeusFear](https://github.com/NeusFear)) for the server!)
 - [Version 5 (Website - Express/Vercel)](https://github.com/Wyn-Price/CurseMaven/tree/old-vercel-deployment)
   - Same as the above, but written in express and deployed on Vercel
   - Cloudflare workers were used for collecting stats
 - [Version 6 (Website - Express/Cloudflare worker)](https://github.com/Wyn-Price/CurseMaven/tree/main)
   - Same as the above, but deployed on Cloudflare
   - Downloads are now also piped through the cloudflare worker, rather than redirected