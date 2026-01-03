import React, { use, useState } from 'react';
import ChessBoard from './components/Board/ChessBoard';
import { Piece, Square, PieceColor } from './types/chess';
import { INIT_POS } from './types/chess';
import { getValidMoves } from './utils/gameLogic';
import logo from './logo.svg';
import './App.css';

const App: React.FC = () => {
  const [pieces, setPieces] = useState<Piece[]>(INIT_POS);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [turn, setTurn] = useState<PieceColor>('white');
  

  const handlePieceSelect = (piece: Piece) => {
    if (piece.color !== turn) return;

    if (selectedPiece?.id === piece.id) {
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    const moves = getValidMoves(piece, pieces);

    setSelectedPiece(piece);
    setValidMoves(moves);
  };

  const handleSquareClick = (square: Square) => {
    if (!selectedPiece) return;

    if (!validMoves.includes(square)) {
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    setPieces(prev => {
      const filtered = prev.filter(p => p.position !== square);

      return filtered.map(p => p.id === selectedPiece.id ? { ...p, position: square, hasMoved: true } : p);
    });

    setSelectedPiece(null);
    setValidMoves([]);
    setTurn(prev => (prev === 'white' ? 'black' : 'white'));
  };

  return (
    <div style={{ padding: 20 }}>

        <ChessBoard pieces={pieces} selectedPiece={selectedPiece} validMoves={validMoves} 
        onPieceSelect={handlePieceSelect} onSquareClick={handleSquareClick} boardSize={600} />
    </div>
  );
}

export default App;
