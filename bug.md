# Bug Note: Missing `movie/` Assets

- **Symptom:** AI video GIFs loaded locally, but production returned 404.
- **Root cause:** Deploy workflow copied assets to `build/` but forgot the `movie/` directory.
- **Fix:** Added `movie` to the copy list in `.github/workflows/deploy.yml` before uploading Pages artifact.
- **Prevention:** Whenever new asset folders are introduced, update the workflow and add a quick CI check (`ls build/<dir>`) to confirm they reach the build output.
