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

  function renderPapers(papers) {
    return papers
      .map(function (p) {
        var meta = renderMeta([String(p.year), p.venue]);
        return renderCard(p.title, p.url, meta, p.note, p.tags);
      })
      .join("");
  }

  function renderPresentations(items) {
    return items
      .map(function (p) {
        var meta = renderMeta([String(p.year), p.venue]);
        return renderCard(p.title, p.url, meta, p.note, p.tags);
      })
      .join("");
  }

  function renderHighlights(items) {
    return items
      .map(function (h) {
        return (
          '<article class="card highlight-card">' +
          "<h3>" + escapeHtml(h.title) + "</h3>" +
          "<p>" + escapeHtml(h.description) + "</p>" +
          renderTags(h.tags) +
          "</article>"
        );
      })
      .join("");
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

  document.addEventListener("DOMContentLoaded", function () {
    Promise.all([
      loadJson("data/highlights.json"),
      loadJson("data/projects.json"),
      loadJson("data/papers.json"),
      loadJson("data/presentations.json"),
    ])
      .then(function (results) {
        mount("highlights-grid", renderHighlights(results[0]));
        mount("projects-grid", renderProjects(results[1]));
        mount("papers-grid", renderPapers(results[2]));
        mount("presentations-grid", renderPresentations(results[3]));
      })
      .catch(function (err) {
        console.error(err);
      });
  });
})();
