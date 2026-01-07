import React, { useState } from 'react';
import { Square, Piece, isLightSquare, allSquares, GameState, Move } from '../../types/chess';
import { getEnPasaunt } from '../../utils/gameLogic'
import ChessPiece from '../Piece/ChessPiece';
import './ChessBoard.css';  

interface ChessBoardProps {
    game: GameState;
    selectedPiece: Piece | null;
    pieceValidMoves: Move[];
    onSquareClick: (square: Square) => void;
    onPieceSelect: (piece: Piece) => void;
    boardSize?: number;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
    game,
    selectedPiece,
    pieceValidMoves,
    onSquareClick,
    onPieceSelect,
    boardSize = 600,
}) => {
    const squareSize = boardSize / 8;
    const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');

    const getPieceAtSquare = (square: Square): Piece | undefined => {
        return game.pieces.find(piece => piece.position === square);
    }

    const RenderSquares = () => {
        const squares = [];
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

        const fileOrder = boardOrientation === 'white' ? files : [...files].reverse();
        const rankOrder = boardOrientation === 'white' ? [...ranks].reverse() : ranks;

        for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
            for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
                const file = fileOrder[fileIndex];
                const rank = rankOrder[rankIndex];
                const square = `${file}${rank}` as Square;
                const piece = getPieceAtSquare(square);
                const isLight = isLightSquare(square);
                const isSelected = selectedPiece?.position === square;
                const isValidMove = pieceValidMoves.find(p => p.to === square)?.to.includes(square);
                const isCapture = isValidMove && (piece !== undefined);

                squares.push(
                    <div 
                        key={square}
                        className={`chess-square 
                        ${isLight ? 'light' : 'dark'} 
                        ${isSelected ? 'selected' : ''}
                        ${isValidMove ? 'valid-move' : ''}
                        ${isCapture ? 'capture-square' : ''}`}
                        style = { {
                            width: squareSize,
                            height: squareSize
                        } }
                        onClick={() => onSquareClick(square)}
                        data-square={square}
                    >
                        {isValidMove && !isCapture && (
                            <div className="move-indicator"/>
                        )}

                        {isCapture && (
                            <div className="capture-indicator"/>
                        )}

                        {piece && (
                            <ChessPiece 
                                piece={piece}
                                size={squareSize * 0.85}
                                isSelected={isSelected}
                                onClick={() => onPieceSelect(piece)}
                            />
                        )}
                    </div>
                );
            }
        }

        return squares;
    };

    return (
        <div className="chess-board-container">
            <div className="board-controls">
                <button onClick={() => setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')} className="orientation-button">
                    Поворот доски
                </button>
            </div>

            <div className="chess-board"
                style={{
                    width: boardSize,
                    height: boardSize
                }}
            >
                {RenderSquares()}
            </div>
        </div>
    );

};

export default ChessBoard;