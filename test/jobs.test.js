import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  findJob,
  loadJobs,
  searchJobs
} from "../lib/jobs.js";

import {
  loadSavedIds,
  saveJobId,
  removeSavedJob
} from "../lib/saved.js";

const SAVED_FILE = fileURLToPath(
  new URL("../saved-jobs.json", import.meta.url)
);

// Original tests

test("loads the jobs file", async () => {
  const jobs = await loadJobs();
  assert.ok(jobs.length >= 8);
  assert.ok(jobs.every((j) => j.id && j.title));
});

test("search matches title, company and place, ignoring case", async () => {
  const jobs = await loadJobs();

  assert.deepEqual(searchJobs(jobs, "intern").length, jobs.length);
  assert.deepEqual(searchJobs(jobs, "REMOTE").map((j) => j.id), ["j1", "j3", "j6", "j8"]);
  assert.deepEqual(searchJobs(jobs, "kosha").map((j) => j.id), ["j4"]);
  assert.equal(searchJobs(jobs, "").length, jobs.length);
});

test("findJob returns null for an unknown id", async () => {
  const jobs = await loadJobs();

  assert.equal(findJob(jobs, "j2").company, "Kite Learning");
  assert.equal(findJob(jobs, "nope"), null);
});

// Saved jobs tests

test("saved jobs can be added, listed, and removed", async () => {
  let originalData;

  try {
    originalData = await readFile(SAVED_FILE, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  try {
    await writeFile(SAVED_FILE, "[]", "utf8");

    // Test saving a job
    const saved = await saveJobId("test-job-1");
    assert.deepEqual(saved, ["test-job-1"]);

    // Test listing saved jobs
    const listed = await loadSavedIds();
    assert.deepEqual(listed, ["test-job-1"]);

    // Test duplicate prevention
    const duplicate = await saveJobId("test-job-1");
    assert.deepEqual(duplicate, ["test-job-1"]);

    // Test saving another job
    await saveJobId("test-job-2");
    assert.deepEqual(
      await loadSavedIds(),
      ["test-job-1", "test-job-2"]
    );

    // Test removing a saved job
    const removed = await removeSavedJob("test-job-1");
    assert.deepEqual(removed, ["test-job-2"]);

    // Test removing an unknown job
    assert.deepEqual(
      await removeSavedJob("unknown-job"),
      ["test-job-2"]
    );

  } finally {
    // Restore the original saved jobs data
    if (originalData === undefined) {
      await writeFile(SAVED_FILE, "[]", "utf8");
    } else {
      await writeFile(SAVED_FILE, originalData, "utf8");
    }
  }
});