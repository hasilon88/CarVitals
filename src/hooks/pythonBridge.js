import { useState, useEffect } from 'react'

export function usePythonState(propName) {
  const [propValue, setPropValue] = useState();

  useEffect(() => {
      function registerState() {
          if (!window.pywebview.state) {
              window.pywebview.state = {};
          }
          window.pywebview.state[`set_${propName}`] = setPropValue;
      }

      if (window.pywebview) {
          registerState();
      } else {
          window.addEventListener("pywebviewready", registerState);
          return () => window.removeEventListener("pywebviewready", registerState);
      }
  }, [propName]);

  return propValue;
}

export function usePythonApi(apiName, apiContent) {
  return new Promise((resolve, reject) => {
    if (!window.pywebview) {
      return reject("pywebview is not available.");
    }

    const api = window.pywebview.api || {};

    if (typeof api[apiName] === "function") {
      try {
        const result = api[apiName](apiContent);
        resolve(result);
      } catch (err) {
        reject(`Error calling Python function: ${err.message}`);
      }
    } else {
      reject(`API method '${apiName}' is not defined.`);
    }
  });
}

