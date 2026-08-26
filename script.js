const HALVING_BLOCK = 1050000;
const SECONDS_PER_BLOCK = 600; // Bitcoin's 10-minute target
const HEIGHT_URL = "https://mempool.space/api/blocks/tip/height";

const els = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  eta: document.getElementById("eta"),
  currentBlock: document.getElementById("current-block"),
  blocksLeft: document.getElementById("blocks-left"),
};

let targetTime = null;

function pad(n) {
  return String(n).padStart(2, "0");
}

function renderCountdown() {
  if (!targetTime) return;

  const diff = Math.max(0, targetTime - Date.now());
  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  els.days.textContent = days;
  els.hours.textContent = pad(hours);
  els.minutes.textContent = pad(minutes);
  els.seconds.textContent = pad(seconds);
}

async function loadChainData() {
  const response = await fetch(HEIGHT_URL);
  if (!response.ok) throw new Error("Could not fetch block height");

  const currentHeight = Number(await response.text());
  const blocksLeft = Math.max(0, HALVING_BLOCK - currentHeight);

  targetTime = Date.now() + blocksLeft * SECONDS_PER_BLOCK * 1000;

  els.currentBlock.textContent = currentHeight.toLocaleString();
  els.blocksLeft.textContent = blocksLeft.toLocaleString();
  els.eta.textContent =
    "Estimated: " +
    new Date(targetTime).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  renderCountdown();
}

loadChainData().catch((err) => {
  els.eta.textContent = "Could not load live data. Check your connection.";
  console.error(err);
});

setInterval(renderCountdown, 1000);
