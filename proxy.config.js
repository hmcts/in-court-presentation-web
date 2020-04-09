module.exports = [
  {
    context: [
      '/documents'
    ],
    target: 'http://localhost:1337',
    secure: false
  },
  {
    context: [
      '/icp'
    ],
    target: 'http://localhost:8080',
    secure: false,
    ws: true
  }
];
