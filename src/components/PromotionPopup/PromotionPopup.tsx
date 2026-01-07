import React from 'react';
import { PieceType, PieceColor, Square } from '../../types/chess';
import ChessPiece from '../Piece/ChessPiece';

interface PromotionPopupProps {
    visible: boolean,
    color: PieceColor,
    targetSquare: Square | null,
    onSelect: (type: PieceType) => void;
}

const PromotionPopup: React.FC<PromotionPopupProps> = ({ visible, color, targetSquare, onSelect }) => {
    if (!visible || !targetSquare) return null;

    const pieces: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

    return (
        <div className="promotion-popup">
            {pieces.map(type => (
                <ChessPiece
                    pieceType={type}
                    pieceColor={color}
                    size={30 * 0.85}
                    isSelected={false}
                    onClick={() => onSelect(type)}
                />
            ))}
        </div>
    );
};

export default PromotionPopup;