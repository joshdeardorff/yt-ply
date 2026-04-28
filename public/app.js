async function fetchQueue() {
  const res = await fetch("/api/queue");
  const data = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.url}
      <button onclick="removeItem(${item.id})">Remove</button>
    `;
    list.appendChild(li);
  });
}

async function add() {
  const url = document.getElementById("url").value;

  await fetch("/api/queue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });

  document.getElementById("url").value = "";
  fetchQueue();
}

async function removeItem(id) {
  await fetch(`/api/queue/${id}`, { method: "DELETE" });
  fetchQueue();
}

async function skip() {
  await fetch("/api/skip", { method: "POST" });
}

fetchQueue();
setInterval(fetchQueue, 2000);