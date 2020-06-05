![Twitter Follow](https://img.shields.io/twitter/follow/alexandrudanpop?style=social)

# Correctly-handling-async-await-in-React
A guide to handle async await in React components #react #javascript

[Check original post on DEV.TO](https://dev.to/alexandrudanpop/correctly-handling-async-await-in-react-components-4h74)

## Context
There have been tweets lately stating that **async/await** does not work well with **React** components, unless there is a certain amount of complexity in how you deal with it. 


## Why is it so complex?
Handling asynchronous code is **complex** both in React and probably in most other UI libraries / frameworks. The reason is that at any time we are awaiting for some asynchronous code to finish, **the component props could be updated** or **the component could be unmounted**.


## Exposing the problems
As the first tweet states, this is complex, but I'll try to explain what happens here. 

In the following code snippets, we will look at a component making asynchronous HTTP requests using the axios library:
```jsx
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
```
**Well...What issues does the above component have?**

1) **If the component is unmounted** before the async request is completed, the async request still runs and will call the setState function when it completes, leading to a React warning :confused::
![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/valfu2hoiku55uxu90m0.PNG) 

2) **If the "more" prop is changed** before the async request completes then this effect will be run again, hence the async function is invoked again. This can lead to a race condition if the first request finishes after the second request.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/d1ap5df2to6503s5u17w.PNG)

This could be wrong as we want to have the result of the latest async call that we requested. 
 
Obviously in an app of this simplicity it would be ok, but let's say you had an app that queries an API based on some search text - you would always want to display the result of the latest query being typed.

## How to fix
**Issue no 1** - fix the React warning using a ref:
```jsx
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
```
As you can see, what we did above was adding a ref **componentIsMounted** that simply updates when the component is unmounted. For this we added the extra effect with a cleanup function. Then where we fetch the data before setting the state, we check if the component is still mounted. **Problem solved :white_check_mark:!** Now let's fix: 

**Issue no 2**: fix the actual async issue. What we want is if we requested some async work to happen, we need a way to cancel it in case it didn't complete and meanwhile someone requested it again. Luckily **axios** has exactly what we need - a **Cancellation Token** :boom:
```jsx
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
```
What happens here:
1) We create a cancel token source every time the effect that fetches async data is called, and pass it to axios.
2) If the effect is called again before the async work is done, we take advantage of React's **useEffect** cleanup function. The cleanup will run before the effect is invoked again, hence we can do the cancellation by calling **cancelTokenSource.cancel()**.

## Conclusions
So yeah, handling async work in React is a bit complex. Of course we can abstract it by using a custom hook to fetch the data. 

You might not always have to worry about those issues in every situation. If your component is well isolated, meaning it does not depend on prop values for the asynchronous code it runs, things should be ok... You will probably still get the unmount issue from time to time, and you should probably fix that as well if your component un-mounts often. 

[Correctly handling async/await in React components - Part 2](https://dev.to/alexandrudanpop/correctly-handling-async-await-in-react-components-part-2-4fl7)

If you like this post follow me on [Twitter](https://twitter.com/alexandrudanpop) where I post more cool stuff about React and other awesome technologies. :fire::fire::fire:
