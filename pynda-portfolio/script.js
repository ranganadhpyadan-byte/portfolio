/* =========================================
   PORTFOLIO - PYnda Ranganadh
   script.js
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =========================================
     DARK / LIGHT MODE
  ========================================= */

  const themeButton = document.querySelector("#themeToggle");

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      document.body.classList.toggle("light");

      const isLight = document.body.classList.contains("light");

      localStorage.setItem(
        "portfolio-theme",
        isLight ? "light" : "dark"
      );

      themeButton.textContent = isLight ? "☀" : "☾";
    });

    // Load saved theme
    const savedTheme = localStorage.getItem("portfolio-theme");

    if (savedTheme === "light") {
      document.body.classList.add("light");
      themeButton.textContent = "☀";
    } else {
      themeButton.textContent = "☾";
    }
  }


  /* =========================================
     SMOOTH SCROLL
  ========================================= */

  document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function (event) {

      const targetId = this.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (target) {

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }

    });

  });


  /* =========================================
     SKILL FILTER
  ========================================= */

  const filterButtons = document.querySelectorAll(".filter");
  const skillCards = document.querySelectorAll(".skill-card");

  filterButtons.forEach(button => {

    button.addEventListener("click", () => {

      // Remove active state
      filterButtons.forEach(btn => {
        btn.classList.remove("active");
      });

      // Activate clicked button
      button.classList.add("active");

      filterButtons.forEach(btn => {
        btn.setAttribute(
          "aria-selected",
          btn === button ? "true" : "false"
        );
      });

      const category = button.dataset.filter;

      skillCards.forEach(card => {

        const cardCategory = card.dataset.category;

        if (
          category === "all" ||
          cardCategory === category
        ) {

          card.style.display = "";

          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, 20);

        } else {

          card.style.opacity = "0";
          card.style.transform = "translateY(10px)";

          setTimeout(() => {
            card.style.display = "none";
          }, 180);

        }

      });

    });

  });


  /* =========================================
     BFS PATH FINDER
  ========================================= */

  const bfsGrid = document.querySelector("#gridDemo");
  const runBfsButton = document.querySelector("#runBfs");
  const resetBfsButton = document.querySelector("#resetBfs");

  const ROWS = 10;
  const COLS = 16;

  let grid = [];
  let start = {
    row: 2,
    col: 2
  };

  let end = {
    row: 7,
    col: 13
  };


  /* -----------------------------------------
     CREATE GRID
  ----------------------------------------- */

  function createGrid() {

    if (!bfsGrid) return;

    bfsGrid.innerHTML = "";

    grid = [];

    for (let row = 0; row < ROWS; row++) {

      grid[row] = [];

      for (let col = 0; col < COLS; col++) {

        const cell = document.createElement("div");

        cell.classList.add("cell");

        const node = {
          row,
          col,
          wall: false,
          element: cell
        };

        grid[row][col] = node;

        /* Random walls */

        if (
          Math.random() < 0.12 &&
          !(row === start.row && col === start.col) &&
          !(row === end.row && col === end.col)
        ) {

          node.wall = true;
          cell.classList.add("wall");

        }

        /* Start node */

        if (
          row === start.row &&
          col === start.col
        ) {

          cell.classList.add("start");

        }

        /* End node */

        if (
          row === end.row &&
          col === end.col
        ) {

          cell.classList.add("end");

        }

        bfsGrid.appendChild(cell);

      }

    }

  }


  /* -----------------------------------------
     GET NEIGHBOURS
  ----------------------------------------- */

  function getNeighbours(node) {

    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1]
    ];

    const neighbours = [];

    directions.forEach(([dr, dc]) => {

      const newRow = node.row + dr;
      const newCol = node.col + dc;

      if (
        newRow >= 0 &&
        newRow < ROWS &&
        newCol >= 0 &&
        newCol < COLS
      ) {

        neighbours.push(grid[newRow][newCol]);

      }

    });

    return neighbours;

  }


  /* -----------------------------------------
     BFS ALGORITHM
  ----------------------------------------- */

  async function runBFS() {

    if (!grid.length) return;

    runBfsButton.disabled = true;

    resetBfs(false);

    const queue = [];

    const visited = new Set();

    const parent = new Map();

    const startNode = grid[start.row][start.col];
    const endNode = grid[end.row][end.col];

    queue.push(startNode);

    visited.add(`${start.row}-${start.col}`);


    while (queue.length > 0) {

      const current = queue.shift();

      /* End reached */

      if (
        current.row === end.row &&
        current.col === end.col
      ) {

        await animatePath(parent, endNode);

        runBfsButton.disabled = false;

        return;

      }


      const neighbours = getNeighbours(current);

      for (const neighbour of neighbours) {

        const key =
          `${neighbour.row}-${neighbour.col}`;

        if (
          visited.has(key) ||
          neighbour.wall
        ) {
          continue;
        }

        visited.add(key);

        parent.set(key, current);

        queue.push(neighbour);


        /* Visualize search */

        if (
          !(neighbour.row === end.row &&
            neighbour.col === end.col)
        ) {

          neighbour.element.classList.add("visited");

        }

        await sleep(25);

      }

    }

    runBfsButton.disabled = false;

    alert("No path found!");

  }


  /* -----------------------------------------
     ANIMATE FINAL PATH
  ----------------------------------------- */

  async function animatePath(parent, endNode) {

    let current = endNode;

    const path = [];

    while (current) {

      path.push(current);

      const key =
        `${current.row}-${current.col}`;

      current = parent.get(key);

    }

    path.reverse();

    for (const node of path) {

      if (
        !(node.row === start.row &&
          node.col === start.col) &&
        !(node.row === end.row &&
          node.col === end.col)
      ) {

        node.element.classList.remove("visited");

        node.element.classList.add("path");

      }

      await sleep(60);

    }

  }


  /* -----------------------------------------
     RESET BFS
  ----------------------------------------- */

  function resetBfs(recreate = true) {

    if (!grid.length) return;

    grid.forEach(row => {

      row.forEach(node => {

        node.element.classList.remove(
          "visited",
          "path"
        );

      });

    });

    if (recreate) {
      createGrid();
    }

  }


  /* -----------------------------------------
     SLEEP
  ----------------------------------------- */

  function sleep(ms) {

    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });

  }


  /* -----------------------------------------
     BFS BUTTONS
  ----------------------------------------- */

  if (runBfsButton) {

    runBfsButton.addEventListener(
      "click",
      runBFS
    );

  }

  if (resetBfsButton) {

    resetBfsButton.addEventListener(
      "click",
      () => resetBfs(true)
    );

  }


  /* Initialize BFS */

  if (bfsGrid) {
    createGrid();
  }


  /* =========================================
     CONTACT FORM
  ========================================= */

  const contactForm =
    document.querySelector("#contactForm");

  const formStatus =
    document.querySelector("#formStatus");

  if (contactForm) {

    contactForm.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();

        const name =
          document.querySelector("#name")?.value.trim();

        const email =
          document.querySelector("#email")?.value.trim();

        const subject =
          document.querySelector("#subject")?.value.trim();

        const message =
          document.querySelector("#message")?.value.trim();


        /* Validation */

        if (!name || !email || !message) {

          if (formStatus) {
            formStatus.textContent = "Please fill in all required fields.";
          }

          showNotification(
            "Please fill in all required fields.",
            "error"
          );

          return;

        }


        /* Email validation */

        const emailPattern =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

          if (formStatus) {
            formStatus.textContent = "Please enter a valid email address.";
          }

          showNotification(
            "Please enter a valid email address.",
            "error"
          );

          return;

        }


        /* Create mail */

        const mailSubject =
          encodeURIComponent(
            subject || `Portfolio message from ${name}`
          );

        const mailBody =
          encodeURIComponent(
`Name: ${name}

Email: ${email}

Message:

${message}`
          );


        const mailto =
          `mailto:ranganadhpyadan@gmail.com` +
          `?subject=${mailSubject}` +
          `&body=${mailBody}`;


        /* Open email client */

        window.location.href = mailto;


        showNotification(
          "Opening your email application...",
          "success"
        );

        if (formStatus) {
          formStatus.textContent = "Opening your email application...";
        }


        contactForm.reset();

      }
    );

  }


  /* =========================================
     NOTIFICATION
  ========================================= */

  function showNotification(message, type = "success") {

    const oldNotification =
      document.querySelector(".notification");

    if (oldNotification) {
      oldNotification.remove();
    }


    const notification =
      document.createElement("div");

    notification.className =
      `notification ${type}`;

    notification.textContent = message;


    document.body.appendChild(notification);


    setTimeout(() => {

      notification.classList.add("show");

    }, 20);


    setTimeout(() => {

      notification.classList.remove("show");

      setTimeout(() => {
        notification.remove();
      }, 300);

    }, 3500);

  }


  /* =========================================
     COPY EMAIL
  ========================================= */

  document.querySelectorAll(".copy-row[data-copy]").forEach(button => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copy;
      const type = button.dataset.copyType || "text";

      try {
        await navigator.clipboard.writeText(value);
        showNotification(`${type[0].toUpperCase()}${type.slice(1)} copied!`, "success");
      } catch (error) {
        showNotification(`Unable to copy ${type}.`, "error");
      }
    });
  });


  /* =========================================
     CONTACT CARD (.VCF)
  ========================================= */

  const contactCardButton =
    document.querySelector("#downloadContact");

  if (contactCardButton) {

    contactCardButton.addEventListener(
      "click",
      () => {

        const vCard =
`BEGIN:VCARD
VERSION:3.0
FN:Pynda Ranganadh
N:Pynda;Ranganadh;;;
TEL;TYPE=CELL:+919952368427
EMAIL:ranganadhpyadan@gmail.com
URL:https://www.linkedin.com/in/pynda-ranganadh-b057b6378/
URL:https://github.com/ranganadhpyadan-byte
ORG:Sandip University
TITLE:B.Tech Artificial Intelligence & Machine Learning Student
ADR:;;Rajahmundry;Andhra Pradesh;India;;India
END:VCARD`;


        const blob =
          new Blob(
            [vCard],
            {
              type: "text/vcard"
            }
          );


        const url =
          URL.createObjectURL(blob);


        const link =
          document.createElement("a");

        link.href = url;

        link.download =
          "Pynda-Ranganadh-Contact.vcf";


        document.body.appendChild(link);

        link.click();

        link.remove();


        URL.revokeObjectURL(url);


        showNotification(
          "Contact card downloaded!",
          "success"
        );

      }
    );

  }


  /* =========================================
     ACTIVE NAVIGATION
  ========================================= */

  const sections =
    document.querySelectorAll("section[id]");

  const navLinks =
    document.querySelectorAll(
      '.site-header .nav a'
    );


  window.addEventListener(
    "scroll",
    () => {

      let currentSection = "";

      sections.forEach(section => {

        const sectionTop =
          section.offsetTop - 180;

        if (
          window.scrollY >= sectionTop
        ) {

          currentSection =
            section.getAttribute("id");

        }

      });


      navLinks.forEach(link => {

        link.classList.remove("active");

        const href =
          link.getAttribute("href");

        if (
          href === `#${currentSection}`
        ) {

          link.classList.add("active");

        }

      });

    }
  );


  /* =========================================
     SCROLL REVEAL ANIMATION
  ========================================= */

  const revealElements =
    document.querySelectorAll(
      ".skill-card, .project-card, .mini-card, .contact-form, .direct-card, .take-card"
    );


  const revealObserver =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            entry.target.classList.add(
              "visible"
            );

            revealObserver.unobserve(
              entry.target
            );

          }

        });

      },
      {
        threshold: 0.12
      }
    );


  revealElements.forEach(element => {

    element.classList.add("reveal");

    revealObserver.observe(element);

  });


  /* =========================================
     RESUME BUTTON
  ========================================= */

  const resumeButtons =
    document.querySelectorAll(
      '[data-resume]'
    );


  resumeButtons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const resumePath =
          button.dataset.resume ||
          "../assets/Pynda%20Ranganadh.pdf";

        const link =
          document.createElement("a");

        link.href = resumePath;

        link.download =
          "Pynda-Ranganadh-Resume.pdf";

        document.body.appendChild(link);

        link.click();

        link.remove();

      }
    );

  });


  /* =========================================
     PAGE LOADING
  ========================================= */

  document.body.classList.add("loaded");

  const year = document.querySelector("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

});