import express from "express";
import { once } from "node:events";

export const authFetch = (url: string) => fetch(url, {
  redirect: 'follow',
  headers: { 'x-api-key': process.env.CF_API_KEY ?? "" },
})

export const getDownloadUrl = (id: string, file: string | number) => `https://api.curseforge.com/v1/mods/${id}/files/${file}/download-url`
export const fetchDownloadUrl = (id: string, file: string | number) => authFetch(getDownloadUrl(id, file))

export const getRedirectUrl = async (response: Response) => {
  const json = await response.json() as { data: string }
  return json.data
}

export const pipeResponse = async (from: Response, to: express.Response) => {
  to.status(from.status);
  to.set(Object.fromEntries(from.headers));

  if (!from.body) {
    to.end();
    return;
  }

  // None of the built in node piping works.
  // Just manually pipe ourselves
  //
  // I've tried:
  //   - Readable.fromWeb(from.body).pipe(to)
  //   - pipeline(Readable.fromWeb(from.body), to)
  const reader = from.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      if (!to.write(Buffer.from(value))) {
        await once(to, "drain");
      }
    }

    to.end();
  } finally {
    reader.releaseLock();
  }
}

export const getFirst = (str: string | string[]) => {
  return Array.isArray(str) ? str[0] : str;
}
