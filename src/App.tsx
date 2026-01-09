import React, { use, useState, useEffect } from 'react';
import ChessBoard from './components/Board/ChessBoard';
import { Piece, Square, PieceColor, squareToCoords, coordsToSquare, GameState, startGame, PromotionState, PieceType, DragState } from './types/chess';
import { makeMove, getPieceAtSquare, oppositeColor, getValidMoves, isKingInCheck } from './utils/gameLogic';
import './App.css';

const App: React.FC = () => {

  const [game, setGame] = useState<GameState>(() => startGame());
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const pieceValidMoves = selectedPiece ? game.validMoves[selectedPiece.id] : [];

  const handlePieceSelect = (piece: Piece) => {

    if (game.promotionMenu.visible) return;
    if (piece.color !== game.turn) return;

    if (selectedPiece?.id === piece.id) {
      setSelectedPiece(null);
      return;
    }

    setSelectedPiece(piece);
  };

  const handleSquareClick = (square: Square) => {
    if (!selectedPiece || game.promotionMenu.visible) return;

    const madeMove = pieceValidMoves.find(p => p.to === square);

    if (!madeMove) {
      const clickedPiece = getPieceAtSquare(square, game.pieces);
      if (clickedPiece?.color === selectedPiece.color)
        setSelectedPiece(clickedPiece);
      else
        setSelectedPiece(null);
      return;
    }

    setGame(prev => makeMove({
      ...prev,
      promotionMenu: (madeMove.promotion ? {
        piece: selectedPiece,
        targetSquare: square,
        visible: true
      } : prev.promotionMenu),
      moveHistory: [
        ...prev.moveHistory,
        {
          pieceId: selectedPiece.id,
          from: selectedPiece.position,
          to: square,
          capturedPiece: getPieceAtSquare(square, prev.pieces)
        }
      ]
    }, selectedPiece, madeMove));

    setSelectedPiece(null);
  };

  const handlePromotion = (type: PieceType) => {
    const { piece, targetSquare } = game.promotionMenu;
    if (!piece || !targetSquare) return;

    const newPieces = game.pieces.map(p =>
      p.id === piece.id ? { ...p, type, position: targetSquare, hasMoved: true } : p
    )

    const newBoard = {
      ...game,
      pieces: newPieces,
      promotionMenu: {
        piece: null,
        targetSquare: null,
        visible: false
      }
    }

    const validMoves = getValidMoves(newBoard.turn, newBoard);

    const hasAnyMoves = Object.values(validMoves).some(m => m.length > 0);
    const check = isKingInCheck(newBoard.turn, newPieces);
    const stalemate = !hasAnyMoves && !check;
    const checkmate = !hasAnyMoves && check;

    setGame(prev => ({
      ...newBoard,
      check: check ? newBoard.turn : null,
      stalemate,
      checkmate,
      validMoves
    }));
  }

  const restartGame = () => {
    setGame(startGame());
  }

  return (
    <div style={{ padding: 20 }}>

      <ChessBoard game={game} selectedPiece={selectedPiece} pieceValidMoves={pieceValidMoves}
        onPieceSelect={handlePieceSelect} onSquareClick={handleSquareClick} onPromotionSelect={handlePromotion} onRestartGame={restartGame} />

    </div>
  );
}

export default App;
