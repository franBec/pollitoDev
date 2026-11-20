(() => {
  const doc = document;
  const body = doc.body;

  const menuToggle = doc.querySelector("[data-menu-toggle]");
  const siteNav = doc.getElementById("site-nav");

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const open = siteNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(open));
      body.classList.toggle("menu-open", open);
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        siteNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        body.classList.remove("menu-open");
      }
    });
  }

  const overlay = doc.querySelector("[data-search-overlay]");
  const openSearch = doc.querySelectorAll("[data-search-open]");
  const closeSearch = doc.querySelector("[data-search-close]");
  const input = doc.querySelector("[data-search-input]");
  const results = doc.querySelector("[data-search-results]");
  const empty = doc.querySelector("[data-search-empty]");
  const indexUrl = body.dataset.searchIndex;

  let searchData = null;
  let searchPromise = null;

  const normalise = (value) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const loadSearch = () => {
    if (searchData) return Promise.resolve(searchData);
    if (searchPromise) return searchPromise;

    searchPromise = fetch(indexUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Search index unavailable");
        return response.json();
      })
      .then((data) => {
        searchData = data;
        return data;
      })
      .catch(() => {
        searchData = [];
        return searchData;
      });

    return searchPromise;
  };

  const clearResults = () => {
    if (results) results.replaceChildren();
    if (empty) empty.hidden = true;
  };

  const renderResults = (items) => {
    if (!results || !empty) return;
    results.replaceChildren();
    empty.hidden = items.length !== 0;

    items.slice(0, 8).forEach((item) => {
      const li = doc.createElement("li");
      li.className = "search-result";

      const link = doc.createElement("a");
      link.href = item.permalink;

      const title = doc.createElement("h3");
      title.textContent = item.title;

      const description = doc.createElement("p");
      description.textContent = item.description || item.categories.join(", ");

      link.append(title, description);
      li.append(link);
      results.append(li);
    });
  };

  const runSearch = (query) => {
    const needle = normalise(query.trim());
    if (!needle) {
      clearResults();
      return;
    }

    loadSearch().then((data) => {
      const matches = data.filter((item) => {
        const haystack = normalise(
          [item.title, item.description, item.categories.join(" "), item.content]
            .join(" ")
        );
        return haystack.includes(needle);
      });
      renderResults(matches);
    });
  };

  const open = () => {
    if (!overlay) return;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    body.classList.add("search-open");
    loadSearch();
    if (input) {
      input.value = "";
      input.focus();
    }
    clearResults();
  };

  const close = () => {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    body.classList.remove("search-open");
  };

  openSearch.forEach((button) => button.addEventListener("click", open));
  if (closeSearch) closeSearch.addEventListener("click", close);

  if (overlay) {
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
  }

  if (input) {
    input.addEventListener("input", (event) => runSearch(event.target.value));
  }

  doc.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target.isContentEditable;

    if (event.key === "Escape" && overlay && overlay.classList.contains("is-open")) {
      close();
      return;
    }

    if (!typing && (event.key === "/" || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"))) {
      event.preventDefault();
      open();
    }
  });

  doc.querySelectorAll(".highlight").forEach((block) => {
    const code = block.querySelector("code");
    if (!code || block.querySelector(".copy-button")) return;

    const button = doc.createElement("button");
    button.type = "button";
    button.className = "copy-button";
    button.textContent = body.dataset.copyLabel || "Copy";

    button.addEventListener("click", async () => {
      const text = code.innerText;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const area = doc.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.opacity = "0";
        doc.body.append(area);
        area.select();
        doc.execCommand("copy");
        area.remove();
      }
      const label = button.textContent;
      button.textContent = body.dataset.copiedLabel || "Copied";
      window.setTimeout(() => {
        button.textContent = label;
      }, 1400);
    });

    block.append(button);
  });

  const tocLinks = [...doc.querySelectorAll(".toc a[href^='#']")];
  if (tocLinks.length) tocLinks[0].classList.add("active");
  const headings = tocLinks
    .map((link) => doc.getElementById(link.getAttribute("href").slice(1)))
    .filter(Boolean);

  if (tocLinks.length && headings.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          tocLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${entry.target.id}`
            );
          });
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    headings.forEach((heading) => observer.observe(heading));
  }
})();

if (window.location.hash === "#search") {
  document.querySelector("[data-search-overlay]")?.classList.add("is-open");
  document.body.classList.add("search-open");
  document.querySelector("[data-search-input]")?.focus();
}
