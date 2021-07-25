## chrisisler/cubetime

Simple cube timer.

- Click timer to start/stop
- Click scramble to re-scramble

### /api/solves

- [x] GET /api/solves - Read all Solves
- [x] POST /api/solves - Create a Solve
- [x] DELETE /api/solves - Delete all Solves
- [x] DELETE /api/solves/:id - Delete Solve by ID

### client

- [x] Simple mobile-first UI

### takeaway

There is more to do to make this app better. Full-stack features like a Did Not
Finish button issuing a PUT request to MongoDB. Better optimization through
NextJS SSR.

Getting experience with MongoDB (and Atlas) and wiring up data-handling API
logic was the focus of this project. It was fun to use the updated UI in MongoDB
Atlas but not fun to fight with TypeScript nagging during development.
