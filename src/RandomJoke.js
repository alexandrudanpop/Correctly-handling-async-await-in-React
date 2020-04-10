import React, { useState, useEffect } from "react";
import axios from "axios";

export default function RandomJoke({ more, loadMore }) {
  const [joke, setJoke] = useState("");

  useEffect(() => {
    async function fetchJoke() {
      try {
        const asyncResponse = await axios("https://api.icndb.com/jokes/random");
        const { value } = asyncResponse.data;
        setJoke(value.joke);
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
