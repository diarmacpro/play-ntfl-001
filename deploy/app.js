const projectMap = {
  "play-ntfl-001": "b53b7697-63b8-4ed3-b8fd-b31a8772ffb2"
};

const selector = document.getElementById("projectSelector");
const logOutput = document.getElementById("logOutput");

Object.keys(projectMap).forEach((key) => {
  const opt = document.createElement("option");
  opt.value = key;
  opt.textContent = key;
  selector.appendChild(opt);
});

selector.addEventListener("change", () => {
  const projectKey = selector.value;
  const siteId = projectMap[projectKey];
  if (siteId) {
    fetchDeployLog(siteId);
  }
});

async function fetchDeployLog(siteId) {
  logOutput.textContent = "Loading logs...";
  
  const res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
    headers: {
      Authorization: `Bearer nfp_LYfoCxMF1QtyGwQPwDW3g6z1DyQZg7yP355f`
    }
  });
  const deploys = await res.json();
  const latestDeploy = deploys[0];

  const logRes = await fetch(`https://api.netlify.com/api/v1/deploys/${latestDeploy.id}/log`, {
    headers: {
      Authorization: `Bearer nfp_LYfoCxMF1QtyGwQPwDW3g6z1DyQZg7yP355f`
    }
  });
  const logText = await logRes.text();

  logOutput.textContent = logText;
}

// Auto-load log if path includes /project-xyz
const urlPath = window.location.pathname.slice(1);
if (projectMap[urlPath]) {
  selector.value = urlPath;
  fetchDeployLog(projectMap[urlPath]);
}
