import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import {
  loadJobs,
  searchJobs,
  findJob
} from "./lib/jobs.js";

import {
  loadSavedIds,
  saveJobId,
  removeSavedJob
} from "./lib/saved.js";

const PORT = Number(process.env.PORT ?? 3000);

function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req) {
  let body = "";

  for await (const chunk of req) {
    body += chunk;

    if (body.length > 10000) {
      throw new Error("Request body too large");
    }
  }

  return JSON.parse(body);
}

export function createApp() {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");

      // GET all jobs or search jobs
      if (req.method === "GET" && url.pathname === "/api/jobs") {
        const jobs = await loadJobs();

        return sendJson(
          res,
          200,
          searchJobs(jobs, url.searchParams.get("q"))
        );
      }

      // GET saved jobs
      if (req.method === "GET" && url.pathname === "/api/saved") {
        const jobs = await loadJobs();
        const savedIds = await loadSavedIds();

        const savedJobs = savedIds
          .map((id) => findJob(jobs, id))
          .filter(Boolean);

        return sendJson(res, 200, savedJobs);
      }

      // POST a saved job
      if (req.method === "POST" && url.pathname === "/api/saved") {
        let body;

        try {
          body = await readJsonBody(req);
        } catch {
          return sendJson(res, 400, {
            error: "Invalid JSON request body"
          });
        }

        if (
          !body ||
          typeof body.jobId !== "string" ||
          !body.jobId.trim()
        ) {
          return sendJson(res, 400, {
            error: "A valid jobId is required"
          });
        }

        const jobId = body.jobId.trim();
        const jobs = await loadJobs();
        const job = findJob(jobs, jobId);

        if (!job) {
          return sendJson(res, 404, {
            error: `Job with ID '${jobId}' not found`
          });
        }

        const existingIds = await loadSavedIds();
        const alreadySaved = existingIds.includes(jobId);

        await saveJobId(jobId);

        return sendJson(res, alreadySaved ? 200 : 201, {
          message: alreadySaved
            ? "Job is already saved"
            : "Job saved successfully",
          job
        });
      }

      // DELETE a saved job
      const deleteMatch = url.pathname.match(
        /^\/api\/saved\/([^/]+)$/
      );

      if (req.method === "DELETE" && deleteMatch) {
        let jobId;

        try {
          jobId = decodeURIComponent(deleteMatch[1]);
        } catch {
          return sendJson(res, 400, {
            error: "Invalid job ID"
          });
        }

        const jobs = await loadJobs();
        const job = findJob(jobs, jobId);

        if (!job) {
          return sendJson(res, 404, {
            error: `Job with ID '${jobId}' not found`
          });
        }

        const savedIds = await loadSavedIds();

        if (!savedIds.includes(jobId)) {
          return sendJson(res, 404, {
            error: "This job is not in the saved list"
          });
        }

        await removeSavedJob(jobId);

        return sendJson(res, 200, {
          message: "Job removed successfully",
          jobId
        });
      }

      // Serve the webpage and frontend JavaScript
      if (
        req.method === "GET" &&
        (url.pathname === "/" || url.pathname === "/app.js")
      ) {
        const file = url.pathname === "/" ? "index.html" : "app.js";

        const type = file.endsWith(".html")
          ? "text/html"
          : "text/javascript";

        const content = await readFile(
          new URL(`./public/${file}`, import.meta.url)
        );

        res.writeHead(200, {
          "content-type": `${type}; charset=utf-8`
        });

        return res.end(content);
      }

      return sendJson(res, 404, {
        error: "Not found"
      });

    } catch (err) {
      console.error(err);

      return sendJson(res, 500, {
        error: "Something went wrong"
      });
    }
  });
}

// Start the server
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  createApp().listen(PORT, () => {
    console.log(`Job board on http://localhost:${PORT}`);
  });
}