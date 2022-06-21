import { Logger, LogLevel } from "m-web-logger";
import { SUCCESS_HTTP_CODE } from "./const";

export const logger = new Logger({ label: "file-upload", level: LogLevel.all });

/**
 * @param file the file you want to have blob pieces
 * @param size blob size
 * @returns Blob[]
 */
export const splitFile = (file: File, size: number) => {
  const arr: Blob[] = [];
  let pos = 0;
  while (pos < file.size) {
    arr.push(file.slice(pos + size));
    pos += size;
  }
  return arr;
};

export function uploadFileForm(params: { url: string; form: FormData }) {
  const { url, form } = params;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.onload = () => {
      if (xhr.status !== SUCCESS_HTTP_CODE) {
        reject(`Error: code ${xhr.status} - ${xhr.statusText}`);
      }
      resolve(xhr.responseText);
    };
    xhr.onerror = () => {
      reject(`Fail due to XHR error: ${xhr.status} - ${xhr.statusText}`);
    };
    xhr.send(form);
  });
}

/**
 * @description get hash value based on file stream
 */
export async function getFileHash(file: File) {
  /** @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest */
  const crypto = window.crypto.subtle;
  const fileBuff = await file.arrayBuffer();
  // hash the message
  const shaBuff = await crypto.digest("SHA-256", fileBuff);
  /** @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string */
  // convert buffer to byte array
  const hashArray = Array.from(new Uint8Array(shaBuff));
  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
