// Stub backend module - this app uses localStorage directly, not the ICP backend.

export type { backendInterface, CreateActorOptions } from "./backend.d";

export class ExternalBlob {
  private _url?: string;
  onProgress: ((progress: number) => void) | undefined = undefined;

  async getBytes(): Promise<Uint8Array> {
    return new Uint8Array();
  }

  static fromURL(url: string): ExternalBlob {
    const blob = new ExternalBlob();
    blob._url = url;
    return blob;
  }
}

export async function createActor(
  _canisterId: string,
  _uploadFile?: unknown,
  _downloadFile?: unknown,
  _options?: unknown,
): Promise<import("./backend.d").backendInterface> {
  return {
    _initializeAccessControlWithSecret: async (_token: string) => {},
  } as import("./backend.d").backendInterface;
}
