/* ============================================================
   INDEX.JS — HOMEPAGE SCRIPTS
   ------------------------------------------------------------
   Scope:
   - Runs only on index.html
   - Global/shared scripts live in base.js
   - Component/partial scripts live in assets/scripts/partials/
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ============================================================
     1. TRIAL EXPIRATION DATE
     ------------------------------------------------------------
     - Finds #trialExp placeholder
     - Fills it with a date 14 days from today
     ============================================================ */
  const trialExp = document.getElementById("trialExp");
  if (trialExp) {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    trialExp.textContent = date.toLocaleDateString();
  }

  /* ============================================================
     2. PHOTO CAROUSEL (legacy block, #carousel only)
     ------------------------------------------------------------
     - Left/right nav buttons move the carousel
     - Works only if #slides and .nav buttons exist
     ============================================================ */
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

  /* ============================================================
     3. CONTACT WIDGET
     ------------------------------------------------------------
     - FAB button toggles the quick message panel
     ============================================================ */
  const openPanelBtn = document.getElementById("openPanel");
  const panel = document.getElementById("panel");

  if (openPanelBtn && panel) {
    openPanelBtn.addEventListener("click", () => {
      panel.classList.toggle("show");
    });
  }
  
/* ============================================================
   4. TRIAL POPOVER
   ------------------------------------------------------------
   - Shows the coupon popup after 5s (desktop only)
   - Mobile devices are excluded completely
   ============================================================ */
const trialPop = document.getElementById("trialPop");
const closeBtn = trialPop?.querySelector(".close");

// ✅ ONE consistent helper for mobile detection
function isMobile() {
  return window.matchMedia("(max-width: 768px)").matches;
}

// Show only on desktop (skip mobile)
if (trialPop && closeBtn) {
  if (!isMobile()) {
    // Show after 5s
    setTimeout(() => {
      trialPop.style.display = "block";
    }, 5000);
  } else {
    // Force-hide on mobile (safety)
    trialPop.style.display = "none";
  }

  // Close button always works
  closeBtn.addEventListener("click", () => {
    trialPop.style.display = "none";
  });
}


  /* ============================================================
     5. PROGRAM SWITCHER
     ------------------------------------------------------------
     - Four program buttons
     - Swap content (title, desc, image) into .program-detail
     ============================================================ */
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
      // clear active, set clicked
      programButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const key = btn.dataset.program;
      const program = programData[key];

      // fade out
      programTitle.style.opacity = 0;
      programDesc.style.opacity = 0;
      programImg.style.opacity = 0;

      setTimeout(() => {
        // update content
        programTitle.textContent = program.title;
        programDesc.textContent = program.desc;
        programImg.src = program.img;
        programImg.alt = program.alt;

        // fade back in
        programTitle.style.opacity = 1;
        programDesc.style.opacity = 1;
        programImg.style.opacity = 1;
      }, 200);
    });
  });

  /* ============================================================
     6. PHOTO STACK ROTATOR
     ------------------------------------------------------------
     - Loads spotlight images from /images/spotlight/NN.jpg
     - Desktop: 3 stacks (random sizes, tape, angles)
     - Mobile: only stack1 (clean, full-frame)
     - Rotates with fade every 4-6 seconds
     ============================================================ */
  const maxPhotos = 99;
  const stacks = [
    document.getElementById("stack1"),
    document.getElementById("stack2"),
    document.getElementById("stack3")
  ];
  const photos = [];

  // Random helpers (desktop only)
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

  // Load images sequentially until one is missing
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

    // ✅ desktop = all 3 stacks, mobile = only stack1
    const targetStacks = isMobile() ? [stacks[0]] : stacks;

    targetStacks.forEach((stack) => {
      photos.forEach((src, i) => {
        const frame = document.createElement("div");
        frame.classList.add("photo-frame");

        if (!isMobile()) {
          // desktop gets random size/tape/angle
          const sizes = ["small", "medium", "large"];
          frame.classList.add(sizes[Math.floor(Math.random() * sizes.length)]);
          frame.classList.add(randomTapeClass());
          frame.style.transform =
            `translate(-50%, -50%) rotate(${randAngle()}deg) ` +
            `translate(${randOffset()}px, ${randOffset()}px)`;
        } else {
          // mobile = clean, no transform
          frame.style.transform = "none";
        }

        const img = document.createElement("img");
        img.src = src;
        frame.appendChild(img);

        if (i === 0) frame.classList.add("active"); // first image visible
        stack.appendChild(frame);
      });
    });

    // Rotation logic
    targetStacks.forEach((stack) => {
      let current = 0;
      const frames = stack.querySelectorAll(".photo-frame");
      if (frames.length <= 1) return;

      setInterval(() => {
        frames[current].classList.remove("active");
        current = (current + 1) % frames.length;
        frames[current].classList.add("active");
      }, 4000 + Math.random() * 2000); // 4-6 seconds
    });
  }

  tryLoadNext();

  /* ============================================================
     7. MOBILE NAV TOGGLE
     ------------------------------------------------------------
     - Hamburger toggles nav links
     ============================================================ */
  const hamburger = document.querySelector('.navbar .hamburger');
  const navLinks = document.querySelector('.navbar .nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

}); // <-- closes DOMContentLoaded
