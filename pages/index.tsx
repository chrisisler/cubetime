import type { NextPage, GetServerSideProps } from "next";
import type { ObjectId } from "mongodb";
import Head from "next/head";
import { useState, useRef, useEffect, useCallback } from "react";
import prettyMilliseconds from "pretty-ms";

import type { Solve } from "../lib/interfaces";
import { connectToDatabase } from "../lib/mongodb";
import { generateHtmlScramble } from "../lib/scrambler";

const ms = (millis: number): string =>
  prettyMilliseconds(millis, { colonNotation: true });

const SolvesApi = {
  baseUrl: `/api/solves`,
  async create(solveTime: number) {
    const response = await fetch(SolvesApi.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ solveTime }),
    });
    const data = await response.json();
    return data;
  },
  async readAll() {
    const response = await fetch(SolvesApi.baseUrl, { method: "GET" });
    const solves: Solve[] = await response.json();
    return solves;
  },
  async deleteOne(_id: ObjectId) {
    const url = SolvesApi.baseUrl + "/" + _id;
    const response = await fetch(url, { method: "DELETE" });
    const data: { count: number } = await response.json();
    return data;
  },
  async deleteAll() {
    const response = await fetch(SolvesApi.baseUrl, { method: "DELETE" });
    const data: { count: number } = await response.json();
    return data;
  },
};

const Home: NextPage<{
  solves: Solve[];
}> = (props) => {
  const timerRef = useRef<number | null>(null);

  const getScramble = () => generateHtmlScramble(3, 20);

  const [scramble, setScramble] = useState(getScramble());
  const [solves, setSolves] = useState(props.solves);
  const [solveTime, setSolveTime] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const handleClick = useCallback(async () => {
    if (solveTime === 0) {
      setStartTime(Date.now() - solveTime);
    } else {
      // Reset timer
      setStartTime(0);
      setSolveTime(0);
      // Generate new scramble
      setScramble(getScramble());
      // Save the solve time to DB
      const solve = await SolvesApi.create(solveTime);
      // Update UI to reflect DB
      setSolves((s) => s.concat(solve));
    }
  }, [solveTime]);

  // Handle the timer setInterval
  useEffect(() => {
    if (startTime === 0) return;
    timerRef.current = setInterval(() => {
      setSolveTime(Date.now() - startTime);
    }, 1) as unknown as number;
    return () => {
      clearInterval(timerRef.current as unknown as NodeJS.Timeout);
      timerRef.current = null;
    };
  }, [startTime, solveTime]);

  return (
    <div className="container">
      <Head>
        <title>chrisisler/cubetime</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p className="scramble-text" onClick={() => setScramble(getScramble())}>
          {scramble}
        </p>
        <div className="timer">
          <button onClick={handleClick}>
            <h1>{ms(solveTime)}</h1>
          </button>
        </div>
        {solves.length > 0 && (
          <div className="solves-list ">
            <button
              className="clear-btn dark-text"
              onClick={async () => {
                if (!window.confirm("Clear all times?")) return;
                await SolvesApi.deleteAll();
                setSolves(await SolvesApi.readAll());
              }}
            >
              Clear All
            </button>
            {solves.map((solve, index) => (
              <div key={index} className="solve-item">
                <p className="dark-text">#{index + 1}</p>
                <p>{ms(solve.solveTime)}</p>
                <button
                  onClick={async () => {
                    await SolvesApi.deleteOne(solve._id);
                    setSolves(await SolvesApi.readAll());
                  }}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          max-width: 500px;
          padding: 64px 16px 0;
          display: flex;
          flex-direction: column;
          margin: 0 auto;
          text-align: center;
          height: 100vh;
        }

        .solves-list {
          margin: 32px;
          display: flex;
          flex-direction: column;
        }

        .solve-item {
          margin: 0 auto;
          width: 100%;
          max-width: 200px;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .solve-item p {
          margin-right: 16px;
          margin-bottom: 8px;
        }

        .solve-item button {
          font-size: 20px;
          padding: 4px;
          border: 0;
          outline: 0;
          background-color: transparent;
          color: red;
        }

        .dark-text {
          color: #777;
        }

        .clear-btn {
          font-size: 16px;
          margin-bottom: 8px;
          margin-left: auto;
          background-color: transparent;
          border: 0;
          outline: 0;
        }

        .scramble-text {
          font-size: 24px;
        }

        .timer {
          margin: 64px 0;
        }

        button {
          background-color: transparent;
          font-size: 370%;
          border: 0;
          outline: 0;
          color: #eee;
        }

        h1 {
          font-weight: 200;
        }

        p {
          font-size: 20px;
          line-height: 1.3em;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;

          height: 100vh;
          width: 100vw;
          background-color: #111;
          color: #eee;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { db } = await connectToDatabase();
  let solves = await db.collection<Solve>("solves").find().toArray();
  // Workaround for serializing attached `_id` for each item
  // https://github.com/vercel/next.js/issues/11993#issuecomment-617937409
  solves = JSON.parse(JSON.stringify(solves));

  return {
    props: { solves },
  };
};
