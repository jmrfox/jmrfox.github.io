(function () {
  "use strict";

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderTags(tags) {
    if (!tags || !tags.length) return "";
    return (
      '<div class="tags">' +
      tags.map(function (tag) {
        return '<span class="tag">' + escapeHtml(tag) + "</span>";
      }).join("") +
      "</div>"
    );
  }

  function renderMeta(items) {
    return items.filter(Boolean).join(" · ");
  }

  function renderCard(title, url, meta, note, tags, external) {
    var linkAttrs = external !== false
      ? ' target="_blank" rel="noopener"'
      : "";
    return (
      '<article class="card">' +
      "<h3><a href=\"" + escapeHtml(url) + "\"" + linkAttrs + ">" +
      escapeHtml(title) +
      "</a></h3>" +
      (meta ? '<p class="meta">' + escapeHtml(meta) + "</p>" : "") +
      (note ? "<p>" + escapeHtml(note) + "</p>" : "") +
      renderTags(tags) +
      "</article>"
    );
  }

  function renderProjects(projects) {
    return projects
      .map(function (p) {
        var meta = renderMeta([p.language, p.host]);
        return renderCard(p.name, p.url, meta, p.description, p.tags);
      })
      .join("");
  }

  function renderResearchItem(item) {
    var meta = renderMeta([String(item.year), item.venue]);
    return renderCard(item.title, item.url, meta, item.note, item.tags);
  }

  function renderResearch(papers, presentations) {
    var items = papers.concat(presentations);
    items.sort(function (a, b) {
      return b.year - a.year;
    });
    return items.map(renderResearchItem).join("");
  }

  function loadJson(path) {
    return fetch(path).then(function (res) {
      if (!res.ok) throw new Error("Failed to load " + path);
      return res.json();
    });
  }

  function mount(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function setContactStatus(el, message, kind) {
    if (!el) return;
    el.textContent = message;
    el.hidden = !message;
    el.classList.remove("is-success", "is-error");
    if (kind) el.classList.add(kind);
  }

  function initContactForm(formAction) {
    var form = document.getElementById("contact-form");
    var status = document.getElementById("contact-form-status");
    if (!form) return;

    if (!formAction) {
      setContactStatus(
        status,
        "Contact form is not configured yet. Add your Formspree URL to data/contact.json.",
        "is-error"
      );
      form.querySelector('button[type="submit"]').disabled = true;
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var submit = form.querySelector('button[type="submit"]');
      setContactStatus(status, "", null);
      submit.disabled = true;

      fetch(formAction, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          form.reset();
          setContactStatus(
            status,
            "Thanks — your message was sent. I'll get back to you soon.",
            "is-success"
          );
        })
        .catch(function () {
          setContactStatus(
            status,
            "Something went wrong. Try again later or reach out on LinkedIn.",
            "is-error"
          );
        })
        .finally(function () {
          submit.disabled = false;
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("projects-grid")) {
      Promise.all([
        loadJson("data/projects.json"),
        loadJson("data/fun-projects.json"),
        loadJson("data/papers.json"),
        loadJson("data/presentations.json"),
      ])
        .then(function (results) {
          mount("projects-grid", renderProjects(results[0]));
          mount("fun-projects-grid", renderProjects(results[1]));
          mount("research-grid", renderResearch(results[2], results[3]));
        })
        .catch(function (err) {
          console.error(err);
        });
    }

    if (document.getElementById("contact-form")) {
      loadJson("data/contact.json")
        .then(function (cfg) {
          initContactForm(cfg && cfg.formAction);
        })
        .catch(function (err) {
          console.error(err);
        });
    }
  });
})();
