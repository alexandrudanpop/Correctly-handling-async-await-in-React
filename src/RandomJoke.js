import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

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
    async function fetchJoke() {
      try {
        const asyncResponse = await axios("https://api.icndb.com/jokes/random");
        const { value } = asyncResponse.data;

        if (componentIsMounted.current) {
          setJoke(value.joke);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchJoke();
  }, [more]);

  return (
    <div>
      <h1>Here's a random joke for you</h1>
      <h2>{`"${joke}"`}</h2>
      <button onClick={loadMore}>More...</button>
    </div>
  );
}
