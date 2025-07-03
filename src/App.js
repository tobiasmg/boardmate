import React, { useState, useEffect } from 'react';
import { ChevronLeft, RotateCcw, Play, BookOpen, Target } from 'lucide-react';

const ChessTrainingApp = () => {
  // State for responsive design
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial board setup
  const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
  ];

  const [board, setBoard] = useState(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameMode, setGameMode] = useState('menu');
  const [trainingMode, setTrainingMode] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showHint, setShowHint] = useState(null);
  const [needsReplay, setNeedsReplay] = useState(false);

  // Opening databases
  const openingDatabases = {
    sicilianDragon: {
      name: "Sicilian Defence - Accelerated Dragon",
      color: "black",
      moves: {
        "": ["e2-e4"],
        "e2-e4": ["c7-c5"],
        "e2-e4,c7-c5": ["g1-f3"],
        "e2-e4,c7-c5,g1-f3": ["g7-g6"],
        "e2-e4,c7-c5,g1-f3,g7-g6": ["d2-d4"],
        "e2-e4,c7-c5,g1-f3,g7-g6,d2-d4": ["c5-d4"],
        "e2-e4,c7-c5,g1-f3,g7-g6,d2-d4,c5-d4": ["f3-d4"],
        "e2-e4,c7-c5,g1-f3,g7-g6,d2-d4,c5-d4,f3-d4": ["f8-g7"],
        "e2-e4,c7-c5,g1-f3,g7-g6,d2-d4,c5-d4,f3-d4,f8-g7": ["c2-c4", "b1-c3", "f2-f3"],
        "e2-e4,c7-c5,g1-f3,g7-g6,d2-d4,c5-d4,f3-d4,f8-g7,c2-c4": ["b8-c6"],
        "e2-e4,c7-c5,g1-f3,g7-g6,d2-d4,c5-d4,f3-d4,f8-g7,b1-c3": ["b8-c6"],
      }
    },
    scotchGame: {
      name: "Scotch Game",
      color: "white",
      moves: {
        "": ["e2-e4"],
        "e2-e4": ["e7-e5"],
        "e2-e4,e7-e5": ["g1-f3"],
        "e2-e4,e7-e5,g1-f3": ["b8-c6"],
        "e2-e4,e7-e5,g1-f3,b8-c6": ["d2-d4"],
        "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4": ["e5-d4"],
        "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4": ["f3-d4"],
        "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4": ["f8-c5", "g8-f6", "d8-h4"],
        "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,f8-c5": ["d4-b5", "d4-c6"],
        "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f3-d4,g8-f6": ["d4-c6", "b1-c3"],
      }
    },
    scotchGambit: {
      name: "Scotch Gambit",
      color: "white",
      moves: {
        "": ["e2-e4"],
        "e2-e4": ["e7-e5"],
        "e2-e4,e7-e5": ["g1-f3"],
        "e2-e4,e7-e5,g1-f3": ["b8-c6"],
        "e2-e4,e7-e5,g1-f3,b8-c6": ["d2-d4"],
        "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4": ["e5-d4"],
        "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4": ["f1-c4"],
        "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4": ["f8-c5", "g8-f6", "f7-f5"],
        "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,f8-c5": ["c2-c3", "e1-g1"],
        "e2-e4,e7-e5,g1-f3,b8-c6,d2-d4,e5-d4,f1-c4,g8-f6": ["e4-e5", "c2-c3"],
      }
    }
  };

  // Piece Unicode symbols (chess.com style)
  const pieceSymbols = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
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
        return rowDiff <= 1 && colDiff <= 1;

      default:
        return false;
    }
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
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];

    console.log(`Making move: ${getSquareName(fromRow, fromCol)}-${getSquareName(toRow, toCol)} (${piece})`);

    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;

    const moveNotation = `${getSquareName(fromRow, fromCol)}-${getSquareName(toRow, toCol)}`;
    const updatedMoveHistory = [...moveHistory, moveNotation];

    setBoard(newBoard);
    setMoveHistory(updatedMoveHistory);
    setCurrentPlayer(prevPlayer => prevPlayer === 'white' ? 'black' : 'white');

    console.log('Updated move history:', updatedMoveHistory);

    return { moveNotation, updatedMoveHistory };
  };

  const makeOpponentMove = (currentMoveHistory) => {
    console.log('makeOpponentMove called');
    console.log('Current moveHistory when making opponent move:', currentMoveHistory);

    const opening = openingDatabases[trainingMode];
    const nextMoveKey = currentMoveHistory.join(',');
    const opponentMoves = opening.moves[nextMoveKey];

    console.log('Looking for opponent move with key:', `"${nextMoveKey}"`);
    console.log('Available moves for this key:', opponentMoves);

    if (opponentMoves && opponentMoves.length > 0) {
      // Wait a bit to simulate thinking time
      setTimeout(() => {
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

      }, 800);
    } else {
      console.log('No opponent moves found for key:', `"${nextMoveKey}"`);
      setFeedback('End of opening line - great job!');
    }
  };

  const checkMove = (userMove, currentMoveHistory) => {
    const opening = openingDatabases[trainingMode];
    // Use the moveHistory that was passed in, excluding the user's move we just made
    const moveKey = currentMoveHistory.slice(0, -1).join(',');
    const expectedMoves = opening.moves[moveKey] || [];

    console.log('Checking user move:', userMove);
    console.log('Current move history:', currentMoveHistory);
    console.log('Move key for lookup:', `"${moveKey}"`);
    console.log('Expected moves:', expectedMoves);
    console.log('Move is correct?', expectedMoves.includes(userMove));

    // Clear any existing hints
    setShowHint(null);
    setNeedsReplay(false);

    if (expectedMoves.includes(userMove)) {
      setFeedback('✓ Correct move!');
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));

      console.log('Move was correct, calling makeOpponentMove...');

      // Wait for move to be processed, then make opponent move
      setTimeout(() => {
        setFeedback('Opponent is thinking...');
        // Wait a bit more for React state to update, then pass the current move history
        setTimeout(() => {
          makeOpponentMove(currentMoveHistory);
        }, 300);
      }, 500);
    } else {
      console.log('Move was incorrect, NOT calling makeOpponentMove');
      setFeedback(`✗ Wrong move! Try the suggested move.`);
      setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
      setNeedsReplay(true);

      // Show hint arrow for the best move
      if (expectedMoves.length > 0) {
        const bestMove = expectedMoves[0];
        const [fromSquare, toSquare] = bestMove.split('-');
        const [fromRow, fromCol] = parseSquareName(fromSquare);
        const [toRow, toCol] = parseSquareName(toSquare);

        // Convert to display coordinates
        const [fromDisplayRow, fromDisplayCol] = getDisplayCoordinates(fromRow, fromCol);
        const [toDisplayRow, toDisplayCol] = getDisplayCoordinates(toRow, toCol);

        setShowHint({
          from: { row: fromDisplayRow, col: fromDisplayCol },
          to: { row: toDisplayRow, col: toDisplayCol },
          notation: bestMove
        });
      }

      // Clear feedback after longer delay to give user time to see the hint
      setTimeout(() => {
        setFeedback('');
        setShowHint(null);
        setNeedsReplay(false);
      }, 5000);
    }
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
    setDraggedPiece({
      piece,
      fromRow: row,
      fromCol: col,
      displayRow,
      displayCol
    });
    setDragOffset({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    });
    setSelectedSquare([row, col]);
  };

  const handleMouseMove = (e) => {
    if (!draggedPiece) return;
    e.preventDefault();
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
      setTimeout(() => setFeedback(''), 1000);
      return;
    }

    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      const fromPiece = board[fromRow][fromCol];

      if (row === fromRow && col === fromCol) {
        setSelectedSquare(null);
        return;
      }

      if (isValidMove(fromRow, fromCol, row, col, fromPiece)) {
        const { moveNotation, updatedMoveHistory } = makeMove(fromRow, fromCol, row, col);
        checkMove(moveNotation, updatedMoveHistory);
        setSelectedSquare(null);
      } else {
        setSelectedSquare(piece && isPieceWhite(piece) === (currentPlayer === 'white') ? [row, col] : null);
      }
    } else {
      if (piece && isPieceWhite(piece) === (currentPlayer === 'white')) {
        setSelectedSquare([row, col]);
      }
    }
  };

  const startTraining = (mode) => {
    console.log('Starting training for mode:', mode);
    setTrainingMode(mode);
    setGameMode('training');
    setBoard(initialBoard);
    setMoveHistory([]);
    setSelectedSquare(null);
    setFeedback('');
    setScore({ correct: 0, total: 0 });
    setDraggedPiece(null);
    setShowHint(null);
    setNeedsReplay(false);

    // Set the correct starting player based on opening
    const opening = openingDatabases[mode];
    if (opening.color === 'black') {
      // If training as black, white moves first
      console.log('Training as black - white will move first');
      setCurrentPlayer('white');
      setFeedback('White is making the first move...');

      // Make the first white move automatically after a short delay
      setTimeout(() => {
        console.log('Making automatic first white move');
        const firstMove = opening.moves[""][0]; // Should be "e2-e4"
        console.log('First move from database:', firstMove);

        if (firstMove) {
          const [fromSquare, toSquare] = firstMove.split('-');
          const [fromRow, fromCol] = parseSquareName(fromSquare);
          const [toRow, toCol] = parseSquareName(toSquare);

          console.log(`Making first move: ${fromSquare} to ${toSquare}`);

          // Use makeMove to handle the first move properly
          setTimeout(() => {
            makeMove(fromRow, fromCol, toRow, toCol);
            setFeedback('Your turn! Play 1...c5 for the Sicilian Defense.');
          }, 100);
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
    setBoard(initialBoard);
    setMoveHistory([]);
    setSelectedSquare(null);
    setFeedback('');
    setDraggedPiece(null);
    setShowHint(null);
    setNeedsReplay(false);

    // Reset to correct starting player and make first move if needed
    const opening = openingDatabases[trainingMode];
    if (opening.color === 'black') {
      setCurrentPlayer('white');
      setFeedback('White is making the first move...');

      // Make the first white move automatically after reset
      setTimeout(() => {
        const firstMove = opening.moves[""][0]; // Should be "e2-e4"

        if (firstMove) {
          const [fromSquare, toSquare] = firstMove.split('-');
          const [fromRow, fromCol] = parseSquareName(fromSquare);
          const [toRow, toCol] = parseSquareName(toSquare);

          console.log(`Reset: Making first move ${fromSquare} to ${toSquare}`);

          // Use makeMove to handle the first move properly
          setTimeout(() => {
            makeMove(fromRow, fromCol, toRow, toCol);
            setFeedback('Your turn! Play 1...c5 for the Sicilian Defense.');
          }, 100);
        }
      }, 1000);
    } else {
      setCurrentPlayer('white');
      setFeedback('Your turn! Make your opening move.');
    }
  };

  const backToMenu = () => {
    setGameMode('menu');
    setTrainingMode(null);
  };

  // Handle global mouse events for drag and drop
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (draggedPiece) {
        setDragOffset({
          x: e.clientX,
          y: e.clientY
        });
      }
    };

    const handleGlobalMouseUp = () => {
      if (draggedPiece) {
        setDraggedPiece(null);
        setSelectedSquare(null);
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggedPiece]);

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
              <p style={styles.cardText}>Practice the Accelerated Dragon as Black. White moves automatically - you learn the best responses!</p>
              <button style={{...styles.button, backgroundColor: '#dc2626'}}>
                Train as Black
              </button>
            </div>

            <div style={styles.card} onClick={() => startTraining('scotchGame')}>
              <div style={{...styles.cardHeader, color: '#2563eb'}}>
                <BookOpen size={24} />
                <h2 style={{marginLeft: '10px'}}>Scotch Game</h2>
              </div>
              <p style={styles.cardText}>Learn the Scotch Game as White. Black moves automatically - focus on mastering your attacking lines!</p>
              <button style={{...styles.button, backgroundColor: '#2563eb'}}>
                Train as White
              </button>
            </div>

            <div style={styles.card} onClick={() => startTraining('scotchGambit')}>
              <div style={{...styles.cardHeader, color: '#16a34a'}}>
                <Play size={24} />
                <h2 style={{marginLeft: '10px'}}>Scotch Gambit</h2>
              </div>
              <p style={styles.cardText}>Master the Scotch Gambit as White. Black responds automatically - learn the aggressive sacrificial lines!</p>
              <button style={{...styles.button, backgroundColor: '#16a34a'}}>
                Train as White
              </button>
            </div>
          </div>

          <div style={{background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'}}>
            <h3 style={{fontSize: '1.5rem', marginBottom: '20px', color: '#374151'}}>How it works</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
              <div>
                <h4 style={{fontWeight: '600', marginBottom: '10px', color: '#374151'}}>🎯 Focus on Your Side</h4>
                <p style={{color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5'}}>The opponent moves automatically based on opening theory. You only need to learn your moves!</p>
              </div>
              <div>
                <h4 style={{fontWeight: '600', marginBottom: '10px', color: '#374151'}}>🤖 Smart AI Responses</h4>
                <p style={{color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5'}}>AI plays realistic variations from grandmaster games. Learn to handle different responses.</p>
              </div>
              <div>
                <h4 style={{fontWeight: '600', marginBottom: '10px', color: '#374151'}}>📈 Immediate Feedback</h4>
                <p style={{color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5'}}>Get instant feedback on your moves. Learn the best responses for each position.</p>
              </div>
            </div>
            <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9'}}>
              <p style={{color: '#0c4a6e', fontSize: '0.9rem', textAlign: 'center'}}>
                <strong>💡 Tip:</strong> Wait for the opponent to move automatically, then make your best move. The AI will show you when it's your turn!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const opening = openingDatabases[trainingMode];

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
            <p style={{color: '#a16207'}}>Playing as {opening.color}</p>
          </div>

          <button style={styles.navButton} onClick={resetGame}>
            <RotateCcw size={20} style={{marginRight: '5px'}} />
            Reset
          </button>
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
                {/* Top rank numbers */}
                {Array.from({length: 8}, (_, i) => {
                  const rank = trainingMode && openingDatabases[trainingMode]?.color === 'black' ? i + 1 : 8 - i;
                  return (
                    <div key={`top-${i}`} style={{
                      gridColumn: i + 2,
                      gridRow: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {rank}
                    </div>
                  );
                })}

                {/* Left file letters */}
                {Array.from({length: 8}, (_, i) => {
                  const file = trainingMode && openingDatabases[trainingMode]?.color === 'black'
                    ? String.fromCharCode(104 - i) // h,g,f,e,d,c,b,a
                    : String.fromCharCode(97 + i);  // a,b,c,d,e,f,g,h
                  return (
                    <div key={`left-${i}`} style={{
                      gridColumn: 1,
                      gridRow: i + 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {file}
                    </div>
                  );
                })}

                {/* The chess board */}
                <div style={styles.board} onMouseMove={handleMouseMove}>
                  {board.flatMap((row, rowIndex) =>
                    row.map((piece, colIndex) => {
                      // Get display coordinates (potentially flipped)
                      const [displayRow, displayCol] = getDisplayCoordinates(rowIndex, colIndex);
                      const isLightSquare = (displayRow + displayCol) % 2 === 0;
                      const isSelected = selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex;
                      const isDragging = draggedPiece && draggedPiece.fromRow === rowIndex && draggedPiece.fromCol === colIndex;

                      // Chess.com style colors
                      let backgroundColor;
                      if (isSelected) {
                        backgroundColor = '#f7dc6f'; // Yellow highlight for selected
                      } else {
                        backgroundColor = isLightSquare ? '#f0d9b5' : '#b58863'; // Chess.com colors
                      }

                      // Enhanced piece styling - fully white pieces
                      const pieceColor = isPieceWhite(piece) ? '#ffffff' : '#2c2c2c';
                      const textShadow = isPieceWhite(piece)
                        ? '2px 2px 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.5)'
                        : '1px 1px 2px rgba(255,255,255,0.4), 0 0 2px rgba(255,255,255,0.2)';

                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: isMobile ? '2.8rem' : '3.8rem',
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
                            color: pieceColor,
                            textShadow: piece ? textShadow : 'none',
                            // Position this square at its display coordinates
                            gridColumn: displayCol + 1,
                            gridRow: displayRow + 1,
                            opacity: isDragging ? 0.3 : 1
                          }}
                          onMouseDown={(e) => handleMouseDown(e, displayRow, displayCol)}
                          onMouseUp={(e) => handleMouseUp(e, displayRow, displayCol)}
                          onClick={() => handleSquareClick(displayRow, displayCol)}
                          onMouseEnter={(e) => {
                            if (!isSelected && !draggedPiece) {
                              e.target.style.backgroundColor = isLightSquare ? '#ead5aa' : '#a67c52';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected && !draggedPiece) {
                              e.target.style.backgroundColor = isLightSquare ? '#f0d9b5' : '#b58863';
                            }
                          }}
                        >
                          {piece && !isDragging && pieceSymbols[piece]}
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
                      fontSize: isMobile ? '2.8rem' : '3.8rem',
                      fontWeight: 'bold',
                      color: isPieceWhite(draggedPiece.piece) ? '#ffffff' : '#2c2c2c',
                      textShadow: isPieceWhite(draggedPiece.piece)
                        ? '2px 2px 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.5)'
                        : '1px 1px 2px rgba(255,255,255,0.4), 0 0 2px rgba(255,255,255,0.2)',
                      zIndex: 1000,
                      left: `${dragOffset.x}px`,
                      top: `${dragOffset.y}px`,
                      transform: 'translate(-50%, -50%)'
                    }}>
                      {pieceSymbols[draggedPiece.piece]}
                    </div>
                  )}
                </div>

                {/* Right file letters */}
                {Array.from({length: 8}, (_, i) => {
                  const file = trainingMode && openingDatabases[trainingMode]?.color === 'black'
                    ? String.fromCharCode(104 - i) // h,g,f,e,d,c,b,a
                    : String.fromCharCode(97 + i);  // a,b,c,d,e,f,g,h
                  return (
                    <div key={`right-${i}`} style={{
                      gridColumn: 10,
                      gridRow: i + 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {file}
                    </div>
                  );
                })}

                {/* Bottom rank numbers */}
                {Array.from({length: 8}, (_, i) => {
                  const rank = trainingMode && openingDatabases[trainingMode]?.color === 'black' ? i + 1 : 8 - i;
                  return (
                    <div key={`bottom-${i}`} style={{
                      gridColumn: i + 2,
                      gridRow: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {rank}
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
                  <p style={{
                    margin: '10px 0 0 0',
                    fontSize: '0.9rem',
                    color: '#b45309',
                    backgroundColor: '#fef3c7',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #fbbf24'
                  }}>
                    💡 Hint: Move from {showHint.notation.split('-')[0]} to {showHint.notation.split('-')[1]}
                  </p>
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
