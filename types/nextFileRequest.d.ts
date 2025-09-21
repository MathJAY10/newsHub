// lib/nextFileRequest.ts
import type { NextApiRequest } from "next";
import type { Files } from "formidable";

export interface NextApiRequestWithFile extends NextApiRequest {
  file?: Files | Files[]; // matches formidable's return type
}
