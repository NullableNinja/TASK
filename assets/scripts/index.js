/* ===========================
   INDEX.JS — HOMEPAGE SCRIPTS
   ---------------------------
   - Scripts that apply ONLY to index.html
   - Global scripts go in base.js
   - Component/partial scripts go in assets/scripts/partials/
   =========================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ===========================
     1. TRIAL EXPIRATION DATE
     =========================== */
  const trialExp = document.getElementById("trialExp");
  if (trialExp) {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    trialExp.textContent = date.toLocaleDateString();
  }

  /* ===========================
     2. PHOTO CAROUSEL (old)
     =========================== */
  const slides = document.getElementById("slides");
  const navButtons = document.querySelectorAll("#carousel .nav button");
  let currentSlide = 0;

  if (slides && navButtons.length) {
    navButtons.forEach(button => {
      button.addEventListener("click", () => {
        const direction = parseInt(button.dataset.dir, 10);
        currentSlide += direction;

        const totalSlides = slides.children.length;
        if (currentSlide < 0) currentSlide = totalSlides - 1;
        if (currentSlide >= totalSlides) currentSlide = 0;

        slides.style.transform = `translateX(-${currentSlide * 100}%)`;
      });
    });
  }

  /* ===========================
     3. CONTACT WIDGET
     =========================== */
  const openPanelBtn = document.getElementById("openPanel");
  const panel = document.getElementById("panel");

  if (openPanelBtn && panel) {
    openPanelBtn.addEventListener("click", () => {
      panel.classList.toggle("show");
    });
  }
  
  
/* ===========================
   4. TRIAL POPOVER
   =========================== */
const trialPop = document.getElementById("trialPop");
const closeBtn = trialPop?.querySelector(".close");

// Only show popover on desktop/tablet (not mobile)
function isMobile() {
  return window.matchMedia("(max-width: 768px)").matches;
}

if (trialPop && closeBtn && !isMobile()) {
  setTimeout(() => { trialPop.style.display = "block"; }, 5000);
  closeBtn.addEventListener("click", () => {
    trialPop.style.display = "none";
  });
}


  /* ===========================
     5. PROGRAM SWITCHER
     =========================== */
  const programData = {
    kids: {
      title: "Kids Karate",
      desc: "Designed for ages 5-12, this class helps kids develop focus, respect, and listening skills through energetic games and belt progression. We emphasize discipline, good attitude, and fun so every child builds confidence along with karate technique.",
      img: "images/programs/kids-karate.jpg",
      alt: "Kids Karate class group photo"
    },
    teens: {
      title: "Teens & Adults",
      desc: "For ages 13+, this class blends striking, footwork, self-defense tactics, and partner drills. Whether you’re looking for fitness, confidence, or practical skills—you’ll train hard, move well, and learn techniques that hold up under pressure.",
      img: "images/programs/teens-adults.jpg",
      alt: "Teens and adults karate training"
    },
    eskrima: {
      title: "IS3 • Eskrima",
      desc: "Filipino impact arts focusing on stick, knife, and empty-hand work. You’ll sharpen timing, distance, and flow—learning both defensive and offensive actions so you can respond quickly and decisively in real-world situations.",
      img: "images/programs/eskrima.jpg",
      alt: "IS3 Eskrima training group"
    },
    weapons: {
      title: "Weapons Skills",
      desc: "Train with traditional weapons like bo, nunchaku, and kama to build coordination, precision, and control. Beyond flashy moves, we focus on safe progression and understanding structure, so you gain skill, respect, and fluidity before attempting complexity.",
      img: "images/programs/weapons.jpg",
      alt: "Weapons training group"
    }
  };

  const programButtons = document.querySelectorAll(".program-btn");
  const programTitle = document.getElementById("programTitle");
  const programDesc = document.getElementById("programDesc");
  const programImg = document.getElementById("programImg");

  programButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      programButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const key = btn.dataset.program;
      const program = programData[key];

      programTitle.style.opacity = 0;
      programDesc.style.opacity = 0;
      programImg.style.opacity = 0;

      setTimeout(() => {
        programTitle.textContent = program.title;
        programDesc.textContent = program.desc;
        programImg.src = program.img;
        programImg.alt = program.alt;

        programTitle.style.opacity = 1;
        programDesc.style.opacity = 1;
        programImg.style.opacity = 1;
      }, 200);
    });
  });



/* ===========================
   6. PHOTO STACK ROTATOR
   ---------------------------
   - Autoload spotlight images
   - Fill each stack
   - Rotate with fade
   =========================== */
const maxPhotos = 99;
const stacks = [
  document.getElementById("stack1"),
  document.getElementById("stack2"),
  document.getElementById("stack3")
];
const photos = [];

// Helpers
function randAngle() {
  return Math.floor(Math.random() * 26 - 13); // -13° to +12°
}
function randOffset() {
  return Math.floor(Math.random() * 16 - 8); // -8px to +8px
}
function randomTapeClass() {
  const positions = ["tape-top", "tape-bottom", "tape-left", "tape-right"];
  return positions[Math.floor(Math.random() * positions.length)];
}

// Load sequentially until missing
let index = 1;
function tryLoadNext() {
  if (index > maxPhotos) return startRotation();

  const num = String(index).padStart(2, "0");
  const src = `images/spotlight/${num}.jpg`;
  const img = new Image();

  img.onload = () => {
    photos.push(src);
    index++;
    tryLoadNext();
  };

  img.onerror = () => {
    startRotation();
  };

  img.src = src;
}

// Build stacks and animate
function startRotation() {
  if (photos.length === 0) return;

  // Ensure each stack gets all photos (so rotation works even with few images)
  stacks.forEach((stack, sIndex) => {
    photos.forEach((src, i) => {
      const frame = document.createElement("div");
      frame.classList.add("photo-frame");

      // Random size + tape + angle
      const sizes = ["small", "medium", "large"];
      frame.classList.add(sizes[Math.floor(Math.random() * sizes.length)]);
      frame.classList.add(randomTapeClass());

      frame.style.transform = 
        `translate(-50%, -50%) rotate(${randAngle()}deg) 
         translate(${randOffset()}px, ${randOffset()}px)`;

      // Image inside
      const img = document.createElement("img");
      img.src = src;
      frame.appendChild(img);

      // First photo in each stack is active
      if (i === 0) frame.classList.add("active");

      stack.appendChild(frame);
    });
  });

  // Rotate frames in each stack
  stacks.forEach(stack => {
    let current = 0;
    const frames = stack.querySelectorAll(".photo-frame");
    if (frames.length <= 1) return;

    setInterval(() => {
      frames[current].classList.remove("active");
      current = (current + 1) % frames.length;
      frames[current].classList.add("active");
    }, 4000 + Math.random() * 2000);
  });
}

tryLoadNext();


/* ===========================
   7. MOBILE NAV TOGGLE
   =========================== */
const hamburger = document.querySelector('.navbar .hamburger');
const navLinks = document.querySelector('.navbar .nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}





}); // <-- closes DOMContentLoaded
