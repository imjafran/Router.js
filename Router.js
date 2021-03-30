"use strict";

const Router = {
  hash: window.location.hash.substring(1).replace(/^\/|\/$/g, ""),
  states: [],

  options: {
    router_attribute: "data-router",
    screen_attribute: "data-screen",
    home_screen: "home",
    error_screen: "error",
    active_class: "active",
    inactive_class: "",
  },

  init: (options = {}) => {
    Router.setOptions(options);

    if (Router.hash) Router.route(Router.hash);
    else Router.route(Router.options.home_screen);
  },

  push: (hash) => {
    hash = hash.replace(/^\/|\/$/g, "");
    window.location.hash = hash;
    Router.hash = hash;
    Router.states.push(hash.split("/"));
    window.history.replaceState({ screen: hash }, "");
    let currentState = window.history.state;
    if (!currentState || currentState.screen != hash)
      window.history.pushState({ screen: Router.hash }, "");
  },

  route: (to = false) => {
    if (!to) return false;
    let screen = document.querySelector(
      `[${Router.options.screen_attribute}="${to}"]`
    );

    Router.event("before", Router.from, to);

    if (to != Router.options.error) Router.push(to);

    Router.hideScreens();

    if (Router.options.error != to && !screen) {
      Router.event("error", Router.from, to);
      Router.route(Router.options.error_screen);
      return false;
    }

    if (screen) {
      if (screen.style.display != "none") return false;

      Router.event("after", Router.from, to);

      screen.style.display = "block";

      if (Router.options.active_class)
        screen.classList.add(Router.options.active_class);
      if (Router.options.inactive_class)
        screen.classList.remove(Router.options.inactive_class);

      Router.from = Router.to;
      Router.to = to;
    }
  },

  hideScreens: () => {
    let oscreens = document.querySelectorAll(
      `[${Router.options.screen_attribute}]`
    );
    if (!oscreens) return false;
    oscreens.forEach((oscreen) => {
      oscreen.style.display = "none";

      if (Router.options.inactive_class)
        oscreen.classList.add(Router.options.inactive_class);
      if (Router.options.active_class)
        oscreen.classList.remove(Router.options.active_class);
    });
  },

  setOptions: (args = {}) => {
    Router.options = Object.assign(Router.options, args);
  },

  event: (name = "error", from = Router.from, to = Router.to) => {
    document.dispatchEvent(
      new CustomEvent(`Router.${name}`, {
        bubbles: true,
        detail: {
          from: from,
          to: to,
          states: to.split("/"),
        },
      })
    );
  },
};

window.addEventListener("popstate", function (event) {
  if (event.state !== null) Router.route(event.state.screen);
});

window.onload = () => {
  document
    .querySelectorAll(`[${Router.options.router_attribute}]`)
    .forEach((routeTo) => {
      routeTo.addEventListener("click", (event) => {
        event.preventDefault();
        if (routeTo.getAttribute(`${Router.options.router_attribute}`).length)
          Router.route(
            routeTo.getAttribute(`${Router.options.router_attribute}`)
          );
      });
    });
};
