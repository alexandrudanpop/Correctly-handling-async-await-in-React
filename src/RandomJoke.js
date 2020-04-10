import React, { useState, useEffect, useRef } from "react";
import axios, { CancelToken } from "axios";

const useIsMounted = () => {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);
  return isMounted;
};

const useJokeAsync = (componentIsMounted, more) => {
  const [joke, setJoke] = useState("");
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
  }, [componentIsMounted, more]);

  return joke;
};

export default function RandomJoke({ more, loadMore }) {
  const componentIsMounted = useIsMounted();
  const joke = useJokeAsync(componentIsMounted, more);

  return (
    <div>
      <h1>Here's a random joke for you</h1>
      <h2>{`"${joke}"`}</h2>
      <button onClick={loadMore}>More...</button>
    </div>
  );
}
