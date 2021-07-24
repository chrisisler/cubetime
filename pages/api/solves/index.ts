import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

import { connectToDatabase } from "../../../lib/mongodb";
import { Solve } from "../../../lib/interfaces";

const cors = Cors({ methods: ["GET", "POST", "HEAD"] });

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await runMiddleware(req, res, cors);

  const { db } = await connectToDatabase();
  const solvesDb = db.collection<Solve>("solves");

  switch (req.method) {
    // Read all rows
    case "GET":
      const solves = await solvesDb.find().toArray();
      res.status(200).json(solves);
      break;
    // Create a row
    case "POST":
      if (!req.body.solveTime) {
        res.status(500).send({ message: "req.body needs solveTime." });
        break;
      }
      const entry: Omit<Solve, "_id"> = {
        timestamp: Date.now().valueOf(),
        solveTime: +req.body.solveTime,
      };
      // Mongo quirk: Successfully adding item appends `_id` to object.
      await solvesDb.insertOne(entry);
      res.status(200).json(entry);
      break;
    // Delete all rows
    case "DELETE":
      const {
        result: { n },
      } = await solvesDb.deleteMany({});
      // Return the deleted number of rows
      res.status(200).json({ count: n });
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}
