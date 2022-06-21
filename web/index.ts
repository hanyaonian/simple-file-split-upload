import { logger, splitFile, getFileHash, uploadFileForm } from "./utils";
import { SERVE_URL, FILE_SLICE_SIZE } from "./const";

const btn = document.getElementById('submit');
const msg = document.getElementById('msg-block') as HTMLDivElement;
const input = document.getElementById('file-select') as HTMLInputElement;

btn?.addEventListener('click', async () => {
  if (!input.files.length) {
    return;
  }
  const [file] = input.files;
  const fileArr = splitFile(file, FILE_SLICE_SIZE);
  const fileHash = await getFileHash(file);
  const pieceCount = fileArr.length;
  for (let i = 0; i < pieceCount; i++) {
    const form = new FormData();
    form.append('name', file.name);
    form.append('total', pieceCount.toString());
    form.append('current', (i + 1).toString());
    form.append('hash', fileHash);
    form.append('file', fileArr[i]);
    // go parallel if you like
    try {
      const data = await uploadFileForm({
        form,
        url: SERVE_URL,
      });
      msg.innerHTML += `<p> ${data} </p>`;
      logger.info(data);
    } catch (err) {
      msg.innerHTML += `<p> ${err} </p>`;
      logger.error(err);
    }
  }
});
