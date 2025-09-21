import type { Files } from "formidable";

declare module "next" {
  interface NextApiRequest {
    file?: Files | Files[];
  }
}
