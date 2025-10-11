import type { Files } from "formidable";

declare module "next" {
  interface NextApiRequest {
    query: {
      search: any; jobId: any; 
};
    body: any;
    method: string;
    file?: Files | Files[];
  }
}
