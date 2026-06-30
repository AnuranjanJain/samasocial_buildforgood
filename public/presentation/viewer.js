const totalSlides = 12;
const slideImage = document.querySelector("#slideImage");
const slideLabel = document.querySelector("#slideLabel");
const progressBar = document.querySelector("#progressBar");
const thumbs = document.querySelector("#thumbs");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const fullscreenBtn = document.querySelector("#fullscreenBtn");

let currentSlide = 1;

function slideSrc(index) {
  return `./slides/slide-${String(index).padStart(2, "0")}.png`;
}

function setSlide(index) {
  currentSlide = Math.min(totalSlides, Math.max(1, index));
  slideImage.src = slideSrc(currentSlide);
  slideImage.alt = `Presentation slide ${currentSlide}`;
  slideLabel.textContent = `Slide ${currentSlide} of ${totalSlides}`;
  progressBar.style.width = `${(currentSlide / totalSlides) * 100}%`;

  document.querySelectorAll(".thumb").forEach((button) => {
    const isCurrent = Number(button.dataset.slide) === currentSlide;
    button.setAttribute("aria-current", String(isCurrent));
    if (isCurrent) {
      button.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  });
}

function buildThumbnails() {
  for (let index = 1; index <= totalSlides; index += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "thumb";
    button.dataset.slide = String(index);
    button.setAttribute("aria-label", `Open slide ${index}`);

    const img = document.createElement("img");
    img.src = slideSrc(index);
    img.alt = "";
    img.loading = "lazy";

    const label = document.createElement("span");
    label.textContent = `Slide ${String(index).padStart(2, "0")}`;

    button.append(img, label);
    button.addEventListener("click", () => setSlide(index));
    thumbs.append(button);
  }
}

prevBtn.addEventListener("click", () => setSlide(currentSlide - 1));
nextBtn.addEventListener("click", () => setSlide(currentSlide + 1));

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") setSlide(currentSlide - 1);
  if (event.key === "ArrowRight" || event.key === " ") setSlide(currentSlide + 1);
  if (event.key === "Home") setSlide(1);
  if (event.key === "End") setSlide(totalSlides);
});

fullscreenBtn.addEventListener("click", async () => {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await document.documentElement.requestFullscreen();
  }
});

buildThumbnails();
setSlide(1);
