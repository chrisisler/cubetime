import type { ObjectId } from "mongodb";

export interface Solve {
  timestamp: number;
  solveTime: number;
  _id: ObjectId;
}
