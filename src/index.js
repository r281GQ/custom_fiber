import express from 'express';

const server = express();

const html = `
  <html>
    <head>
      <link rel="stylesheet" href="styles.css">
      <link rel="stylesheet" href="main.css">
    </head>
    <body>
      <div id="root"></div>
      <script src="/assets/js/bundle.js"></script>
    </body>
  </html>
`;

server.use(express.static('public'));

server.get('*', (req, res) => {
  res.status(200).send(html);
});

server.listen(3000, () => console.log('Server started on port: 3000!'));
