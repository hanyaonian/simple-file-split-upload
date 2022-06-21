# Simple large file upload demo

native browser api + node.js file stream.

## Quick start

```sh
npm install

# start nodejs serve
npm run serve

# start web page

npm run dev

```

open `http://localhost:1234` and upload file, check your file in `serve/output`~

## Process

1. Split file blob with `Blob.prototype.slice`
2. Upload file pieces with `formdata`
3. Receive file pieces with `formiable`
4. Put file pieces together!

## Contact

Feel free to create issue~
