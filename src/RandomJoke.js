import React, { useState, useEffect, useRef } from "react";
import axios, { CancelToken } from "axios";

export default function RandomJoke({ more, loadMore }) {
  const [joke, setJoke] = useState("");
  const componentIsMounted = useRef(true);

  useEffect(() => {
    // each useEffect can return a cleanup function
    return () => {
      componentIsMounted.current = false;
    };
  }, []); // no extra deps => the cleanup function run this on component unmount

  useEffect(() => {
    const cancelTokenSource = CancelToken.source();

    async function fetchJoke() {
      try {
        const asyncResponse = await axios(
          "https://api.icndb.com/jokes/random",
          {
            cancelToken: cancelTokenSource.token,
          }
        );
        const { value } = asyncResponse.data;

        if (componentIsMounted.current) {
          setJoke(value.joke);
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          return console.info(err);
        }

        console.error(err);
      }
    }

    fetchJoke();

    return () => {
      // here we cancel preveous http request that did not complete yet
      cancelTokenSource.cancel(
        "Cancelling previous http call because a new one was made ;-)"
      );
    };
  }, [more]);

  return (
    <div>
      <h1>Here's a random joke for you</h1>
      <h2>{`"${joke}"`}</h2>
      <button onClick={loadMore}>More...</button>
    </div>
  );
}
