// ===== PARTICLE BACKGROUND =====
(function () {
  const canvas = document.getElementById("bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.clientWidth = window.innerWidth;
    height = canvas.clientHeight = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function createParticles(count) {
    particles = [];
    const colors = ["#00ff88", "#00e5ff", "#b768ff"];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2.5 + 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      g.addColorStop(0, p.color);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fill();
    });

    requestAnimationFrame(step);
  }

  resize();
  createParticles(80);
  window.addEventListener("resize", () => {
    resize();
    createParticles(80);
  });
  step();
})();

// ===== SCROLL REVEAL =====
document.addEventListener("DOMContentLoaded", () => {
  const fades = document.querySelectorAll(".fade");
  const reveal = () => {
    fades.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 70) {
        el.classList.add("show");
      }
    });
  };
  reveal();
  window.addEventListener("scroll", reveal);
});

// ===== GSAP HERO ENTRANCE (אם GSAP נטען) =====
if (window.gsap) {
  gsap.from(".hero h2", { y: -20, opacity: 0, duration: 0.8, ease: "power3.out" });
  gsap.from(".hero p", { y: 20, opacity: 0, duration: 0.8, delay: 0.2 });
  gsap.from(".cta", { scale: 0.7, opacity: 0, duration: 0.7, delay: 0.35, ease: "back.out(1.7)" });
}

// ===== LIVE CHARTS (BTC / ETH / XRP) =====
(function () {
  const btcCanvas = document.getElementById("btcChart");
  const ethCanvas = document.getElementById("ethChart");
  const xrpCanvas = document.getElementById("xrpChart");
  if (!btcCanvas || !ethCanvas || !xrpCanvas || !window.Chart) return;

  const labels = Array.from({ length: 20 }, (_, i) => i.toString());
  const charts = {};

  function createChart(ctx, color) {
    return new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "",
            data: new Array(labels.length).fill(0),
            borderColor: color,
            backgroundColor: color + "33",
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { display: false },
            grid: { display: false },
          },
          y: {
            ticks: { display: false },
            grid: { color: "rgba(255,255,255,0.04)" },
          },
        },
      },
    });
  }

  charts.btc = createChart(btcCanvas.getContext("2d"), "#ffcc00");
  charts.eth = createChart(ethCanvas.getContext("2d"), "#00e5ff");
  charts.xrp = createChart(xrpCanvas.getContext("2d"), "#b768ff");

  const API_URL =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple&vs_currencies=usd&include_24hr_change=true";

  async function fetchPrices() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();

      updateChart(charts.btc, data.bitcoin.usd);
      updateChart(charts.eth, data.ethereum.usd);
      updateChart(charts.xrp, data.ripple.usd);
    } catch (e) {
      // fallback – random walk
      randomStep(charts.btc);
      randomStep(charts.eth);
      randomStep(charts.xrp);
    }
  }

  function updateChart(chart, newPrice) {
    const ds = chart.data.datasets[0].data;
    if (ds[0] === 0) {
      for (let i = 0; i < ds.length; i++) ds[i] = newPrice;
    } else {
      ds.push(newPrice);
      ds.shift();
    }
    chart.update("none");
  }

  function randomStep(chart) {
    const ds = chart.data.datasets[0].data;
    const last = ds[ds.length - 1] || 100;
    const delta = (Math.random() - 0.5) * last * 0.01;
    const next = Math.max(0.1, last + delta);
    ds.push(next);
    ds.shift();
    chart.update("none");
  }

  // initial fill
  fetchPrices();
  setInterval(fetchPrices, 30000); // כל 30 שניות
})();
