import { toByteArray as decode64, fromByteArray as encode64 } from "base64-js";
import { Buffer } from "buffer";
import * as Device from "expo-device";

export { toByteArray as decode64, fromByteArray as encode64 } from "base64-js";

export const encode64Url = (base64: string) => {
  return base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

export const decode64String = (base64: string) => {
  const data = decode64(base64);
  return Buffer.from(data).toString();
};
export const encode64String = (s: string) => {
  const data = Buffer.from(s);
  return encode64(data);
};

export const decode64Index = (base64: string) => {
  const data = decode64(base64);
  const s = Buffer.from(data).toString();
  return parseInt(s.split("-")[1]);
};

export const IMPORT_READ_SIZE = Math.floor((Device.totalMemory! / 1024) * 15);

enum ImportStreamMode {
  Unknown,
  Battles = '"battles":[',
  Coops = '"coops":[',
}

export class ImportStreamParser {
  mode = ImportStreamMode.Unknown;
  drained = 0;
  buffer: number[] = [];

  parse = (bytes: Uint8Array) => {
    // For prefix position.
    let battlesPrefix = 0,
      coopsPrefix = 0;
    // For result parsing.
    let bracket = 0,
      quote = false;
    let bracketPos = -1;
    const battles: number[] = [],
      coops: number[] = [];

    let drainable = 0;
    // HACK: avoid spread syntax which may cause stack oversize.
    for (const byte of bytes) {
      this.buffer.push(byte);
    }
    for (let i = 0; i < this.buffer.length; i++) {
      // No null is allowed.
      if (this.buffer[i] === 0) {
        throw new Error(`null character found at ${this.drained + i}`);
      }

      // Escape \ and its following character, which should be an ASCII character.
      if (this.buffer[i] === "\\".charCodeAt(0)) {
        i++;
        continue;
      }
      // Escape space, \r and \n.
      if (
        this.buffer[i] === " ".charCodeAt(0) ||
        this.buffer[i] === "\r".charCodeAt(0) ||
        this.buffer[i] === "\n".charCodeAt(0)
      ) {
        continue;
      }

      // Guess which mode is reading from.
      if (this.buffer[i] === ImportStreamMode.Battles.charCodeAt(battlesPrefix)) {
        battlesPrefix += 1;
      } else {
        battlesPrefix = 0;
      }
      if (this.buffer[i] === ImportStreamMode.Coops.charCodeAt(coopsPrefix)) {
        coopsPrefix += 1;
      } else {
        coopsPrefix = 0;
      }
      if (battlesPrefix === ImportStreamMode.Battles.length) {
        this.mode = ImportStreamMode.Battles;
        battlesPrefix = 0;
        coopsPrefix = 0;
        drainable = i + 1;
      } else if (coopsPrefix === ImportStreamMode.Coops.length) {
        this.mode = ImportStreamMode.Coops;
        battlesPrefix = 0;
        coopsPrefix = 0;
        drainable = i + 1;
      }

      // Parse results.
      switch (this.mode) {
        case ImportStreamMode.Unknown:
          break;
        case ImportStreamMode.Battles:
        case ImportStreamMode.Coops:
          if (this.buffer[i] === '"'.charCodeAt(0)) {
            quote = !quote;
          }
          if (!quote) {
            if (this.buffer[i] === "{".charCodeAt(0)) {
              if (bracket === 0) {
                bracketPos = i;
              }
              bracket += 1;
            }
            if (this.buffer[i] === "}".charCodeAt(0)) {
              bracket -= 1;
              if (bracket === 0) {
                const result = this.buffer.slice(bracketPos, i + 1);
                switch (this.mode) {
                  case ImportStreamMode.Battles:
                    battles.push(",".charCodeAt(0));
                    for (const byte of result) {
                      battles.push(byte);
                    }
                    break;
                  case ImportStreamMode.Coops:
                    coops.push(",".charCodeAt(0));
                    for (const byte of result) {
                      coops.push(byte);
                    }
                    break;
                }
                drainable = i + 1;
              }
            }
          }
          break;
      }
    }
    this.buffer.splice(0, drainable);
    this.drained += drainable;

    if (battles.length === 0) {
      battles.push("[".charCodeAt(0));
    } else {
      battles[0] = "[".charCodeAt(0);
    }
    battles.push("]".charCodeAt(0));
    if (coops.length === 0) {
      coops.push("[".charCodeAt(0));
    } else {
      coops[0] = "[".charCodeAt(0);
    }
    coops.push("]".charCodeAt(0));
    return {
      battles: JSON.parse(Buffer.from(battles).toString()),
      coops: JSON.parse(Buffer.from(coops).toString()),
    };
  };
}
