import { Piece, Square, PieceType, files, ranks, squareToCoords, coordsToSquare, PieceColor, MAX_RAY_STEPS } from '../types/chess';

export function getValidMoves(piece: Piece, pieces: Piece[]): Square[] {
    let validMoves: Square[] = [];
    const { x: fromX, y: fromY } = squareToCoords(piece.position);

    if (piece.type === 'pawn') {
        validMoves = getPawnMoves(piece, pieces);
    }

    const directions = getPieceDirections(piece.type);

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

    const safeMoves: Square[] = [];

    for (const move of validMoves) {
        const newBoard = makeMove(pieces, piece, move);
    
        if (!isKingInCheck(piece.color, newBoard)) {
            safeMoves.push(move);
        }
    }

    if(piece.type === 'king' && piece.hasMoved === false) {
        const { x, y } = squareToCoords(piece.position);
        const rightSide = getPieceAtSquare(coordsToSquare(x+3, y), pieces);
        const leftSide = getPieceAtSquare(coordsToSquare(x-4, y), pieces);

        const oppColor = piece.color === 'white' ? 'black' : 'white';

        if(rightSide?.type === 'rook' && rightSide?.hasMoved === false) {
            if(!isSquareAttacked(coordsToSquare((x+1), y), oppColor, pieces) &&
                !isSquareAttacked(coordsToSquare((x+2), y), oppColor, pieces) &&
                !getPieceAtSquare(coordsToSquare((x+1), y), pieces) && 
                !getPieceAtSquare(coordsToSquare((x+2), y), pieces))
            { 
                safeMoves.push(coordsToSquare(x+2, y)); 
            }
        }   

        if(leftSide?.type === 'rook' && leftSide?.hasMoved === false) {
            if(!isSquareAttacked(coordsToSquare((x-1), y), oppColor, pieces) &&
                !isSquareAttacked(coordsToSquare((x-2), y), oppColor, pieces) &&
                !getPieceAtSquare(coordsToSquare((x-1), y), pieces) && 
                !getPieceAtSquare(coordsToSquare((x-2), y), pieces) &&
                !getPieceAtSquare(coordsToSquare((x-3), y), pieces))
            {
                safeMoves.push(coordsToSquare(x-2, y));
            }
        }
    }

    return safeMoves;
}

function makeMove(pieces: Piece[], piece: Piece, move: Square): Piece[] {
    return pieces
            .filter(p => p.position !== move)
            .map(p => p.id === piece.id 
                ? {...p, position: move, hasMoved: true}
                : {...p}
             );
}

export function isSquareAttacked(square: Square, byColor: PieceColor, pieces: Piece[]): boolean {
    const { x: squareX, y: squareY } = squareToCoords(square);

    // Отдельная проверка на атаку пешкой
    const pawnDirection = byColor === 'black' ? 1 : -1;
    const targetY = squareY + pawnDirection;

    for (const dx of [-1, 1]) {
        const ax = squareX + dx;

        if(isWithinBoard(ax, targetY)) {
            const attackSquare = coordsToSquare(ax, targetY);
            const piece = getPieceAtSquare(attackSquare, pieces);
            if (piece?.color === byColor && piece.type === 'pawn') {
                return true;
            }
        }
    }

    // Все возможные направления атаки кроме пешек
    const attackConfigs = [

        { dirs: 'knight' as PieceType, 
            check: (p: Piece) => p.type === 'knight', 
            maxSteps: 1 },

        { dirs: 'king' as PieceType,
          check: (p: Piece) => p.type === 'king', 
          maxSteps: 1 },
        
        { dirs: 'rook' as PieceType, 
          check: (p: Piece) => ['rook', 'queen'].includes(p.type), 
          maxSteps: MAX_RAY_STEPS },
        
        { dirs: 'bishop' as PieceType, 
          check: (p: Piece) => ['bishop', 'queen'].includes(p.type), 
          maxSteps: MAX_RAY_STEPS }
    ];
    
    for (const config of attackConfigs) {
        if (checkAttackDirections(squareX, squareY, byColor, pieces, config)) {
            return true;
        }
    }
    
    return false;
}

export function isKingInCheck(color: PieceColor, pieces: Piece[]): boolean {
    const king = pieces.find(p => p.type === 'king' && p.color === color);
    if(king) return isSquareAttacked(king.position, (color === 'white' ? 'black' : 'white'), pieces);
    return false;
}

function checkAttackDirections(
    x: number, 
    y: number, 
    byColor: PieceColor, 
    pieces: Piece[],
    config: { dirs: PieceType, check: (piece: Piece) => boolean, maxSteps: number }
): boolean {
    for (const [dx, dy] of getPieceDirections(config.dirs)) {
        let steps = 1;
        
        while (steps <= config.maxSteps) {
            const newX = x + steps * dx;
            const newY = y + steps * dy;
            
            if (!isWithinBoard(newX, newY)) break;
            
            const piece = getPieceAtSquare(coordsToSquare(newX, newY), pieces);
            
            if (piece) {
                if (piece.color === byColor && config.check(piece)) {
                    return true;
                }
                
                if (config.maxSteps === MAX_RAY_STEPS) break;
            }
            
            if (steps === config.maxSteps) break;
            steps++;
        }
    }
    
    return false;
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

function getPieceDirections(type: PieceType): [number, number][] {
    switch(type) {
        case 'king':
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

        default:
            return [];
    }
}