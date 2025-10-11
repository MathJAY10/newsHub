// types/formidable.d.ts

import type { NextApiRequest } from "next";
import type { IncomingMessage } from "http";

// Extend NextApiRequest to include IncomingMessage properties for Formidable
export interface NextApiRequestWithFormidable extends NextApiRequest, IncomingMessage {}
