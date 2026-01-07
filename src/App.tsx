import React, { use, useState } from 'react';
import ChessBoard from './components/Board/ChessBoard';
import { Piece, Square, PieceColor, squareToCoords, coordsToSquare, GameState, startGame } from './types/chess';
import { makeMove, getPieceAtSquare } from './utils/gameLogic';
import './App.css';

const App: React.FC = () => {

  const [game, setGame] = useState<GameState>(() => startGame());
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const pieceValidMoves = selectedPiece ? game.validMoves[selectedPiece.id] : [];
  

  const handlePieceSelect = (piece: Piece) => {

    if (piece.color !== game.turn) return;

    if (selectedPiece?.id === piece.id) {
      setSelectedPiece(null);
      return;
    }

    setSelectedPiece(piece);
  };

  const handleSquareClick = (square: Square) => {
    if (!selectedPiece) return;

    const madeMove = pieceValidMoves.find(p => p.to === square);

    if (!madeMove) {
      setSelectedPiece(null);
      return;
    }


    setGame(prev => makeMove({
      ...prev,
      moveHistory: [
        ...prev.moveHistory,
        {
          pieceId: selectedPiece.id,
          from: selectedPiece.position,
          to: square,
          capturedPiece: getPieceAtSquare(square, prev.pieces)
        }
      ]
    }, selectedPiece, madeMove) );

    setSelectedPiece(null);
  };

  return (
    <div style={{ padding: 20 }}>

        <ChessBoard game={game} selectedPiece={selectedPiece} pieceValidMoves={pieceValidMoves} 
        onPieceSelect={handlePieceSelect} onSquareClick={handleSquareClick} boardSize={600} />
    </div>
  );
}

export default App;
