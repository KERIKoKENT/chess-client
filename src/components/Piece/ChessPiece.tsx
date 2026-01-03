import React from 'react';
import { Piece, PieceType } from '../../types/chess';
import './ChessPiece.css';

interface ChessPieceProps {
    piece: Piece,
    size: number,
    isSelected: boolean,
    onClick: () => void
}

const ChessPiece: React.FC<ChessPieceProps> = ({piece, size, isSelected, onClick}) => {
    const getPieceSymbol = (type: PieceType, color: string) => {
        const symbols: Record<PieceType, { white: string, black: string}> = {
            king: { white: '♔', black: '♚' },
            queen: { white: '♕', black: '♛' },
            rook: { white: '♖', black: '♜' },
            bishop: { white: '♗', black: '♝' },
            knight: { white: '♘', black: '♞' },
            pawn: { white: '♙', black: '♟' },    
        }

        return symbols[type][color as 'white' | 'black'];
    };

    const getPieceName = (type: PieceType) => {
        const names: Record<PieceType, string> = {
            king: 'Король',
            queen: 'Ферзь',
            rook: 'Ладья',
            bishop: 'Офицер',
            knight: 'Конь',
            pawn: 'Пешка'
        };

        return names[type];
    };

    return (
        <div
            className={`chess-piece ${piece.color} ${isSelected ? 'selected' : ''}`}
            style={{
                width: size,
                height: size,
                fontSize: size * 0.7
            }}
            onClick={onClick}
            title={`${getPieceName(piece.type)} (${piece.color === 'white' ? 'Белые' : 'Чёрные'})`}
            draggable={false}
        >
            <div className="piece-symbol">
                {getPieceSymbol(piece.type, piece.color)}
            </div>

            {isSelected && (
                <div className="selection-ring" />
            )}

            <div className={`piece-glow ${piece.color}`} />
        </div>
    );
}

export default ChessPiece;