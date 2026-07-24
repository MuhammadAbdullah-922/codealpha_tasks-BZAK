import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Placed once inside <BrowserRouter> in App.jsx. Every time the URL path
// changes (clicking any Link, navigating to a product, etc.), this resets
// the scroll position to the top — so a new page never opens "mid-scroll"
// from wherever the previous page happened to be scrolled to.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}