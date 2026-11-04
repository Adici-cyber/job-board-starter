const list = document.getElementById("jobs");
const search = document.getElementById("search");
const savedList = document.getElementById("saved-jobs");

let currentJobs = [];
let savedJobs = [];

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

function jobDescription(job) {
  return `${job.title} at ${job.company}, ${job.location}. Rs ${job.stipend.toLocaleString("en-IN")} a month.`;
}

// Display all available jobs
function renderJobs() {
  list.replaceChildren();

  for (const job of currentJobs) {
    const li = document.createElement("li");
    const description = document.createElement("span");

    description.textContent = jobDescription(job);
    li.append(description);

    const button = document.createElement("button");
    const isSaved = savedJobs.some(
      (saved) => saved.id === job.id
    );

    button.textContent = isSaved ? "Saved" : "Save";
    button.disabled = isSaved;

    button.addEventListener("click", async () => {
      try {
        await apiRequest("/api/saved", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ jobId: job.id })
        });

        await loadSavedJobs();
      } catch (error) {
        alert(error.message);
      }
    });

    li.append(button);
    list.append(li);
  }
}

// Display saved jobs
function renderSavedJobs() {
  savedList.replaceChildren();

  if (savedJobs.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No saved jobs yet.";
    savedList.append(empty);
    return;
  }

  for (const job of savedJobs) {
    const li = document.createElement("li");
    const description = document.createElement("span");

    description.textContent = jobDescription(job);
    li.append(description);

    const button = document.createElement("button");
    button.textContent = "Remove";

    button.addEventListener("click", async () => {
      try {
        await apiRequest(
          `/api/saved/${encodeURIComponent(job.id)}`,
          { method: "DELETE" }
        );

        await loadSavedJobs();
      } catch (error) {
        alert(error.message);
      }
    });

    li.append(button);
    savedList.append(li);
  }
}

// Load saved jobs from server
async function loadSavedJobs() {
  savedJobs = await apiRequest("/api/saved");

  renderSavedJobs();
  renderJobs();
}

// Search and load available jobs
async function show(query = "") {
  currentJobs = await apiRequest(
    `/api/jobs?q=${encodeURIComponent(query)}`
  );

  renderJobs();
}

// Search event
search.addEventListener("input", () => {
  show(search.value).catch((error) => alert(error.message));
});

// Initial loading
async function initialize() {
  try {
    await Promise.all([
      show(),
      loadSavedJobs()
    ]);
  } catch (error) {
    alert(error.message);
  }
}

initialize();