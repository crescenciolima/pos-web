import { NextApiRequest } from "next"
export type NextApiRequestWithFormData = NextApiRequest & {
    files: any[],
}

export type BlobCorrected = Blob & {
    buffer: Buffer,
}