import React, { use, useState } from 'react';
import ChessBoard from './components/Board/ChessBoard';
import { Piece, Square, PieceColor, squareToCoords, coordsToSquare, GameState, startGame } from './types/chess';
import { INIT_POS } from './types/chess';
import { getPieceValidMoves, getValidMoves, isKingInCheck, isSquareAttacked, oppositeColor, makeMove } from './utils/gameLogic';
import logo from './logo.svg';
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

    if (!pieceValidMoves.includes(square)) {
      setSelectedPiece(null);
      return;
    }


    const newBoard = makeMove(game, selectedPiece, square);

    setGame(newBoard);
    console.log(newBoard);

    setSelectedPiece(null);
  };

  return (
    <div style={{ padding: 20 }}>

        <ChessBoard pieces={game.pieces} selectedPiece={selectedPiece} pieceValidMoves={pieceValidMoves} 
        onPieceSelect={handlePieceSelect} onSquareClick={handleSquareClick} boardSize={600} />
    </div>
  );
}

export default App;
