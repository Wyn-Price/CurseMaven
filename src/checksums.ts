import {RequestHandler} from "express";
import {createHash} from 'crypto';
import pom, {generatePom} from "./pom";
import {fetchModFile, wasErroneous} from "./util";
import {AlgoType} from "./modmetadata";

export const pomHash: RequestHandler = async (req, res) => {
    const {descriptor, algorithm} = req.params
    const {id, file} = res.locals
    const pom = await generatePom(id, file, descriptor)
    if (wasErroneous(pom)) {
        res.status(pom.status)
        return res.send(pom.message)
    }
    const hash = createHash(algorithm).update(
        pom
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

    const fileMetadata = await fetchModFile(id, file)
    if (wasErroneous(fileMetadata)) {
        res.status(fileMetadata.status)
        return res.send(fileMetadata.message)
    }

    const algoNum = getAlgoNum(algorithm)
    if (!algoNum) {
        res.status(404)
        return res.send(`Unknown algorithm type: '${algorithm}', options are: 'sha1', or 'md5'.`)
    }
    const hash = fileMetadata.hashes.find((it) => it.algo === algoNum)
    if (!hash) {
        res.status(404)
        return res.send(`Unknown algorithm: ${algorithm}, options are: '${fileMetadata.hashes.map((it) => {
            return Object.keys(AlgoType)[it.algo - 1]
        }).join(', ')}'`)
    }

    return res.send(hash.value)
}