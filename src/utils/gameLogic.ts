import { Piece, Square, PieceType, files, ranks, squareToCoords, coordsToSquare, PieceColor } from '../types/chess';

export function getValidMoves(piece: Piece, pieces: Piece[]): Square[] {
    const validMoves: Square[] = [];
    const { x: fromX, y: fromY } = squareToCoords(piece.position);

    if (piece.type === 'pawn') {
        return getPawnMoves(piece, pieces);
    }

    const directions = getPieceDirections(piece.type, piece.color);

    for (const [dx, dy] of directions) {
        if (piece.type === 'knight') {
            const newX = fromX + dx;
            const newY = fromY + dy;

            if (isWithinBoard(newX, newY)) {
                const targetSquare = coordsToSquare(newX, newY);
                const targetPiece = getPieceAtSquare(targetSquare, pieces);

                if (!targetPiece || targetPiece.color !== piece.color) {
                    validMoves.push(targetSquare);
                }
            }
        }
        else {
            let steps = 1;
            while (true) {
                const newX = fromX + steps * dx;
                const newY = fromY + steps * dy;

                if (!isWithinBoard(newX, newY)) break;

                const targetSquare = coordsToSquare(newX, newY);
                const targetPiece = getPieceAtSquare(targetSquare, pieces);
                
                if (!targetPiece) {
                    validMoves.push(targetSquare);
                }
                else if (targetPiece.color !== piece.color) {
                    validMoves.push(targetSquare);
                    break;
                } else { 
                    break; 
                }

                // Только слон, ладья и ферзь могут ходить на несколько клеток
                if (piece.type === 'king') {
                    break;
                }

                steps++;
            }
        }
    }

    return validMoves;
}

function getPawnMoves(piece: Piece, pieces: Piece[]): Square[] {
    const moves: Square[] = [];
    const { x: fromX, y: fromY } = squareToCoords(piece.position);
    
    const direction = piece.color === 'white' ? 1 : -1;
    const startRank = piece.color === 'white' ? 1 : 6;
    
    
    const oneStepY = fromY + direction;
    if (isWithinBoard(fromX, oneStepY)) {
        const oneStepSquare = coordsToSquare(fromX, oneStepY);
        if (!getPieceAtSquare(oneStepSquare, pieces)) {
            moves.push(oneStepSquare);
            if (fromY === startRank) {
                const twoStepY = fromY + 2 * direction;
                const twoStepSquare = coordsToSquare(fromX, twoStepY);
                const middleSquare = coordsToSquare(fromX, oneStepY);
                
                if (!getPieceAtSquare(twoStepSquare, pieces) && 
                    !getPieceAtSquare(middleSquare, pieces)) {
                    moves.push(twoStepSquare);
                }
            }
        }
    }
    
    const takeMoves = [
        { x: fromX - 1, y: fromY + direction },
        { x: fromX + 1, y: fromY + direction }
    ];
    
    for (const { x, y } of takeMoves) {
        if (isWithinBoard(x, y)) {
            const targetSquare = coordsToSquare(x, y);
            const targetPiece = getPieceAtSquare(targetSquare, pieces);
            
            if (targetPiece && targetPiece.color !== piece.color) {
                moves.push(targetSquare);
            }
        }
    }
    
    return moves;
}

function isWithinBoard(x: number, y: number): boolean {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
}

function getPieceAtSquare(square: Square, pieces: Piece[]): Piece | undefined {
    return pieces.find(piece => piece.position === square);
}

function getPieceDirections(type: PieceType, color: PieceColor): [number, number][] {
    switch(type) {
        case 'king':
            return [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];

        case 'queen':
            return [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];

        case 'rook':
            return [
                [-1, 0], [1, 0],
                [0, -1], [0, 1]
            ];

        case 'bishop':
            return [
                [-1, -1], [-1, 1],
                [1, -1], [1, 1]
            ];

        case 'knight':
            return [
                [-2, -1], [-2, 1],
                [-1, -2], [-1, 2],
                [1, -2], [1, 2],
                [2, -1], [2, 1]
            ];

        case 'pawn':
            return [];

        default:
            return [];
    }
}