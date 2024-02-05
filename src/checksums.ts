import {RequestHandler} from "express";
import {createHash} from 'crypto';
import pom, {generatePom} from "./pom";
import {AlgoType} from "./cfapi/cfmetadata";
import {fetchModFile} from "./cfapi/cffetch";

export const pomHash: RequestHandler = async (req, res) => {
    const {descriptor, algorithm} = req.params
    const {id, file} = res.locals
    const pomResponse = await generatePom(id, file, descriptor)
    if (pomResponse.success === false) {
        res.status(pomResponse.status)
        return res.send(pomResponse.message)
    }
    const hash = createHash(algorithm).update(
        pomResponse.data
    ).digest('hex')
    return res.send(hash)
}

const getAlgoNum = (algo: string): number | undefined => {
    switch (algo) {
        case "sha1" :
            return AlgoType.SHA1
        case  "md5" :
            return AlgoType.MD5
        default:
            return undefined
    }
}

export const jarHash: RequestHandler = async (req, res) => {
    const {algorithm} = req.params
    const {id, file} = res.locals

    const fileMetadataResponse = await fetchModFile(id, file)
    if (fileMetadataResponse.success === false) {
        res.status(fileMetadataResponse.status)
        return res.send(fileMetadataResponse.message)
    }

    const algoNum = getAlgoNum(algorithm)
    if (!algoNum) {
        res.status(404)
        return res.send(`Unknown algorithm type: '${algorithm}', options are: 'sha1', or 'md5'.`)
    }
    const modFileHashes = fileMetadataResponse.data.hashes;
    const hash = modFileHashes.find((it) => it.algo === algoNum)
    if (!hash) {
        res.status(404)
        return res.send(`Unknown algorithm: ${algorithm}, options are: '${modFileHashes.map((it) => {
            return Object.keys(AlgoType)[it.algo - 1]
        }).join(', ')}'`)
    }

    return res.send(hash.value)
}