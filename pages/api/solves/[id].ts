import type { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";

import { connectToDatabase } from "../../../lib/mongodb";
import { Solve } from "../../../lib/interfaces";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { db } = await connectToDatabase();
  const solvesDb = db.collection<Solve>("solves");

  switch (req.method) {
    // Delete a row by ID
    case "DELETE":
      const id = req.query.id;
      if (!id || typeof id !== "string") {
        res.status(500).send({ message: "req.query.id does not exist." });
        break;
      }
      const {
        result: { n },
      } = await solvesDb.deleteOne({ _id: new ObjectId(id) });
      // Return the deleted number of rows
      res.status(200).json({ count: n });
      break;
    default:
      res.setHeader("Allow", ["DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
