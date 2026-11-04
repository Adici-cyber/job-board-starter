import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SAVED_FILE = fileURLToPath(
  new URL("../saved-jobs.json", import.meta.url)
);

export async function loadSavedIds() {
  try {
    const data = await readFile(SAVED_FILE, "utf8");
    const ids = JSON.parse(data);

    if (!Array.isArray(ids) || !ids.every(
      (id) => typeof id === "string"
    )) {
      throw new Error("Invalid saved jobs file");
    }

    return [...new Set(ids)];
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function saveJobId(jobId) {
  const ids = await loadSavedIds();

  if (ids.includes(jobId)) {
    return ids;
  }

  ids.push(jobId);

  await writeFile(
    SAVED_FILE,
    JSON.stringify(ids, null, 2),
    "utf8"
  );

  return ids;
}

export async function removeSavedJob(jobId) {
  const ids = await loadSavedIds();
  const updatedIds = ids.filter((id) => id !== jobId);

  await writeFile(
    SAVED_FILE,
    JSON.stringify(updatedIds, null, 2),
    "utf8"
  );

  return updatedIds;
}