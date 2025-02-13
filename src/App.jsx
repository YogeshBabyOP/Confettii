import { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import html2canvas from "html2canvas";
import { Share2 } from "lucide-react";

// Merged Entrance Banner with Subscribe-style Start Button
function EntranceBanner({ onStart }) {
  const buttonRef = useRef(null);
  const [showButtonConfetti, setShowButtonConfetti] = useState(false);
  const [buttonRect, setButtonRect] = useState(null);

  const handleButtonClick = () => {
    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
    setShowButtonConfetti(true);
    // Dismiss the banner
    onStart();

    // Hide the button-confetti after 2 seconds
    setTimeout(() => {
      setShowButtonConfetti(false);
    }, 2000);
  };

  useEffect(() => {
    const updateRect = () => {
      if (buttonRef.current) {
        setButtonRect(buttonRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Yogesh's Confetti</h1>
        <p className="mb-2">How to use :</p>
        <ul className="text-left list-disc list-inside mb-4">
          <li>Tilt your phone to control confetti wind.</li>
          <li>Tap anywhere for more and more confetti.</li>
        </ul>
        <div className="relative inline-block">
          {/* Using the space button HTML/CSS */}
          <button
            type="button"
            className="btn"
            ref={buttonRef}
            onClick={handleButtonClick}
          >
            <strong>Start</strong>
            <div id="container-stars">
              <div id="stars"></div>
            </div>
            <div id="glow">
              <div className="circle"></div>
              <div className="circle"></div>
            </div>
          </button>
          {showButtonConfetti && buttonRect && (
            <div
              className="absolute top-0 left-0 pointer-events-none"
              style={{ width: "100vw", height: "100vh" }}
            >
              <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                numberOfPieces={50}
                confettiSource={{
                  x: buttonRect.left,
                  y: buttonRect.top,
                  w: buttonRect.width,
                  h: buttonRect.height,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [showBanner, setShowBanner] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fadeConfetti, setFadeConfetti] = useState(false);
  const [tapCount, setTapCount] = useState(0); // Counts how many taps occur
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const [gravityValue, setGravityValue] = useState(0.01);
  const [windValue, setWindValue] = useState(0);
  const [confettiCount, setConfettiCount] = useState(100); // initial number of confetti pieces

  // Timer refs to allow resetting timers
  const fadeTimerRef = useRef(null);
  const removeTimerRef = useRef(null);
  // Ref for capturing screenshot of the entire app
  const appRef = useRef(null);

  // Update window dimensions on mount and on resize
  useEffect(() => {
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Listen for device orientation events to control wind
  useEffect(() => {
    const handleOrientation = (e) => {
      if (e.gamma !== null) {
        // Adjust multiplier as needed for desired wind effect
        setWindValue(e.gamma * 0.01);
      }
    };

    if (window.DeviceOrientationEvent) {
      // Request permission for iOS 13+ devices
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
          .then((response) => {
            if (response === "granted") {
              window.addEventListener("deviceorientation", handleOrientation);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener("deviceorientation", handleOrientation);
      }
    }
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  // Handle confetti start/reset on tap (main screen confetti)
  const startConfetti = () => {
    // Clear any existing timers so that tapping resets the countdown
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    if (removeTimerRef.current) clearTimeout(removeTimerRef.current);

    // Increase gravity for a fun effect on each tap and update confetti count
    setGravityValue((prev) => prev + 0.05);
    setConfettiCount((prev) => prev + 50);
    setTapCount((prev) => prev + 1);

    // Show confetti and reset fade state
    setShowConfetti(true);
    setFadeConfetti(false);

    fadeTimerRef.current = setTimeout(() => {
      setFadeConfetti(true);
    }, 4000); // Fade after 4 seconds

    removeTimerRef.current = setTimeout(() => {
      setShowConfetti(false);
      setFadeConfetti(false);
    }, 6000); // Remove after 6 seconds
  };

  // Capture screenshot and share using the Web Share API (if available)
  const handleShare = async () => {
    if (!appRef.current) return;
    try {
      const canvas = await html2canvas(appRef.current);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "confetti.png", { type: blob.type });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: "Check out my confetti!",
              text: "Look at this awesome confetti moment!",
              files: [file],
            });
          } catch (error) {
            console.error("Error sharing:", error);
          }
        } else {
          // Fallback: open the image in a new tab
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
        }
      }, "image/png");
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  };

  return (
    <div ref={appRef} className="relative">
      <div
        onClick={!showBanner ? startConfetti : undefined}
        className="flex items-center justify-center h-screen bg-black relative"
      >
        {showBanner && <EntranceBanner onStart={() => setShowBanner(false)} />}
        {showConfetti && windowDimensions.width > 0 && (
          <div
            className="fixed top-0 left-0 w-full h-full pointer-events-none"
            style={{ opacity: fadeConfetti ? 0 : 1, transition: "opacity 2s" }}
          >
            <Confetti
              width={windowDimensions.width}
              height={windowDimensions.height}
              numberOfPieces={confettiCount}
              gravity={0.1}
              wind={windValue}
            />
          </div>
        )}
      </div>
      {/* Show share button (icon) after 10 taps */}
      {tapCount >= 10 && (
        <button
          onClick={handleShare}
          className="fixed bottom-4 right-4 p-4 bg-green-500 text-white rounded-full shadow-lg z-50"
        >
          <Share2 className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
