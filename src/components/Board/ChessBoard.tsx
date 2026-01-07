import React, { useState } from 'react';
import { Square, Piece, isLightSquare, allSquares, GameState, Move, PieceType } from '../../types/chess';
import { getEnPasaunt } from '../../utils/gameLogic'
import ChessPiece from '../Piece/ChessPiece';
import PromotionPopup from '../PromotionPopup/PromotionPopup';
import './ChessBoard.css';  

interface ChessBoardProps {
    game: GameState;
    selectedPiece: Piece | null;
    pieceValidMoves: Move[];
    onSquareClick: (square: Square) => void;
    onPieceSelect: (piece: Piece) => void;
    onPromotionSelect: (type: PieceType) => void;
    boardSize?: number;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
    game,
    selectedPiece,
    pieceValidMoves,
    onSquareClick,
    onPieceSelect,
    onPromotionSelect,
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
                const move = pieceValidMoves.find(p => p.to === square);
                const isValidMove = move?.to.includes(square);
                const isCapture = isValidMove && ((piece !== undefined) || (move?.enPasaunt === true));

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
                                pieceType={piece.type}
                                pieceColor={piece.color}
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

            <div className="promotion-menu">
                {game.promotionMenu.visible && game.promotionMenu.piece && (
                    <PromotionPopup 
                        visible={game.promotionMenu.visible}
                        color={game.promotionMenu.piece.color}
                        targetSquare={game.promotionMenu.targetSquare}
                        onSelect={(t) => onPromotionSelect(t)}
                    />
                )}
            </div>
        </div>
    );

};

export default ChessBoard;