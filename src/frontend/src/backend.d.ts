// Stub type declarations for backend interface.
// This app uses localStorage directly, not the ICP backend.
import type { Identity } from "@dfinity/agent";

export interface backendInterface {
  _initializeAccessControlWithSecret(token: string): Promise<void>;
  [key: string]: unknown;
}

export interface CreateActorOptions {
  agentOptions?: {
    identity?: Identity | Promise<Identity>;
    host?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

type UploadFileFn = (file: ExternalBlob) => Promise<Uint8Array>;
type DownloadFileFn = (bytes: Uint8Array) => Promise<ExternalBlob>;

export declare class ExternalBlob {
  getBytes(): Promise<Uint8Array>;
  onProgress: ((progress: number) => void) | undefined;
  static fromURL(url: string): ExternalBlob;
}

export declare function createActor(
  canisterId: string,
  uploadFile: UploadFileFn,
  downloadFile: DownloadFileFn,
  options?: CreateActorOptions & { agent?: unknown; processError?: unknown },
): Promise<backendInterface>;
