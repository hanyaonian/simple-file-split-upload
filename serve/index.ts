import Koa, { Context } from "koa";
import { File } from "formidable";
import koaBody from "koa-body";
import cros from "koa-cors";
import fs from "fs/promises";
import { mergeFiles, resolve } from "./utils";
import { OUTPUT_DIR, PORT, TEMP_DIR } from "./const";

const app = new Koa();
const mkDirPromise = (name: string) => fs.mkdir(resolve(name), { recursive: true });

Promise.all([mkDirPromise(TEMP_DIR), mkDirPromise(OUTPUT_DIR)])
  .then(() => {
    app.use(cros());
    app.use(
      koaBody({
        multipart: true,
        formidable: {
          uploadDir: resolve(TEMP_DIR),
          maxFileSize: Infinity,
        },
      })
    );

    app.use(async (ctx: Context) => {
      if (!ctx.request.files["file"]) {
        ctx.status = 405;
        return;
      }
      const file = ctx.request.files["file"] as File;
      const { name, hash, total, current }: { [key: string]: string } = ctx.request.body;
      const { filepath } = file;
      try {
        // step 1: create hash-based cache diretory
        const cacheDir = resolve('cached', hash);
        await mkDirPromise(cacheDir);

        // step 2: rename hash file name to sequence-based, and unlink temp file
        await fs.copyFile(filepath, resolve(cacheDir, current));
        await fs.unlink(filepath);

        // step 3: check is all file pices are received
        const dircount = (await fs.readdir(cacheDir)).length;
        console.log(resolve(OUTPUT_DIR, name), dircount, total)
        if (dircount === Number(total)) {

          // step 4: merge files
          await mergeFiles({
            total: Number(total),
            target: resolve(OUTPUT_DIR, name), // origin file name
            from: cacheDir,
          });

          // step 5: remove cached file
          await fs.rm(cacheDir, { recursive: true, force: true });
        }

        // success!
        ctx.status = 200;
        ctx.body = `${name} part ${current} success received`;

      } catch (err) {
        console.log(err);
        ctx.status = 500;
        ctx.body = err;
      }
    });

    app.listen(PORT);
  })
  .catch((err) => {
    console.log(`unable to create temp/output diretory due to ${err}`);
  });
