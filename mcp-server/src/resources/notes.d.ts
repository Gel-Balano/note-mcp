export interface NoteResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface ResourceHandler {
  (uri: string): Promise<{
    contents: Array<{
      uri: string;
      mimeType: string;
      text: string;
    }>;
  }>;
}

export interface ResourceDefinition {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  handler: ResourceHandler;
}

export const allNotesResources: ResourceDefinition[];
export default allNotesResources;