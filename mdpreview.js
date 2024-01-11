function applyMDTemplate(markdownstuff) {
    const escapedMarkdown = encodeURIComponent(markdownstuff);

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <title>Markdown Preview</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/12.0.4/markdown-it.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css">
    <!-- For highlighting code blocks -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <style>
    body {
      box-sizing: border-box;
      max-width: 960px;
      margin: 0 auto;
      padding: 45px;
    }
    </style>
    </head>
    <body>
    <div class="markdown-body">
    ${markdownstuff}
    </div>
    <script>
    const markdownBody = document.querySelector('.markdown-body');
    markdownBody.innerHTML = markdownit().render(decodeURIComponent("${escapedMarkdown}"));
    hljs.highlightAll();
    </script>
    </body>
    </html>
    `;

    return html;
}