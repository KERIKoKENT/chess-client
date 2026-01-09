import React from 'react';
import { PieceType, PieceColor, Square, squareToCoords } from '../../types/chess';
import ChessPiece from '../Piece/ChessPiece';
import './PromotionPopup.css';

interface PromotionPopupProps {
    squareSize: number,
    visible: boolean,
    color: PieceColor,
    boardOrientation: PieceColor,
    targetSquare: Square | null,
    onSelect: (type: PieceType) => void;
}

const PromotionPopup: React.FC<PromotionPopupProps> = ({ squareSize, visible, color, boardOrientation, targetSquare, onSelect }) => {
    if (!visible || !targetSquare) return null;

    const pieces: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

    const coords = squareToCoords(targetSquare);
    const width = squareSize * 4;
    const height = squareSize;

    const popupOnUpSide = (color === boardOrientation) === (color === 'white');
    const leftOffset = 5;
    const topOffset = color === boardOrientation ? -15 : 7;

    let top = popupOnUpSide ? -(squareSize) : 8 * squareSize;
    if (color === 'white') top += topOffset
    else top = 7 * squareSize - (top - topOffset);


    const left = boardOrientation === 'white' 
                            ? squareSize * (coords.x - 1.5) - leftOffset
                            : squareSize * (5.5 - coords.x) - leftOffset

    return (
        <div className="promotion-popup" style={{ width, height, top, left }}>
            {pieces.map(type => (
                <ChessPiece
                    key={type}
                    pieceType={type}
                    pieceColor={color}
                    size={squareSize * 0.9}
                    isSelected={false}
                    onClick={() => onSelect(type)}
                />
            ))}
        </div>
    );
};

export default PromotionPopup;