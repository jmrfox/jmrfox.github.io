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

  document.addEventListener("DOMContentLoaded", function () {
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
  });
})();
