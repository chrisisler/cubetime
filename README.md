## cubetime

Simple cube timer. Built using NextJS and MongoDB Atlas.

#### node_modules fix

The application depends on a package "scrambles" which throws an error due to a
missing "worker_threads" dependency. To fix this, change line 13 of
`node_modules/scrambles/dist/esm/scrambles.js` to `return self.Worker;`.
