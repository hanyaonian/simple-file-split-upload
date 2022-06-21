import { createWriteStream, promises as fs } from 'fs';
import path from 'path';

export const resolve = (...p: string[]) => path.resolve(__dirname, ...p);

export async function mergeFiles(params: {
  total: number;
  target: string;
  from: string;
}) {
  const { total, target, from } = params;
  const writableStream = createWriteStream(target, {
    autoClose: true,
  });

  // in this case, we agree all file pieces are named by sequence
  for (let i = 1; i <= total; i++) {
    const file = resolve(from, i.toString());
    await new Promise(async (resolve, reject) => {
      try {
        const fileBuff = await fs.readFile(file);
        // write file pices to target
        writableStream.write(fileBuff, (err) => {
          if (err) {
            reject(err);
          }
          resolve(0);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  // all files are write into target!
  writableStream.end();
}