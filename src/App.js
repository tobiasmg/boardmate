import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, RotateCcw, Play, BookOpen, Target, Undo2 } from 'lucide-react';

const ChessTrainingApp = () => {
  // Add mobile-specific CSS
  useEffect(() => {
    // Add mobile viewport and chess font optimization
    const style = document.createElement('style');
    style.textContent = `
      .chess-piece {
        font-family: 'Arial Unicode MS', 'Lucida Grande', 'Segoe UI Symbol', 'DejaVu Sans', Arial, sans-serif !important;
        font-feature-settings: normal !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        font-variant-emoji: text !important;
        text-rendering: optimizeLegibility !important;
        font-size: inherit !important;
        line-height: 1 !important;
        vertical-align: baseline !important;
        font-weight: normal !important;
        font-style: normal !important;
        color: inherit !important;
        -webkit-text-fill-color: inherit !important;
        -webkit-text-stroke: 0 !important;
        -webkit-font-feature-settings: normal !important;
        font-variant: normal !important;
      }

      .chess-piece-white {
        /* SVG styling handled in component */
      }

      .chess-piece-black {
        /* SVG styling handled in component */
      }

      body {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        overflow-x: hidden;
      }
    `;
    document.head.appendChild(style);

    // Ensure viewport is set for mobile
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(viewport);
    }

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Initial board setup - function to always get fresh copy
  const getInitialBoard = () => [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
  ];

  // State for responsive design
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [board, setBoard] = useState(() => getInitialBoard());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null); // Track last move for highlighting
  const [moveCounter, setMoveCounter] = useState(0); // Add counter to ensure unique moves
  const [gameMode, setGameMode] = useState('menu');
  const [trainingMode, setTrainingMode] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showHint, setShowHint] = useState(null);
  const [needsReplay, setNeedsReplay] = useState(false);

  // Undo functionality - minimal addition
  const [undoStack, setUndoStack] = useState([]);

  // Add timeout refs for cleanup
  const timeoutRefs = useRef([]);

  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  const addTimeout = (callback, delay) => {
    const timeoutId = setTimeout(() => {
      callback();
      timeoutRefs.current = timeoutRefs.current.filter(id => id !== timeoutId);
    }, delay);
    timeoutRefs.current.push(timeoutId);
    return timeoutId;
  };

  // Opening databases with all variations
  const openingDatabases = {
    sicilianDragon: {
      name: "Sicilian Defence - Accelerated Dragon",
      color: "black",
      variations: {
        mainLine: {
          name: "Main Line (Modern Variation)",
          moves: {
            "": ["e2-e4"],
            "e2-e4": ["c7-c5"],
            "e2-e4,c7-c5": ["g1-f3"],
            "e2-e4,c7-c5,g1-f3": ["b8-c6"],
            "e2-e4,c7-c5,g1-f3,b8-c6": ["d2-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4": ["c5-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4": ["f3-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4": ["g7-g6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6": ["b1-c3"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,b1-c3": ["f8-g7"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,b1-c3,f8-g7": ["c1-e3"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,b1-c3,f8-g7,c1-e3": ["g8-f6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,b1-c3,f8-g7,c1-e3,g8-f6": ["f1-c4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,b1-c3,f8-g7,c1-e3,g8-f6,f1-c4": ["e8-g8"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,b1-c3,f8-g7,c1-e3,g8-f6,f1-c4,e8-g8": ["c4-b3"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,b1-c3,f8-g7,c1-e3,g8-f6,f1-c4,e8-g8,c4-b3": ["d7-d6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,b1-c3,f8-g7,c1-e3,g8-f6,f1-c4,e8-g8,c4-b3,d7-d6": ["f2-f3"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,b1-c3,f8-g7,c1-e3,g8-f6,f1-c4,e8-g8,c4-b3,d7-d6,f2-f3": ["c8-d7"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,b1-c3,f8-g7,c1-e3,g8-f6,f1-c4,e8-g8,c4-b3,d7-d6,f2-f3,c8-d7": ["d1-d2"]
          }
        },
        maroczyBind: {
          name: "Maroczy Bind",
          moves: {
            "": ["e2-e4"],
            "e2-e4": ["c7-c5"],
            "e2-e4,c7-c5": ["g1-f3"],
            "e2-e4,c7-c5,g1-f3": ["b8-c6"],
            "e2-e4,c7-c5,g1-f3,b8-c6": ["d2-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4": ["c5-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4": ["f3-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4": ["g7-g6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6": ["c2-c4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c2-c4": ["f8-g7"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c2-c4,f8-g7": ["c1-e3"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c2-c4,f8-g7,c1-e3": ["g8-f6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c2-c4,f8-g7,c1-e3,g8-f6": ["b1-c3"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c2-c4,f8-g7,c1-e3,g8-f6,b1-c3": ["e8-g8"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c2-c4,f8-g7,c1-e3,g8-f6,b1-c3,e8-g8": ["f1-e2"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c2-c4,f8-g7,c1-e3,g8-f6,b1-c3,e8-g8,f1-e2": ["d7-d6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c2-c4,f8-g7,c1-e3,g8-f6,b1-c3,e8-g8,f1-e2,d7-d6": ["e1-g1"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c2-c4,f8-g7,c1-e3,g8-f6,b1-c3,e8-g8,f1-e2,d7-d6,e1-g1": ["c8-d7"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c2-c4,f8-g7,c1-e3,g8-f6,b1-c3,e8-g8,f1-e2,d7-d6,e1-g1,c8-d7": ["a1-c1"]
          }
        },
        exchange: {
          name: "Exchange Variation",
          moves: {
            "": ["e2-e4"],
            "e2-e4": ["c7-c5"],
            "e2-e4,c7-c5": ["g1-f3"],
            "e2-e4,c7-c5,g1-f3": ["b8-c6"],
            "e2-e4,c7-c5,g1-f3,b8-c6": ["d2-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4": ["c5-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4": ["f3-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4": ["g7-g6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6": ["d4-c6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,d4-c6": ["b7-c6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,d4-c6,b7-c6": ["f1-d3"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,d4-c6,b7-c6,f1-d3": ["f8-g7"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,d4-c6,b7-c6,f1-d3,f8-g7": ["e1-g1"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,d4-c6,b7-c6,f1-d3,f8-g7,e1-g1": ["g8-f6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,d4-c6,b7-c6,f1-d3,f8-g7,e1-g1,g8-f6": ["c2-c4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,d4-c6,b7-c6,f1-d3,f8-g7,e1-g1,g8-f6,c2-c4": ["e8-g8"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,d4-c6,b7-c6,f1-d3,f8-g7,e1-g1,g8-f6,c2-c4,e8-g8": ["b1-c3"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,d4-c6,b7-c6,f1-d3,f8-g7,e1-g1,g8-f6,c2-c4,e8-g8,b1-c3": ["d7-d6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,d4-c6,b7-c6,f1-d3,f8-g7,e1-g1,g8-f6,c2-c4,e8-g8,b1-c3,d7-d6": ["d1-e2"]
          }
        },
        be3Variation: {
          name: "5. Be3 Variation",
          moves: {
            "": ["e2-e4"],
            "e2-e4": ["c7-c5"],
            "e2-e4,c7-c5": ["g1-f3"],
            "e2-e4,c7-c5,g1-f3": ["b8-c6"],
            "e2-e4,c7-c5,g1-f3,b8-c6": ["d2-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4": ["c5-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4": ["f3-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4": ["g7-g6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6": ["c1-e3"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c1-e3": ["f8-g7"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c1-e3,f8-g7": ["b1-c3"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c1-e3,f8-g7,b1-c3": ["g8-f6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c1-e3,f8-g7,b1-c3,g8-f6": ["f1-c4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c1-e3,f8-g7,b1-c3,g8-f6,f1-c4": ["e8-g8"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c1-e3,f8-g7,b1-c3,g8-f6,f1-c4,e8-g8": ["c4-b3"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c1-e3,f8-g7,b1-c3,g8-f6,f1-c4,e8-g8,c4-b3": ["d7-d6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c1-e3,f8-g7,b1-c3,g8-f6,f1-c4,e8-g8,c4-b3,d7-d6": ["f2-f3"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c1-e3,f8-g7,b1-c3,g8-f6,f1-c4,e8-g8,c4-b3,d7-d6,f2-f3": ["c8-d7"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,c1-e3,f8-g7,b1-c3,g8-f6,f1-c4,e8-g8,c4-b3,d7-d6,f2-f3,c8-d7": ["d1-d2"]
          }
        },
        f3Variation: {
          name: "5. f3 Variation",
          moves: {
            "": ["e2-e4"],
            "e2-e4": ["c7-c5"],
            "e2-e4,c7-c5": ["g1-f3"],
            "e2-e4,c7-c5,g1-f3": ["b8-c6"],
            "e2-e4,c7-c5,g1-f3,b8-c6": ["d2-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4": ["c5-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4": ["f3-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4": ["g7-g6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6": ["f2-f3"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,f2-f3": ["f8-g7"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,f2-f3,f8-g7": ["b1-c3"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,f2-f3,f8-g7,b1-c3": ["g8-f6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,f2-f3,f8-g7,b1-c3,g8-f6": ["c1-e3"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,f2-f3,f8-g7,b1-c3,g8-f6,c1-e3": ["e8-g8"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,f2-f3,f8-g7,b1-c3,g8-f6,c1-e3,e8-g8": ["d1-d2"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,f2-f3,f8-g7,b1-c3,g8-f6,c1-e3,e8-g8,d1-d2": ["d7-d6"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,f2-f3,f8-g7,b1-c3,g8-f6,c1-e3,e8-g8,d1-d2,d7-d6": ["e1-c1"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,f2-f3,f8-g7,b1-c3,g8-f6,c1-e3,e8-g8,d1-d2,d7-d6,e1-c1": ["c6-d4"],
            "e2-e4,c7-c5,g1-f3,b8-c6,d2-d4,c5-d4,f3-d4,g7-g6,f2-f3,f8-g7,b1-c3,g8-f6,c1-e3,e8-g8,d1-d2,d7-d6,e1-c1,c6-d4": ["e3-d4"]
          }
        }
      }
    },
    scotchGame: {
      name: "Scotch Game",
      color: "white",
      variations: {
        classical: {
          name: "Classical Variation",
          moves: {
            "": ["e2-e4"],
            "e2-e4": ["e7-e5"],
            "e2-e4,e7-e5": ["g1-f3"],
            "e2-e4,e7-e5,g1-f3": ["b8-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6": ["d2-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4": ["e5-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4": ["f3-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4": ["f8-c5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5": ["c1-e3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3": ["d8-f6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6": ["c2-c3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,c2-c3": ["g8-e7"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,c2-c3,g8-e7": ["f1-c4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,c2-c3,g8-e7,f1-c4": ["e8-g8"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,c2-c3,g8-e7,f1-c4,e8-g8": ["e1-g1"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,c2-c3,g8-e7,f1-c4,e8-g8,e1-g1": ["c5-b6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,c2-c3,g8-e7,f1-c4,e8-g8,e1-g1,c5-b6": ["f2-f4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,c2-c3,g8-e7,f1-c4,e8-g8,e1-g1,c5-b6,f2-f4": ["d7-d6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,c2-c3,g8-e7,f1-c4,e8-g8,e1-g1,c5-b6,f2-f4,d7-d6": ["g1-h1"]
          }
        },
        schmidt: {
          name: "Schmidt Variation",
          moves: {
            "": ["e2-e4"],
            "e2-e4": ["e7-e5"],
            "e2-e4,e7-e5": ["g1-f3"],
            "e2-e4,e7-e5,g1-f3": ["b8-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6": ["d2-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4": ["e5-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4": ["f3-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4": ["g8-f6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6": ["d4-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,d4-c6": ["b7-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,d4-c6,b7-c6": ["e4-e5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,d4-c6,b7-c6,e4-e5": ["d8-e7"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,d4-c6,b7-c6,e4-e5,d8-e7": ["d1-e2"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,d4-c6,b7-c6,e4-e5,d8-e7,d1-e2": ["f6-d5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,d4-c6,b7-c6,e4-e5,d8-e7,d1-e2,f6-d5": ["c2-c4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,d4-c6,b7-c6,e4-e5,d8-e7,d1-e2,f6-d5,c2-c4": ["c8-a6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,d4-c6,b7-c6,e4-e5,d8-e7,d1-e2,f6-d5,c2-c4,c8-a6": ["b2-b3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,d4-c6,b7-c6,e4-e5,d8-e7,d1-e2,f6-d5,c2-c4,c8-a6,b2-b3": ["g7-g6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,d4-c6,b7-c6,e4-e5,d8-e7,d1-e2,f6-d5,c2-c4,c8-a6,b2-b3,g7-g6": ["g2-g3"]
          }
        },
        fourKnights: {
          name: "Scotch Four Knights",
          moves: {
            "": ["e2-e4"],
            "e2-e4": ["e7-e5"],
            "e2-e4,e7-e5": ["g1-f3"],
            "e2-e4,e7-e5,g1-f3": ["b8-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6": ["d2-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4": ["e5-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4": ["f3-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4": ["g8-f6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6": ["b1-c3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,b1-c3": ["f8-b4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,b1-c3,f8-b4": ["d4-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,b1-c3,f8-b4,d4-c6": ["b7-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,b1-c3,f8-b4,d4-c6,b7-c6": ["f1-d3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,b1-c3,f8-b4,d4-c6,b7-c6,f1-d3": ["d7-d5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,b1-c3,f8-b4,d4-c6,b7-c6,f1-d3,d7-d5": ["e4-d5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,b1-c3,f8-b4,d4-c6,b7-c6,f1-d3,d7-d5,e4-d5": ["c6-d5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,b1-c3,f8-b4,d4-c6,b7-c6,f1-d3,d7-d5,e4-d5,c6-d5": ["e1-g1"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,b1-c3,f8-b4,d4-c6,b7-c6,f1-d3,d7-d5,e4-d5,c6-d5,e1-g1": ["e8-g8"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6,b1-c3,f8-b4,d4-c6,b7-c6,f1-d3,d7-d5,e4-d5,c6-d5,e1-g1,e8-g8": ["c1-g5"]
          }
        },
        blumenfeld: {
          name: "Blumenfeld Scotch",
          moves: {
            "": ["e2-e4"],
            "e2-e4": ["e7-e5"],
            "e2-e4,e7-e5": ["g1-f3"],
            "e2-e4,e7-e5,g1-f3": ["b8-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6": ["d2-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4": ["e5-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4": ["f3-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4": ["f8-c5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5": ["c1-e3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3": ["d8-f6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6": ["d4-b5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,d4-b5": ["c5-e3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,d4-b5,c5-e3": ["f2-e3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,d4-b5,c5-e3,f2-e3": ["f6-h4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,d4-b5,c5-e3,f2-e3,f6-h4": ["g2-g3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,d4-b5,c5-e3,f2-e3,f6-h4,g2-g3": ["h4-d8"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,d4-b5,c5-e3,f2-e3,f6-h4,g2-g3,h4-d8": ["d1-g4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,d4-b5,c5-e3,f2-e3,f6-h4,g2-g3,h4-d8,d1-g4": ["g7-g6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,d4-b5,c5-e3,f2-e3,f6-h4,g2-g3,h4-d8,d1-g4,g7-g6": ["g4-f4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5,c1-e3,d8-f6,d4-b5,c5-e3,f2-e3,f6-h4,g2-g3,h4-d8,d1-g4,g7-g6,g4-f4": ["d7-d6"]
          }
        },
        steinitz: {
          name: "Steinitz Variation",
          moves: {
            "": ["e2-e4"],
            "e2-e4": ["e7-e5"],
            "e2-e4,e7-e5": ["g1-f3"],
            "e2-e4,e7-e5,g1-f3": ["b8-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6": ["d2-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4": ["e5-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4": ["f3-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4": ["d8-h4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,d8-h4": ["b1-c3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,d8-h4,b1-c3": ["f8-b4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,d8-h4,b1-c3,f8-b4": ["f1-e2"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,d8-h4,b1-c3,f8-b4,f1-e2": ["h4-e4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,d8-h4,b1-c3,f8-b4,f1-e2,h4-e4": ["d4-b5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,d8-h4,b1-c3,f8-b4,f1-e2,h4-e4,d4-b5": ["b4-c3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,d8-h4,b1-c3,f8-b4,f1-e2,h4-e4,d4-b5,b4-c3": ["b2-c3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,d8-h4,b1-c3,f8-b4,f1-e2,h4-e4,d4-b5,b4-c3,b2-c3": ["e8-d8"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,d8-h4,b1-c3,f8-b4,f1-e2,h4-e4,d4-b5,b4-c3,b2-c3,e8-d8": ["e1-g1"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,d8-h4,b1-c3,f8-b4,f1-e2,h4-e4,d4-b5,b4-c3,b2-c3,e8-d8,e1-g1": ["g8-f6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,d8-h4,b1-c3,f8-b4,f1-e2,h4-e4,d4-b5,b4-c3,b2-c3,e8-d8,e1-g1,g8-f6": ["f1-e1"]
          }
        }
      }
    },
    scotchGambit: {
      name: "Scotch Gambit",
      color: "white",
      variations: {
        mainLine: {
          name: "Main Line (Two Knights Defense)",
          moves: {
            "": ["e2-e4"],
            "e2-e4": ["e7-e5"],
            "e2-e4,e7-e5": ["g1-f3"],
            "e2-e4,e7-e5,g1-f3": ["b8-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6": ["d2-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4": ["e5-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4": ["f1-c4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4": ["g8-f6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6": ["e4-e5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e4-e5": ["d7-d5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e4-e5,d7-d5": ["c4-b5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e4-e5,d7-d5,c4-b5": ["f6-e4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e4-e5,d7-d5,c4-b5,f6-e4": ["f3-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e4-e5,d7-d5,c4-b5,f6-e4,f3-d4": ["c8-d7"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e4-e5,d7-d5,c4-b5,f6-e4,f3-d4,c8-d7": ["b5-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e4-e5,d7-d5,c4-b5,f6-e4,f3-d4,c8-d7,b5-c6": ["b7-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e4-e5,d7-d5,c4-b5,f6-e4,f3-d4,c8-d7,b5-c6,b7-c6": ["e1-g1"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e4-e5,d7-d5,c4-b5,f6-e4,f3-d4,c8-d7,b5-c6,b7-c6,e1-g1": ["f8-c5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e4-e5,d7-d5,c4-b5,f6-e4,f3-d4,c8-d7,b5-c6,b7-c6,e1-g1,f8-c5": ["f2-f3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e4-e5,d7-d5,c4-b5,f6-e4,f3-d4,c8-d7,b5-c6,b7-c6,e1-g1,f8-c5,f2-f3": ["e4-g5"]
          }
        },
        classical: {
          name: "Classical Variation",
          moves: {
            "": ["e2-e4"],
            "e2-e4": ["e7-e5"],
            "e2-e4,e7-e5": ["g1-f3"],
            "e2-e4,e7-e5,g1-f3": ["b8-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6": ["d2-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4": ["e5-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4": ["f1-c4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4": ["f8-c5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5": ["c2-c3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3": ["g8-f6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,g8-f6": ["c3-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,g8-f6,c3-d4": ["c5-b4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,g8-f6,c3-d4,c5-b4": ["c1-d2"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,g8-f6,c3-d4,c5-b4,c1-d2": ["b4-d2"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,g8-f6,c3-d4,c5-b4,c1-d2,b4-d2": ["b1-d2"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,g8-f6,c3-d4,c5-b4,c1-d2,b4-d2,b1-d2": ["d7-d5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,g8-f6,c3-d4,c5-b4,c1-d2,b4-d2,b1-d2,d7-d5": ["e4-d5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,g8-f6,c3-d4,c5-b4,c1-d2,b4-d2,b1-d2,d7-d5,e4-d5": ["f6-d5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,g8-f6,c3-d4,c5-b4,c1-d2,b4-d2,b1-d2,d7-d5,e4-d5,f6-d5": ["e1-g1"]
          }
        },
        haxoGambit: {
          name: "Haxo Gambit",
          moves: {
            "": ["e2-e4"],
            "e2-e4": ["e7-e5"],
            "e2-e4,e7-e5": ["g1-f3"],
            "e2-e4,e7-e5,g1-f3": ["b8-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6": ["d2-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4": ["e5-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4": ["f1-c4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4": ["f8-c5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5": ["c2-c3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3": ["d4-c3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,d4-c3": ["c4-f7"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,d4-c3,c4-f7": ["e8-f7"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,d4-c3,c4-f7,e8-f7": ["d1-d5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,d4-c3,c4-f7,e8-f7,d1-d5": ["e8-e8"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,d4-c3,c4-f7,e8-f7,d1-d5,e8-e8": ["d5-c5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,d4-c3,c4-f7,e8-f7,d1-d5,e8-e8,d5-c5": ["d7-d6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,d4-c3,c4-f7,e8-f7,d1-d5,e8-e8,d5-c5,d7-d6": ["c5-c3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,d4-c3,c4-f7,e8-f7,d1-d5,e8-e8,d5-c5,d7-d6,c5-c3": ["g8-f6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5,c2-c3,d4-c3,c4-f7,e8-f7,d1-d5,e8-e8,d5-c5,d7-d6,c5-c3,g8-f6": ["e1-g1"]
          }
        },
        maxLange: {
          name: "Max Lange Attack",
          moves: {
            "": ["e2-e4"],
            "e2-e4": ["e7-e5"],
            "e2-e4,e7-e5": ["g1-f3"],
            "e2-e4,e7-e5,g1-f3": ["b8-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6": ["d2-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4": ["e5-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4": ["f1-c4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4": ["g8-f6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6": ["e1-g1"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e1-g1": ["f6-e4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e1-g1,f6-e4": ["f1-e1"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e1-g1,f6-e4,f1-e1": ["d7-d5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e1-g1,f6-e4,f1-e1,d7-d5": ["c4-d5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e1-g1,f6-e4,f1-e1,d7-d5,c4-d5": ["d8-d5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e1-g1,f6-e4,f1-e1,d7-d5,c4-d5,d8-d5": ["b1-c3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e1-g1,f6-e4,f1-e1,d7-d5,c4-d5,d8-d5,b1-c3": ["d5-a5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e1-g1,f6-e4,f1-e1,d7-d5,c4-d5,d8-d5,b1-c3,d5-a5": ["c3-e4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e1-g1,f6-e4,f1-e1,d7-d5,c4-d5,d8-d5,b1-c3,d5-a5,c3-e4": ["c8-e6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6,e1-g1,f6-e4,f1-e1,d7-d5,c4-d5,d8-d5,b1-c3,d5-a5,c3-e4,c8-e6": ["e4-g5"]
          }
        },
        solidBe7: {
          name: "Solid 4...Be7",
          moves: {
            "": ["e2-e4"],
            "e2-e4": ["e7-e5"],
            "e2-e4,e7-e5": ["g1-f3"],
            "e2-e4,e7-e5,g1-f3": ["b8-c6"],
            "e2-e4,e7-e5,g1-f3,b8-c6": ["d2-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4": ["e5-d4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4": ["f1-c4"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4": ["f8-e7"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-e7": ["c2-c3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-e7,c2-c3": ["d7-d6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-e7,c2-c3,d7-d6": ["d1-b3"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-e7,c2-c3,d7-d6,d1-b3": ["g8-f6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-e7,c2-c3,d7-d6,d1-b3,g8-f6": ["c4-f7"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-e7,c2-c3,d7-d6,d1-b3,g8-f6,c4-f7": ["e8-f8"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-e7,c2-c3,d7-d6,d1-b3,g8-f6,c4-f7,e8-f8": ["f3-g5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-e7,c2-c3,d7-d6,d1-b3,g8-f6,c4-f7,e8-f8,f3-g5": ["c6-e5"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-e7,c2-c3,d7-d6,d1-b3,g8-f6,c4-f7,e8-f8,f3-g5,c6-e5": ["e1-g1"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-e7,c2-c3,d7-d6,d1-b3,g8-f6,c4-f7,e8-f8,f3-g5,c6-e5,e1-g1": ["h7-h6"],
            "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-e7,c2-c3,d7-d6,d1-b3,g8-f6,c4-f7,e8-f8,f3-g5,c6-e5,e1-g1,h7-h6": ["f2-f4"]
          }
        }
      }
    }
  };

  // SVG piece components - using inline SVG for consistent rendering
  const getPieceSVG = (piece) => {
    const isWhite = isPieceWhite(piece);
    const pieceType = piece.toLowerCase();

    const kingSVG = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="100%" height="100%">
        <path fill={isWhite ? "#f9f9f9" : "#101010"} d="m501.6 1811 48.4-354.4-260-269.2s-166.4-288.2 29.9-481C582.2 448.7 826 727.2 826 727.2l195.6-165.7 184 165.7s216.4-232.5 430.4-76c214 156.5 255.4 317.6 117.4 531.6-138.1 214-250.9 280.7-250.9 280.7L1558 1811z"/>
        <path fill={isWhite ? "#101010" : "#f9f9f9"} d="M977 298v-95h94v95h107v95h-107v153q-48-16-94 0V393H870v-95zm47 314q-47 0-136 121-31-36-50-55 93-140 186-140 92 0 186 140-20 19-50 55-90-121-136-121zm-447 907-26 156 145-84zm410-206q-1-147-36.5-274.5T870 845q-45-88-131.5-153T570 627q-103 0-208 93T257 949q0 109 86.5 236T546 1408q212-88 441-95zm37 530H448l61-365q-325-280-326-535-1-159 125-274.5T575 553q78 0 158.5 47T876 719q61 74 98.5 164.5T1024 1034q12-60 49-150.5t99-164.5q61-72 142-119t159-47q140 0 266 115.5T1865 943q-2 255-326 535l61 365zm0-74h489l-50-298q-216-84-439-84t-439 84l-50 298zm447-250 26 156-145-84zm-410-206q229 7 441 95 115-96 202-223t87-236q0-136-105.5-229T1478 627q-83 0-169.5 65T1178 845q-46 66-81.5 193.5T1061 1313zm-176 233 141-84 137 86-141 84z"/>
      </svg>
    );

    const queenSVG = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="100%" height="100%">
        <path fill={isWhite ? "#f9f9f9" : "#101010"} d="m508.5 1815.6 48.4-356.7-216.3-554.6-135.8-20.7-16.1-126.5 112.7-43.8 78.3 73.7-18.4 99 246.2 197.8 112.8-568.3L635 428l78.3-108 112.8 43.7-23 161 223.2 474 244-490-66.8-105.9 92-92 105.9 73.6L1337 534l103.5 529.2 260-161-16-142.7 131-46 57.6 131.1-207 103.6-175 529.2 48.4 308.4z"/>
        <path fill={isWhite ? "#101010" : "#f9f9f9"} d="M1024 1769h478q-53-130-43-280-100-39-213-67.5t-222-28.5q-110 0-223 28.5T589 1489q9 150-43 280zm0-450q111 0 223.5 26.5T1468 1413q17-105 60.5-212.5T1634 988l-220 155-123-601-267 555-267-555-123 601-220-155q61 105 104.5 212.5T580 1413q108-41 220.5-67.5T1024 1319zm0 524H441q114-231 57.5-456.5T296 937q-12 2-19 2-54 0-92.5-38.5T146 808t38.5-92.5T277 677t92.5 38.5T408 808q0 20-6 38-4 14-15 33l196 139 100-486q-64-31-72-103-5-44 29-91t88-53q54-5 96 29t48 88q7 68-46 114l198 412 198-412q-54-46-46-114 6-54 48-88t96-29q54 6 87.5 53t29.5 91q-9 72-72 103l100 486 196-139q-12-19-15-33-6-18-6-38 0-54 38.5-92.5T1771 677t92.5 38.5T1902 808t-38.5 92.5T1771 939q-7 0-19-2-147 224-203 449.5t58 456.5zM276 746q-62 0-62 62t62 62q63 0 63-62t-63-62zm466-394q-62 0-62 62t62 62 62-62-62-62zM590 1519l119 72-134 86q19-86 15-158zm1182-773q-63 0-63 62t63 62q62 0 62-62t-62-62zm-466-394q-62 0-62 62t62 62 62-62-62-62zm152 1167-119 72 134 86q-20-86-15-158zm-573 47 139-83 139 86-139 84z"/>
      </svg>
    );

    const rookSVG = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="100%" height="100%">
        <path fill={isWhite ? "#f9f9f9" : "#101010"} d="m435 1804 16-212 152-115 51-688-148-115-7-276 210-2 4 138 198 2 7-140 212-3 14 145 193-4 5-138h204l-7 285-145 106 42 693 172 124 19 207z"/>
        <path fill={isWhite ? "#101010" : "#f9f9f9"} d="M1024 1501H643l5-74h752l5 74zm0-661H692l5-74h654l5 74zm0 1003H383l29-264 159-118 50-659-149-107-17-341h289v147h137V354h286v147h137V354h289l-17 341-149 107 50 659 159 118 29 264zm0-74h557l-15-149-161-119-54-735 152-109 13-230h-138v148h-285V427H955v148H670V427H532l13 230 152 109-54 735-161 119-15 149z"/>
      </svg>
    );

    const bishopSVG = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="100%" height="100%">
        <path fill={isWhite ? "#f9f9f9" : "#101010"} d="m948 366 1-139 148-7 1 147zM564 860c114-267 456-443 456-443s392 176 476 502c-9 209-183 332-183 332l27 221-653 6 46-233s-230-171-169-385zm-101 790c175 6 355 23 425-142h92s0 190-88 246c-163 103-625 38-625 38s-15-146 196-142zm631 37-36-185 102 5s22 153 315 131c381-17 318 153 318 153l-483 5z"/>
        <path fill={isWhite ? "#101010" : "#f9f9f9"} d="M1024 356q66 0 64-66 1-55-64-55-66 0-64 55-3 66 64 66zm0 1204q0 114-101 199t-223 84H205q0-117 65-179t142-62h250q51 0 88-7t71-60l10-16h76q-7 21-3 13-45 105-109 125t-146 19H409q-52 0-86 40t-34 53h424q66 0 159-65t93-185H624q67-116 72-229-114-119-162-223t-6-224q33-96 118-189t312-247q-17-11-46-36t-29-79q0-58 41-96t100-38q58 0 100 38t41 96q0 54-29 79t-46 36q226 153 311 247t119 189q42 119-6 224t-162 223q4 113 72 229h-341q0 120 93 185t159 65h424q0-13-34-53t-86-40h-240q-83 0-146-19t-109-125q4 8-3-13h76l10 16q33 53 70 60t89 7h250q76 0 142 62t65 179h-495q-123 0-223-84t-101-199zm0-114h283q-28-84-29-154-120-41-254-38-135-3-254 38-2 70-29 154zm0-267q159-1 285 42 189-180 142-346-60-193-427-431-368 238-427 431-48 166 142 346 125-43 285-42zm-47-361V714h94v104h95v89h-95v165h-94V907h-95v-89z"/>
      </svg>
    );

    const knightSVG = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="100%" height="100%">
        <path fill={isWhite ? "#f9f9f9" : "#101010"} d="m352 861 787-569 94 148s336 103 398 388c63 286 51 974 51 974l-1088 9s-37-290 184-460c221-171 221-212 221-212s-226-71-295-16-117 138-117 138l-129-67 74-85-88-97-94 56z"/>
        <path fill={isWhite ? "#101010" : "#f9f9f9"} d="m1151 178-115 154c-74 50-147 98-220 144-73 45-112 81-116 107L304 846l12 297 122-86 51 50-115 82 217 121 56-102c37-68 135-88 292-60l-55 85c-25 37-63 60-115 71a608 608 0 0 0-183 238c-32 82-45 182-39 301h1242c-23-55-42-118-57-190-15-73-17-152-5-237 29-239 13-440-47-603-61-164-205-303-433-418l-96-217zm-17 145 59 133a664 664 0 0 1 262 188c55 72 100 150 134 234 27 97 40 181 41 253 0 71-3 140-9 205-7 65-11 131-13 199-2 67 9 145 32 234H621c-4-84 12-158 48-223s85-124 146-177c78-22 129-56 152-102s53-90 90-131c13-10 27-15 38-15 10-1 21 0 33-2 52-7 95-36 129-85 33-49 51-104 52-165l-19-67c-37 159-99 245-188 257l-45 6c-16 1-33 10-52 26-41-25-87-35-138-31-74 6-129 15-165 27l-108 73-39 45-47-28 78-65-138-144-64 41-4-125 366-241c15-34 58-74 131-120l208-131 49-69zM960 564c-6 0-12 2-18 7L826 671l212 2c23 0 17-21-16-63-24-31-44-46-62-46zM502 868l-33 4-33 56 57 26 46-55-37-31z"/>
      </svg>
    );

    const pawnSVG = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="100%" height="100%">
        <path fill={isWhite ? "#f9f9f9" : "#101010"} d="m734 981 196-193s-189-82-79-288c79-149 303-114 361 50 63 179-113 240-113 240l226 197Zm-235 799s-8-107 50-154c196-173 338-386 371-599l210 2c33 206 182 447 321 561 101 59 99 199 99 199z"/>
        <path fill={isWhite ? "#101010" : "#f9f9f9"} d="M520 1769h1008q8-97-132-182-132-101-196-239t-80-309H928q-15 170-79 309t-197 239q-141 85-132 182zm504 74H446v-74q-4-80 42-137t125-108q117-91 172-217t78-268H576l284-239q-86-74-86-188 0-103 73-177t177-74q103 0 177 74t73 177q0 114-86 188l284 239h-287q23 141 78 268t172 217q79 51 125 108t42 137v74zM756 974h536l-225-191q134-31 134-171 0-76-52-126t-125-51q-73 0-125 51t-52 126q0 140 134 171z"/>
      </svg>
    );

    // Return the appropriate SVG based on piece type
    switch (pieceType) {
      case 'k': return kingSVG;
      case 'q': return queenSVG;
      case 'r': return rookSVG;
      case 'b': return bishopSVG;
      case 'n': return knightSVG;
      case 'p': return pawnSVG;
      default: return kingSVG;
    }
  };

  // Helper function to get display coordinates (flipped for black)
  const getDisplayCoordinates = (row, col) => {
    if (trainingMode && openingDatabases[trainingMode]?.color === 'black') {
      // Flip the board when playing as black
      return [7 - row, 7 - col];
    }
    return [row, col];
  };

  // Helper functions
  const getSquareName = (row, col) => {
    return String.fromCharCode(97 + col) + (8 - row);
  };

  const parseSquareName = (square) => {
    const col = square.charCodeAt(0) - 97;
    const row = 8 - parseInt(square[1]);
    return [row, col];
  };

  const isPieceWhite = (piece) => piece && piece === piece.toUpperCase();

  const isValidMove = (fromRow, fromCol, toRow, toCol, piece) => {
    if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) return false;

    const targetPiece = board[toRow][toCol];
    if (targetPiece && isPieceWhite(piece) === isPieceWhite(targetPiece)) return false;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    const piece_type = piece.toLowerCase();

    switch (piece_type) {
      case 'p':
        const direction = isPieceWhite(piece) ? -1 : 1;
        const startRow = isPieceWhite(piece) ? 6 : 1;

        if (toCol === fromCol) {
          if (toRow === fromRow + direction && !targetPiece) return true;
          if (fromRow === startRow && toRow === fromRow + 2 * direction && !targetPiece) return true;
        } else if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction) {
          return !!targetPiece;
        }
        return false;

      case 'r':
        return (rowDiff === 0 || colDiff === 0) && !isPathBlocked(fromRow, fromCol, toRow, toCol);

      case 'n':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

      case 'b':
        return rowDiff === colDiff && !isPathBlocked(fromRow, fromCol, toRow, toCol);

      case 'q':
        return (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) && !isPathBlocked(fromRow, fromCol, toRow, toCol);

      case 'k':
        // Normal king moves
        if (rowDiff <= 1 && colDiff <= 1) return true;

        // Castling
        if (rowDiff === 0 && colDiff === 2) {
          return canCastle(fromRow, fromCol, toRow, toCol, piece);
        }
        return false;

      default:
        return false;
    }
  };

  const canCastle = (fromRow, fromCol, toRow, toCol, piece) => {
    // Basic castling validation
    const isWhite = isPieceWhite(piece);
    const kingRow = isWhite ? 7 : 0;
    const kingCol = 4;

    // King must be on starting square
    if (fromRow !== kingRow || fromCol !== kingCol) return false;

    // Determine if kingside or queenside castling
    const isKingside = toCol === 6;
    const isQueenside = toCol === 2;

    if (!isKingside && !isQueenside) return false;

    // Check if rook is in correct position
    const rookCol = isKingside ? 7 : 0;
    const rook = board[kingRow][rookCol];
    const expectedRook = isWhite ? 'R' : 'r';

    if (rook !== expectedRook) return false;

    // Check if squares between king and rook are empty
    const start = Math.min(kingCol, rookCol);
    const end = Math.max(kingCol, rookCol);

    for (let col = start + 1; col < end; col++) {
      if (board[kingRow][col] !== null) return false;
    }

    // In a real game, we'd also check:
    // - King hasn't moved (castling rights)
    // - Rook hasn't moved (castling rights)
    // - King not in check
    // - King doesn't pass through check
    // - King doesn't end up in check
    // For training purposes, we'll allow castling if basic conditions are met

    return true;
  };

  const isPathBlocked = (fromRow, fromCol, toRow, toCol) => {
    const rowDir = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colDir = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

    let currentRow = fromRow + rowDir;
    let currentCol = fromCol + colDir;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol]) return true;
      currentRow += rowDir;
      currentCol += colDir;
    }

    return false;
  };

  const makeMove = (fromRow, fromCol, toRow, toCol) => {
    console.log('makeMove called - clearing highlights first');

    // Force clear any existing highlights immediately
    setLastMove(null);
    setSelectedSquare(null);

    const newBoard = board.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];

    console.log(`Making move: ${getSquareName(fromRow, fromCol)}-${getSquareName(toRow, toCol)} (${piece})`);

    // Handle castling
    if (piece && piece.toLowerCase() === 'k' && Math.abs(toCol - fromCol) === 2) {
      // This is a castling move
      const isKingside = toCol === 6;
      const rookFromCol = isKingside ? 7 : 0;
      const rookToCol = isKingside ? 5 : 3;

      // Move the rook
      newBoard[toRow][rookToCol] = newBoard[fromRow][rookFromCol];
      newBoard[fromRow][rookFromCol] = null;
    }

    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;

    const moveNotation = `${getSquareName(fromRow, fromCol)}-${getSquareName(toRow, toCol)}`;
    const updatedMoveHistory = [...moveHistory, moveNotation];

    // Update all state together
    setBoard(newBoard);
    setMoveHistory(updatedMoveHistory);
    setCurrentPlayer(prevPlayer => prevPlayer === 'white' ? 'black' : 'white');

    // Set the last move highlighting cleanly
    setLastMoveHighlight(fromRow, fromCol, toRow, toCol);

    console.log('Updated move history:', updatedMoveHistory);

    return { moveNotation, updatedMoveHistory };
  };

  const makeOpponentMove = (currentMoveHistory) => {
    console.log('makeOpponentMove called');
    console.log('Current moveHistory when making opponent move:', currentMoveHistory);

    const opening = openingDatabases[trainingMode];
    const variation = opening.variations[selectedVariation];
    const nextMoveKey = currentMoveHistory.join(',');
    const opponentMoves = variation.moves[nextMoveKey];

    console.log('Looking for opponent move with key:', `"${nextMoveKey}"`);
    console.log('Available moves for this key:', opponentMoves);

    if (opponentMoves && opponentMoves.length > 0) {
      // Wait a bit to simulate thinking time
      addTimeout(() => {
        console.log('makeOpponentMove - clearing highlights first');

        // Force clear any existing highlights immediately
        setLastMove(null);
        setSelectedSquare(null);

        const opponentMove = opponentMoves[Math.floor(Math.random() * opponentMoves.length)];
        console.log('Selected opponent move:', opponentMove);
        const [fromSquare, toSquare] = opponentMove.split('-');
        const [fromRow, fromCol] = parseSquareName(fromSquare);
        const [toRow, toCol] = parseSquareName(toSquare);

        console.log(`Opponent moving from ${fromSquare} to ${toSquare}`);

        // Make the opponent move with a single state update
        setBoard(currentBoard => {
          const newBoard = currentBoard.map(row => [...row]);
          const piece = newBoard[fromRow][fromCol];

          console.log(`Making opponent move: ${getSquareName(fromRow, fromCol)}-${getSquareName(toRow, toCol)} (${piece})`);

          // Handle castling for opponent
          if (piece && piece.toLowerCase() === 'k' && Math.abs(toCol - fromCol) === 2) {
            const isKingside = toCol === 6;
            const rookFromCol = isKingside ? 7 : 0;
            const rookToCol = isKingside ? 5 : 3;

            // Move the rook
            newBoard[toRow][rookToCol] = newBoard[fromRow][rookFromCol];
            newBoard[fromRow][rookFromCol] = null;
          }

          newBoard[toRow][toCol] = piece;
          newBoard[fromRow][fromCol] = null;

          return newBoard;
        });

        const moveNotation = `${getSquareName(fromRow, fromCol)}-${getSquareName(toRow, toCol)}`;

        setMoveHistory(prevHistory => {
          const updatedHistory = [...prevHistory, moveNotation];
          console.log('Updated move history after opponent move:', updatedHistory);
          return updatedHistory;
        });

        setCurrentPlayer(prevPlayer => prevPlayer === 'white' ? 'black' : 'white');
        setFeedback('Your turn!');

        // Set the last move highlighting cleanly
        setLastMoveHighlight(fromRow, fromCol, toRow, toCol);

      }, 800);
    } else {
      console.log('No opponent moves found for key:', `"${nextMoveKey}"`);
      setFeedback('End of opening line - great job!');
    }
  };

  const undoLastMove = () => {
    if (undoStack.length === 0) return;

    const lastState = undoStack[undoStack.length - 1];

    // Clear timeouts to prevent conflicts
    clearAllTimeouts();

    // Restore the previous state
    setBoard(lastState.board);
    setMoveHistory(lastState.moveHistory);
    setCurrentPlayer(lastState.currentPlayer);
    setScore(lastState.score);
    setShowHint(lastState.showHint);
    setNeedsReplay(lastState.needsReplay);
    setMoveCounter(lastState.moveCounter || 0);

    // Handle lastMove restoration - if we're going back to the beginning, clear it
    if (lastState.moveHistory.length === 0) {
      setLastMove(null);
    } else {
      setLastMove(lastState.lastMove);
    }

    // Remove the last state from history
    setUndoStack(prevStack => prevStack.slice(0, -1));

    setFeedback('Move undone. Try again!');
    setSelectedSquare(null);
    setDraggedPiece(null);

    // Clear any lingering highlights
    clearHighlights();

    // Clear feedback after a moment
    addTimeout(() => {
      setFeedback('');
    }, 2000);
  };

  const checkMove = (userMove, currentMoveHistory) => {
    const opening = openingDatabases[trainingMode];
    const variation = opening.variations[selectedVariation];
    // Use the moveHistory that was passed in, excluding the user's move we just made
    const moveKey = currentMoveHistory.slice(0, -1).join(',');
    const expectedMoves = variation.moves[moveKey] || [];

    console.log('Checking user move:', userMove);
    console.log('Current move history:', currentMoveHistory);
    console.log('Move key for lookup:', `"${moveKey}"`);
    console.log('Expected moves:', expectedMoves);
    console.log('Available keys in database:', Object.keys(variation.moves));
    console.log('Move is correct?', expectedMoves.includes(userMove));

    // Clear any existing hints
    setShowHint(null);
    setNeedsReplay(false);

    if (expectedMoves.includes(userMove)) {
      setFeedback('✓ Correct move!');
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));

      console.log('Move was correct, calling makeOpponentMove...');

      // Wait for move to be processed, then make opponent move
      addTimeout(() => {
        setFeedback('Opponent is thinking...');
        // Wait a bit more for React state to update, then pass the current move history
        addTimeout(() => {
          makeOpponentMove(currentMoveHistory);
        }, 300);
      }, 500);
    } else {
      console.log('Move was incorrect, NOT calling makeOpponentMove');

      // Save state for undo ONLY when user makes wrong move
      setUndoStack(prevStack => [...prevStack, {
        board: board.map(row => [...row]),
        moveHistory: [...moveHistory],
        currentPlayer,
        score: { ...score },
        showHint: null,
        needsReplay: false,
        lastMove: lastMove ? { ...lastMove } : null,
        moveCounter: moveCounter
      }]);

      // Better error handling for empty expected moves
      const expectedMovesText = expectedMoves.length > 0 ? expectedMoves.join(' or ') : 'No valid moves found';
      setFeedback(`✗ Wrong move! Expected: ${expectedMovesText}. Click "Undo" to try again.`);
      setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
      setNeedsReplay(true);

      // Show hint arrow for the best move only if we have expected moves
      if (expectedMoves.length > 0) {
        const bestMove = expectedMoves[0];
        console.log('Processing hint for move:', bestMove);

        try {
          // More robust move parsing
          if (!bestMove || typeof bestMove !== 'string' || !bestMove.includes('-')) {
            throw new Error(`Invalid move format: ${bestMove}`);
          }

          const [fromSquare, toSquare] = bestMove.split('-');

          if (!fromSquare || !toSquare || fromSquare.length !== 2 || toSquare.length !== 2) {
            throw new Error(`Invalid square format: ${fromSquare} to ${toSquare}`);
          }

          console.log('Parsing squares:', fromSquare, 'to', toSquare);

          const [fromRow, fromCol] = parseSquareName(fromSquare);
          const [toRow, toCol] = parseSquareName(toSquare);

          console.log('Parsed coordinates:', {fromRow, fromCol, toRow, toCol});

          // Validate coordinates
          if (fromRow < 0 || fromRow >= 8 || fromCol < 0 || fromCol >= 8 ||
              toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) {
            throw new Error(`Invalid coordinates: (${fromRow},${fromCol}) to (${toRow},${toCol})`);
          }

          // Convert to display coordinates
          const [fromDisplayRow, fromDisplayCol] = getDisplayCoordinates(fromRow, fromCol);
          const [toDisplayRow, toDisplayCol] = getDisplayCoordinates(toRow, toCol);

          console.log('Display coordinates:', {fromDisplayRow, fromDisplayCol, toDisplayRow, toDisplayCol});

          setShowHint({
            from: { row: fromDisplayRow, col: fromDisplayCol },
            to: { row: toDisplayRow, col: toDisplayCol },
            notation: bestMove
          });

          console.log('Successfully set hint arrow:', {
            from: { row: fromDisplayRow, col: fromDisplayCol },
            to: { row: toDisplayRow, col: toDisplayCol },
            notation: bestMove
          });
        } catch (error) {
          console.error('Error parsing move for hint:', bestMove, error);
          console.error('Error details:', error.message);
          console.error('Move key was:', moveKey);
          console.error('Expected moves were:', expectedMoves);
          // Don't show hint if parsing fails, but don't crash the app
        }
      } else {
        console.log('No expected moves found - cannot show hint arrow');
      }

      // Clear feedback after longer delay to give user time to see the hint
      addTimeout(() => {
        setFeedback('');
        setShowHint(null);
        setNeedsReplay(false);
      }, 5000);
    }
  };

  // Helper function to clear all highlights
  const clearHighlights = () => {
    console.log('Clearing all highlights');
    setSelectedSquare(null);
    setDraggedPiece(null);
    setShowHint(null);

    // Force clear lastMove with functional update
    setLastMove(prevLastMove => {
      console.log('Force clearing lastMove:', prevLastMove);
      return null;
    });
  };

  // Helper function to set last move with explicit clearing
  const setLastMoveHighlight = (fromRow, fromCol, toRow, toCol) => {
    console.log('Setting last move highlight:', { fromRow, fromCol, toRow, toCol });

    // Increment move counter for uniqueness
    const newMoveId = moveCounter + 1;
    setMoveCounter(newMoveId);

    // Force clear with immediate null set
    setLastMove(null);

    // Use requestAnimationFrame to ensure the clear happens before the new set
    requestAnimationFrame(() => {
      console.log(`Setting lastMove with ID ${newMoveId}`);
      setLastMove({
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        id: newMoveId
      });
    });
  };

  const handleMouseDown = (e, displayRow, displayCol) => {
    if (gameMode !== 'training') return;

    // Convert display coordinates to actual board coordinates
    let row, col;
    if (trainingMode && openingDatabases[trainingMode]?.color === 'black') {
      row = 7 - displayRow;
      col = 7 - displayCol;
    } else {
      row = displayRow;
      col = displayCol;
    }

    const opening = openingDatabases[trainingMode];
    const piece = board[row][col];

    // Check if it's the user's turn and they're clicking their piece
    const isUserTurn = (opening.color === 'white' && currentPlayer === 'white') ||
                       (opening.color === 'black' && currentPlayer === 'black');

    if (!isUserTurn || !piece || isPieceWhite(piece) !== (currentPlayer === 'white')) {
      return;
    }

    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

    setDraggedPiece({
      piece,
      fromRow: row,
      fromCol: col,
      displayRow,
      displayCol
    });
    setDragOffset({
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2
    });
    setSelectedSquare([row, col]);
  };

  const handleTouchStart = (e, displayRow, displayCol) => {
    e.preventDefault(); // Prevent scrolling
    handleMouseDown(e, displayRow, displayCol);
  };

  const handleMouseMove = (e) => {
    if (!draggedPiece) return;
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (!draggedPiece) return;
    e.preventDefault(); // Prevent scrolling
    handleMouseMove(e);
  };

  const handleMouseUp = (e, targetDisplayRow, targetDisplayCol) => {
    if (!draggedPiece) return;
    e.preventDefault();

    // Convert target display coordinates to actual board coordinates
    let targetRow, targetCol;
    if (trainingMode && openingDatabases[trainingMode]?.color === 'black') {
      targetRow = 7 - targetDisplayRow;
      targetCol = 7 - targetDisplayCol;
    } else {
      targetRow = targetDisplayRow;
      targetCol = targetDisplayCol;
    }

    const { fromRow, fromCol } = draggedPiece;

    if (isValidMove(fromRow, fromCol, targetRow, targetCol, draggedPiece.piece)) {
      const { moveNotation, updatedMoveHistory } = makeMove(fromRow, fromCol, targetRow, targetCol);
      checkMove(moveNotation, updatedMoveHistory);
    }

    setDraggedPiece(null);
    setSelectedSquare(null);
  };

  const handleTouchEnd = (e, targetDisplayRow, targetDisplayCol) => {
    if (!draggedPiece) return;
    e.preventDefault();

    // For touch, we need to find what element we're over
    if (e.changedTouches && e.changedTouches[0]) {
      const touch = e.changedTouches[0];
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);

      // Find the chess square element
      let targetElement = elementBelow;
      while (targetElement && !targetElement.dataset?.square) {
        targetElement = targetElement.parentElement;
      }

      if (targetElement && targetElement.dataset?.square) {
        const [touchRow, touchCol] = targetElement.dataset.square.split(',').map(Number);
        handleMouseUp(e, touchRow, touchCol);
        return;
      }
    }

    // Fallback to provided coordinates
    handleMouseUp(e, targetDisplayRow, targetDisplayCol);
  };

  const handleSquareClick = (displayRow, displayCol) => {
    if (draggedPiece) return; // Ignore clicks during drag

    if (gameMode !== 'training') return;

    // Convert display coordinates to actual board coordinates
    let row, col;
    if (trainingMode && openingDatabases[trainingMode]?.color === 'black') {
      row = 7 - displayRow;
      col = 7 - displayCol;
    } else {
      row = displayRow;
      col = displayCol;
    }

    const opening = openingDatabases[trainingMode];
    const piece = board[row][col];

    // Check if it's the user's turn
    const isUserTurn = (opening.color === 'white' && currentPlayer === 'white') ||
                       (opening.color === 'black' && currentPlayer === 'black');

    if (!isUserTurn) {
      setFeedback('Wait for opponent to move...');
      addTimeout(() => setFeedback(''), 1000);
      return;
    }

    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      const fromPiece = board[fromRow][fromCol];

      if (row === fromRow && col === fromCol) {
        // Clicking the same square - deselect
        setSelectedSquare(null);
        return;
      }

      if (isValidMove(fromRow, fromCol, row, col, fromPiece)) {
        const { moveNotation, updatedMoveHistory } = makeMove(fromRow, fromCol, row, col);
        checkMove(moveNotation, updatedMoveHistory);
        setSelectedSquare(null);
      } else {
        // Invalid move - select new piece if it's user's piece
        if (piece && isPieceWhite(piece) === (currentPlayer === 'white')) {
          setSelectedSquare([row, col]);
        } else {
          setSelectedSquare(null);
        }
      }
    } else {
      // No piece selected - select if it's user's piece
      if (piece && isPieceWhite(piece) === (currentPlayer === 'white')) {
        setSelectedSquare([row, col]);
      }
    }
  };

  const startTraining = (mode, variationKey = null) => {
    console.log('Starting training for mode:', mode, 'variation:', variationKey);

    // If no variation specified, go to variation selection
    if (!variationKey) {
      setTrainingMode(mode);
      setGameMode('variationSelection');
      return;
    }

    // Clear any existing timeouts
    clearAllTimeouts();

    const freshBoard = getInitialBoard();
    console.log('Starting with fresh board:', freshBoard);

    // Reset all state immediately
    setTrainingMode(mode);
    setSelectedVariation(variationKey);
    setGameMode('training');
    setBoard(freshBoard);
    setMoveHistory([]);
    setLastMove(null);
    setMoveCounter(0);
    setSelectedSquare(null);
    setFeedback('');
    setScore({ correct: 0, total: 0 });
    setDraggedPiece(null);
    setShowHint(null);
    setNeedsReplay(false);
    setUndoStack([]);

    // Clear any lingering highlights
    clearHighlights();

    // Set the correct starting player based on opening
    const opening = openingDatabases[mode];
    const variation = opening.variations[variationKey];

    if (opening.color === 'black') {
      // If training as black, white moves first
      console.log('Training as black - white will move first');
      setCurrentPlayer('white');
      setFeedback('White is making the first move...');

      // Make the first white move automatically after a short delay
      addTimeout(() => {
        console.log('Making automatic first white move');
        const firstMove = variation.moves[""][0]; // Should be "e2-e4"
        console.log('First move from database:', firstMove);

        if (firstMove) {
          const [fromSquare, toSquare] = firstMove.split('-');
          const [fromRow, fromCol] = parseSquareName(fromSquare);
          const [toRow, toCol] = parseSquareName(toSquare);

          console.log(`Making first move: ${fromSquare} to ${toSquare}`);

          // Track the first move for highlighting
          setLastMoveHighlight(fromRow, fromCol, toRow, toCol);

          // Make the move directly to avoid state timing issues
          setBoard(currentBoard => {
            const newBoard = currentBoard.map(row => [...row]);
            const piece = newBoard[fromRow][fromCol];

            // Handle castling for first move (unlikely but just in case)
            if (piece && piece.toLowerCase() === 'k' && Math.abs(toCol - fromCol) === 2) {
              const isKingside = toCol === 6;
              const rookFromCol = isKingside ? 7 : 0;
              const rookToCol = isKingside ? 5 : 3;

              newBoard[toRow][rookToCol] = newBoard[fromRow][rookFromCol];
              newBoard[fromRow][rookFromCol] = null;
            }

            newBoard[toRow][toCol] = piece;
            newBoard[fromRow][fromCol] = null;
            return newBoard;
          });

          setMoveHistory([`${fromSquare}-${toSquare}`]);
          setCurrentPlayer('black');
          setFeedback('Your turn! Play 1...c5 for the Sicilian Defense.');
        }
      }, 1000);
    } else {
      // If training as white, user moves first
      console.log('Training as white - you move first');
      setCurrentPlayer('white');
      setFeedback('Your turn! Make your opening move.');
    }
  };

  const resetGame = () => {
    console.log('Resetting game');

    // Clear all pending timeouts first
    clearAllTimeouts();

    // Force immediate state reset with fresh board
    const freshBoard = getInitialBoard();
    console.log('Resetting board to:', freshBoard);

    // Reset all state at once
    setBoard(freshBoard);
    setMoveHistory([]);
    setLastMove(null);
    setMoveCounter(0);
    setSelectedSquare(null);
    setFeedback('');
    setDraggedPiece(null);
    setShowHint(null);
    setNeedsReplay(false);
    setUndoStack([]);
    setScore({ correct: 0, total: 0 });

    // Clear any lingering highlights
    clearHighlights();

    // Restart the training mode
    const opening = openingDatabases[trainingMode];
    const variation = opening.variations[selectedVariation];

    if (opening.color === 'black') {
      setCurrentPlayer('white');
      setFeedback('White is making the first move...');

      // Make the first white move automatically after reset
      addTimeout(() => {
        const firstMove = variation.moves[""][0]; // Should be "e2-e4"

        if (firstMove) {
          const [fromSquare, toSquare] = firstMove.split('-');
          const [fromRow, fromCol] = parseSquareName(fromSquare);
          const [toRow, toCol] = parseSquareName(toSquare);

          console.log(`Reset: Making first move ${fromSquare} to ${toSquare}`);

          // Track the first move for highlighting
          setLastMoveHighlight(fromRow, fromCol, toRow, toCol);

          // Make the move directly without using makeMove to avoid moveHistory issues
          setBoard(currentBoard => {
            const newBoard = currentBoard.map(row => [...row]);
            const piece = newBoard[fromRow][fromCol];

            // Handle castling for first move (unlikely but just in case)
            if (piece && piece.toLowerCase() === 'k' && Math.abs(toCol - fromCol) === 2) {
              const isKingside = toCol === 6;
              const rookFromCol = isKingside ? 7 : 0;
              const rookToCol = isKingside ? 5 : 3;

              newBoard[toRow][rookToCol] = newBoard[fromRow][rookFromCol];
              newBoard[fromRow][rookFromCol] = null;
            }

            newBoard[toRow][toCol] = piece;
            newBoard[fromRow][fromCol] = null;
            return newBoard;
          });

          setMoveHistory([`${fromSquare}-${toSquare}`]);
          setCurrentPlayer('black');
          setFeedback('Your turn! Play 1...c5 for the Sicilian Defense.');
        }
      }, 1000);
    } else {
      setCurrentPlayer('white');
      setFeedback('Your turn! Make your opening move.');
    }
  };

  const backToMenu = () => {
    clearAllTimeouts();
    setGameMode('menu');
    setTrainingMode(null);
    setSelectedVariation(null);
    setBoard(getInitialBoard()); // Reset board when going back to menu
    setMoveHistory([]);
    setLastMove(null);
    setMoveCounter(0);
    setScore({ correct: 0, total: 0 });
    setUndoStack([]);

    // Clear any lingering highlights
    clearHighlights();
  };

  // Handle global mouse events for drag and drop
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (draggedPiece) {
        const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
        const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
        setDragOffset({
          x: clientX,
          y: clientY
        });
      }
    };

    const handleGlobalTouchMove = (e) => {
      if (draggedPiece && e.touches && e.touches[0]) {
        e.preventDefault(); // Prevent scrolling while dragging
        setDragOffset({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        });
      }
    };

    const handleGlobalMouseUp = () => {
      if (draggedPiece) {
        setDraggedPiece(null);
        setSelectedSquare(null);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (draggedPiece) {
        setDraggedPiece(null);
        setSelectedSquare(null);
      }
    };

    // Mouse events
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    // Touch events
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [draggedPiece]);

  // Clear highlights when game mode changes
  useEffect(() => {
    if (gameMode !== 'training') {
      clearHighlights();
      setLastMove(null);
    }
  }, [gameMode]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef7cd 0%, #fed7aa 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    },
    wrapper: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '2.5rem',
      color: '#92400e',
      marginBottom: '10px',
      fontWeight: 'bold'
    },
    subtitle: {
      color: '#a16207',
      fontSize: '1.1rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      marginBottom: '40px'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      transition: 'transform 0.2s'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
      fontSize: '1.5rem',
      fontWeight: '600'
    },
    cardText: {
      color: '#6b7280',
      marginBottom: '20px',
      lineHeight: '1.6'
    },
    button: {
      width: '100%',
      padding: '12px 20px',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      color: 'white'
    },
    gameHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      flexWrap: 'wrap',
      gap: '20px'
    },
    navButton: {
      display: 'flex',
      alignItems: 'center',
      background: 'none',
      border: 'none',
      color: '#a16207',
      fontSize: '1rem',
      cursor: 'pointer'
    },
    gameTitle: {
      textAlign: 'center'
    },
    gameLayout: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '30px',
      flexWrap: 'wrap'
    },
    boardContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px'
    },
    boardWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative'
    },
    coordinatesContainer: {
      display: 'grid',
      gridTemplateColumns: '30px repeat(8, 1fr) 30px',
      gridTemplateRows: '30px repeat(8, 1fr) 30px',
      width: isMobile ? '410px' : '560px',
      height: isMobile ? '410px' : '560px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#8B4513'
    },
    board: {
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 1fr)',
      gridTemplateRows: 'repeat(8, 1fr)',
      width: isMobile ? '350px' : '500px',
      height: isMobile ? '350px' : '500px',
      border: '3px solid #8B4513',
      borderRadius: '4px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      gridColumn: '2 / 10',
      gridRow: '2 / 10',
      position: 'relative'
    },
    square: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '2.8rem' : '3.8rem',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease, border 0.15s ease',
      userSelect: 'none',
      fontWeight: 'bold',
      width: '100%',
      height: '100%',
      minWidth: 0,
      minHeight: 0,
      boxSizing: 'border-box'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      width: isMobile ? '100%' : '350px',
      maxWidth: '500px'
    },
    infoCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    infoTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      marginBottom: '15px',
      color: '#374151'
    }
  };

  if (gameMode === 'variationSelection') {
    const opening = openingDatabases[trainingMode];
    const variations = Object.keys(opening.variations);

    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.gameHeader}>
            <button style={styles.navButton} onClick={backToMenu}>
              <ChevronLeft size={20} style={{marginRight: '5px'}} />
              Back to Menu
            </button>

            <div style={styles.gameTitle}>
              <h2 style={{fontSize: '2rem', color: '#92400e', marginBottom: '5px'}}>
                {opening.name}
              </h2>
              <p style={{color: '#a16207'}}>Choose a variation to practice</p>
            </div>

            <div></div>
          </div>

          <div style={styles.grid}>
            {variations.map((variationKey) => {
              const variation = opening.variations[variationKey];
              return (
                <div key={variationKey} style={styles.card} onClick={() => startTraining(trainingMode, variationKey)}>
                  <div style={{...styles.cardHeader, color: opening.color === 'black' ? '#dc2626' : '#2563eb'}}>
                    <Target size={24} />
                    <h3 style={{marginLeft: '10px', fontSize: '1.2rem'}}>{variation.name}</h3>
                  </div>
                  <p style={styles.cardText}>
                    Practice this specific variation of the {opening.name}. Learn the key moves and typical responses.
                  </p>
                  <button style={{...styles.button, backgroundColor: opening.color === 'black' ? '#dc2626' : '#2563eb'}}>
                    Practice This Line
                  </button>
                </div>
              );
            })}

            {/* Random variation option */}
            <div style={styles.card} onClick={() => {
              const randomVariation = variations[Math.floor(Math.random() * variations.length)];
              startTraining(trainingMode, randomVariation);
            }}>
              <div style={{...styles.cardHeader, color: '#16a34a'}}>
                <Play size={24} />
                <h3 style={{marginLeft: '10px', fontSize: '1.2rem'}}>Random Variation</h3>
              </div>
              <p style={styles.cardText}>
                Practice a random variation from this opening. Perfect for testing your overall knowledge of the opening.
              </p>
              <button style={{...styles.button, backgroundColor: '#16a34a'}}>
                Random Practice
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'menu') {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.header}>
            <h1 style={styles.title}>Chess Opening Trainer</h1>
            <p style={styles.subtitle}>Master your favorite openings against AI opposition</p>
          </div>

          <div style={styles.grid}>
            <div style={styles.card} onClick={() => startTraining('sicilianDragon')}>
              <div style={{...styles.cardHeader, color: '#dc2626'}}>
                <Target size={24} />
                <h2 style={{marginLeft: '10px'}}>Sicilian Dragon</h2>
              </div>
              <p style={styles.cardText}>Practice the Accelerated Dragon as Black. Choose from 5 different variations or practice randomly!</p>
              <button style={{...styles.button, backgroundColor: '#dc2626'}}>
                Choose Variation
              </button>
            </div>

            <div style={styles.card} onClick={() => startTraining('scotchGame')}>
              <div style={{...styles.cardHeader, color: '#2563eb'}}>
                <BookOpen size={24} />
                <h2 style={{marginLeft: '10px'}}>Scotch Game</h2>
              </div>
              <p style={styles.cardText}>Learn the Scotch Game as White. Choose from 5 different variations including the Classical and Schmidt lines!</p>
              <button style={{...styles.button, backgroundColor: '#2563eb'}}>
                Choose Variation
              </button>
            </div>

            <div style={styles.card} onClick={() => startTraining('scotchGambit')}>
              <div style={{...styles.cardHeader, color: '#16a34a'}}>
                <Play size={24} />
                <h2 style={{marginLeft: '10px'}}>Scotch Gambit</h2>
              </div>
              <p style={styles.cardText}>Master the Scotch Gambit as White. Choose from 5 different variations including the Max Lange Attack!</p>
              <button style={{...styles.button, backgroundColor: '#16a34a'}}>
                Choose Variation
              </button>
            </div>
          </div>

          <div style={{background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'}}>
            <h3 style={{fontSize: '1.5rem', marginBottom: '20px', color: '#374151'}}>How it works</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
              <div>
                <h4 style={{fontWeight: '600', marginBottom: '10px', color: '#374151'}}>🎯 Choose Your Variation</h4>
                <p style={{color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5'}}>Each opening has 5 different variations to practice. Pick a specific line or practice randomly!</p>
              </div>
              <div>
                <h4 style={{fontWeight: '600', marginBottom: '10px', color: '#374151'}}>🤖 Smart AI Responses</h4>
                <p style={{color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5'}}>AI plays realistic variations from grandmaster games. Learn to handle different responses.</p>
              </div>
              <div>
                <h4 style={{fontWeight: '600', marginBottom: '10px', color: '#374151'}}>📈 Immediate Feedback</h4>
                <p style={{color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5'}}>Get instant feedback on your moves. Make a mistake? Just click "Undo" to try again!</p>
              </div>
            </div>
            <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9'}}>
              <p style={{color: '#0c4a6e', fontSize: '0.9rem', textAlign: 'center'}}>
                <strong>💡 Tip:</strong> Each opening now includes multiple variations like the Classical, Schmidt, and Steinitz lines. Master them all or focus on your favorites!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const opening = openingDatabases[trainingMode];
  const variation = opening.variations[selectedVariation];

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.gameHeader}>
          <button style={styles.navButton} onClick={backToMenu}>
            <ChevronLeft size={20} style={{marginRight: '5px'}} />
            Back to Menu
          </button>

          <div style={styles.gameTitle}>
            <h2 style={{fontSize: '2rem', color: '#92400e', marginBottom: '5px'}}>
              {opening.name}
            </h2>
            <p style={{color: '#a16207', fontSize: '1rem', fontWeight: '600'}}>
              {variation.name}
            </p>
            <p style={{color: '#a16207', fontSize: '0.9rem'}}>Playing as {opening.color}</p>
          </div>

          <div style={{display: 'flex', gap: '15px'}}>
            <button
              style={{
                ...styles.navButton,
                opacity: undoStack.length > 0 ? 1 : 0.5,
                cursor: undoStack.length > 0 ? 'pointer' : 'not-allowed'
              }}
              onClick={undoStack.length > 0 ? undoLastMove : undefined}
              disabled={undoStack.length === 0}
            >
              <Undo2 size={20} style={{marginRight: '5px'}} />
              Undo
            </button>

            <button style={styles.navButton} onClick={resetGame}>
              <RotateCcw size={20} style={{marginRight: '5px'}} />
              Reset
            </button>
          </div>
        </div>

        <div style={styles.gameLayout}>
          <div style={styles.boardContainer}>
            <div style={styles.boardWrapper}>
              {/* Board orientation indicator */}
              {trainingMode && (
                <div style={{
                  marginBottom: '10px',
                  textAlign: 'center',
                  color: needsReplay ? '#dc2626' : '#a16207',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  padding: needsReplay ? '8px 16px' : '0',
                  backgroundColor: needsReplay ? '#fef2f2' : 'transparent',
                  borderRadius: needsReplay ? '8px' : '0',
                  border: needsReplay ? '2px solid #dc2626' : 'none'
                }}>
                  {needsReplay ? '⚠️ Wrong move! Follow the yellow arrow to make the correct move.' :
                   (openingDatabases[trainingMode].color === 'black'
                    ? '♟ Playing as Black (Black pieces at bottom)'
                    : '♙ Playing as White (White pieces at bottom)'
                  )}
                </div>
              )}

              {/* Board with coordinates */}
              <div style={styles.coordinatesContainer}>
                {/* Top file letters */}
                {Array.from({length: 8}, (_, i) => {
                  const file = trainingMode && openingDatabases[trainingMode]?.color === 'black'
                    ? String.fromCharCode(104 - i) // h,g,f,e,d,c,b,a
                    : String.fromCharCode(97 + i);  // a,b,c,d,e,f,g,h
                  return (
                    <div key={`top-${i}`} style={{
                      gridColumn: i + 2,
                      gridRow: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {file}
                    </div>
                  );
                })}

                {/* Left rank numbers */}
                {Array.from({length: 8}, (_, i) => {
                  const rank = trainingMode && openingDatabases[trainingMode]?.color === 'black' ? i + 1 : 8 - i;
                  return (
                    <div key={`left-${i}`} style={{
                      gridColumn: 1,
                      gridRow: i + 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {rank}
                    </div>
                  );
                })}

                {/* The chess board */}
                <div style={styles.board} onMouseMove={handleMouseMove} onTouchMove={handleTouchMove}>
                  {board.flatMap((row, rowIndex) =>
                    row.map((piece, colIndex) => {
                      // Get display coordinates (potentially flipped)
                      const [displayRow, displayCol] = getDisplayCoordinates(rowIndex, colIndex);
                      const isLightSquare = (displayRow + displayCol) % 2 === 0;
                      const isSelected = selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex;
                      const isDragging = draggedPiece && draggedPiece.fromRow === rowIndex && draggedPiece.fromCol === colIndex;

                      // Check if this square is part of the last move (using actual board coordinates)
                      const isLastMoveFrom = lastMove && lastMove.from.row === rowIndex && lastMove.from.col === colIndex;
                      const isLastMoveTo = lastMove && lastMove.to.row === rowIndex && lastMove.to.col === colIndex;
                      const isLastMoveSquare = isLastMoveFrom || isLastMoveTo;

                      // Chess.com style colors with last move highlighting
                      let backgroundColor;
                      if (isSelected) {
                        backgroundColor = '#f7dc6f'; // Yellow highlight for selected
                      } else if (isLastMoveSquare) {
                        // Use chess.com style yellow-green for last move
                        backgroundColor = isLightSquare ? '#f7f769' : '#bbcb44'; // Lighter and darker yellow-green
                      } else {
                        backgroundColor = isLightSquare ? '#f0d9b5' : '#b58863'; // Chess.com colors
                      }

                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          data-square={`${displayRow},${displayCol}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: isMobile ? '2.2rem' : '2.8rem',
                            cursor: piece ? 'pointer' : 'default',
                            transition: 'background-color 0.15s ease, border 0.15s ease',
                            userSelect: 'none',
                            fontWeight: 'bold',
                            width: '100%',
                            height: '100%',
                            minWidth: 0,
                            minHeight: 0,
                            boxSizing: 'border-box',
                            backgroundColor,
                            border: isSelected ? '2px solid #f39c12' : 'none',
                            // Position this square at its display coordinates
                            gridColumn: displayCol + 1,
                            gridRow: displayRow + 1,
                            opacity: isDragging ? 0.3 : 1,
                            // Mobile optimization
                            WebkitTouchCallout: 'none',
                            WebkitUserSelect: 'none',
                            touchAction: 'none'
                          }}
                          onMouseDown={(e) => handleMouseDown(e, displayRow, displayCol)}
                          onMouseUp={(e) => handleMouseUp(e, displayRow, displayCol)}
                          onTouchStart={(e) => handleTouchStart(e, displayRow, displayCol)}
                          onTouchEnd={(e) => handleTouchEnd(e, displayRow, displayCol)}
                          onClick={() => handleSquareClick(displayRow, displayCol)}
                          onTouchCancel={() => {
                            setDraggedPiece(null);
                            setSelectedSquare(null);
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected && !draggedPiece) {
                              // Only apply hover effect if not selected and not part of last move
                              if (!isLastMoveSquare) {
                                e.target.style.backgroundColor = isLightSquare ? '#ead5aa' : '#a67c52';
                              }
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected && !draggedPiece) {
                              // Restore proper color based on square state
                              if (isLastMoveSquare) {
                                e.target.style.backgroundColor = isLightSquare ? '#f7f769' : '#bbcb44';
                              } else {
                                e.target.style.backgroundColor = isLightSquare ? '#f0d9b5' : '#b58863';
                              }
                            }
                          }}
                        >
                          {piece && !isDragging && (
                            <div
                              className={`chess-piece ${isPieceWhite(piece) ? 'chess-piece-white' : 'chess-piece-black'}`}
                              style={{
                                width: '80%',
                                height: '80%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {getPieceSVG(piece)}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* Hint Arrow */}
                  {showHint && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      zIndex: 10
                    }}>
                      <svg style={{ width: '100%', height: '100%' }}>
                        <defs>
                          <marker id="arrowhead" markerWidth="10" markerHeight="7"
                                  refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#ffeb3b" stroke="#f39c12" strokeWidth="1"/>
                          </marker>
                        </defs>
                        <line
                          x1={`${(showHint.from.col + 0.5) * 12.5}%`}
                          y1={`${(showHint.from.row + 0.5) * 12.5}%`}
                          x2={`${(showHint.to.col + 0.5) * 12.5}%`}
                          y2={`${(showHint.to.row + 0.5) * 12.5}%`}
                          stroke="#ffeb3b"
                          strokeWidth="6"
                          markerEnd="url(#arrowhead)"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Dragged piece */}
                  {draggedPiece && (
                    <div style={{
                      position: 'fixed',
                      pointerEvents: 'none',
                      width: isMobile ? '44px' : '60px',
                      height: isMobile ? '44px' : '60px',
                      zIndex: 1000,
                      left: `${dragOffset.x}px`,
                      top: `${dragOffset.y}px`,
                      transform: 'translate(-50%, -50%)'
                    }}>
                      <div
                        className={`chess-piece ${isPieceWhite(draggedPiece.piece) ? 'chess-piece-white' : 'chess-piece-black'}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {getPieceSVG(draggedPiece.piece)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right rank numbers */}
                {Array.from({length: 8}, (_, i) => {
                  const rank = trainingMode && openingDatabases[trainingMode]?.color === 'black' ? i + 1 : 8 - i;
                  return (
                    <div key={`right-${i}`} style={{
                      gridColumn: 10,
                      gridRow: i + 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {rank}
                    </div>
                  );
                })}

                {/* Bottom file letters */}
                {Array.from({length: 8}, (_, i) => {
                  const file = trainingMode && openingDatabases[trainingMode]?.color === 'black'
                    ? String.fromCharCode(104 - i) // h,g,f,e,d,c,b,a
                    : String.fromCharCode(97 + i);  // a,b,c,d,e,f,g,h
                  return (
                    <div key={`bottom-${i}`} style={{
                      gridColumn: i + 2,
                      gridRow: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {file}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={styles.sidebar}>
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>Game Status</h3>
              <p style={{marginBottom: '8px', color: '#6b7280'}}>
                Current turn: <span style={{textTransform: 'capitalize', fontWeight: '600', color: '#374151'}}>{currentPlayer}</span>
              </p>
              <p style={{color: '#6b7280'}}>Move: {Math.ceil(moveHistory.length / 2)}</p>
              <p style={{marginTop: '8px', fontWeight: '600', color:
                ((opening.color === 'white' && currentPlayer === 'white') ||
                 (opening.color === 'black' && currentPlayer === 'black')) ? '#16a34a' : '#ea580c'
              }}>
                {((opening.color === 'white' && currentPlayer === 'white') ||
                  (opening.color === 'black' && currentPlayer === 'black')) ? 'Your turn!' : 'Opponent thinking...'}
              </p>
              {lastMove && (
                <p style={{fontSize: '0.8rem', color: '#9ca3af', marginTop: '8px'}}>
                  Last move: {getSquareName(lastMove.from.row, lastMove.from.col)}-{getSquareName(lastMove.to.row, lastMove.to.col)} (ID: {lastMove.id})
                </p>
              )}
            </div>

            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>Score</h3>
              <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', marginBottom: '8px'}}>
                {score.correct}/{score.total}
              </p>
              <p style={{fontSize: '0.9rem', color: '#6b7280'}}>
                {score.total > 0 ? `${Math.round((score.correct / score.total) * 100)}% accuracy` : 'No moves yet'}
              </p>
            </div>

            {feedback && (
              <div style={{
                borderRadius: '12px',
                padding: '20px',
                fontWeight: '600',
                backgroundColor: feedback.includes('✓') ? '#dcfce7' : feedback.includes('✗') ? '#fef2f2' : '#f0f9ff',
                color: feedback.includes('✓') ? '#166534' : feedback.includes('✗') ? '#991b1b' : '#1e40af',
                border: feedback.includes('✓') ? '2px solid #22c55e' : feedback.includes('✗') ? '2px solid #ef4444' : '2px solid #3b82f6',
                transform: feedback.includes('✗') ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}>
                <p style={{ margin: 0 }}>{feedback}</p>
                {showHint && (
                  <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: '#b45309',
                      backgroundColor: '#fef3c7',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #fbbf24'
                    }}>
                      💡 Hint: Move from {showHint.notation.split('-')[0]} to {showHint.notation.split('-')[1]}
                    </p>
                    {undoStack.length > 0 && (
                      <button
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                        onClick={undoLastMove}
                      >
                        <Undo2 size={16} />
                        Try Again
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>Move History</h3>
              <div style={{maxHeight: '200px', overflowY: 'auto', fontSize: '0.9rem'}}>
                {moveHistory.length === 0 ? (
                  <p style={{color: '#9ca3af', fontStyle: 'italic'}}>No moves yet</p>
                ) : (
                  moveHistory.map((move, index) => (
                    <div key={index} style={{display: 'flex', marginBottom: '4px'}}>
                      <span style={{width: '30px', color: '#9ca3af'}}>{Math.ceil((index + 1) / 2)}.</span>
                      <span style={{color: index % 2 === 0 ? '#374151' : '#6b7280'}}>
                        {move}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessTrainingApp;
