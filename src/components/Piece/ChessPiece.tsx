import React from 'react';
import { PieceType, PieceColor } from '../../types/chess';
import './ChessPiece.css';

interface ChessPieceProps {
    pieceType: PieceType,
    pieceColor: PieceColor,
    size: number,
    isSelected: boolean,
    inCheck?: boolean,
    onClick: () => void
}

const ChessPiece: React.FC<ChessPieceProps> = ({pieceType, pieceColor, size, isSelected, inCheck, onClick}) => {
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
            className={`chess-piece ${pieceColor} ${isSelected ? 'selected' : ''} ${isSelected ? 'selected' : ''} ${inCheck ? 'inCheck' : ''}`}
            style={{
                width: size,
                height: size,
                fontSize: size * 0.7
            }}
            onClick={onClick}
            title={`${getPieceName(pieceType)} (${pieceColor === 'white' ? 'Белые' : 'Чёрные'})`}
            draggable={false}
        >
            <div className="piece-symbol">
                {getPieceSymbol(pieceType, pieceColor)}
            </div>

            {isSelected && (
                <div className="selection-ring" />
            )}

            <div className={`piece-glow ${pieceColor}`} />
        </div>
    );
}

export default ChessPiece;